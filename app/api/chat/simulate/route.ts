import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Inisialisasi Gemini API (Pastikan GEMINI_API_KEY / GOOGLE_API_KEY sudah terdaftar di Environment Variables Vercel)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json(); // mode: 'admin' | 'user'
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lowerMsg = message.toLowerCase().trim();

    // 1. Ambil seluruh data Knowledge Base dari database Supabase
    const { data: knowledgeList, error: dbError } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Supabase fetch error:', dbError);
    }

    const rulesContext = knowledgeList && knowledgeList.length > 0
      ? knowledgeList.map((k, i) => `- [${k.title}]: ${k.content}`).join('\n')
      : 'Belum ada aturan khusus yang dimasukkan ke knowledge base.';

    // Jika API Key Gemini belum diset, fallback ke respons pintar berbasis aturan
    if (!apiKey) {
      return NextResponse.json({
        reply: `⚠️ Peringatan: GEMINI_API_KEY belum dikonfigurasi di Environment Variables Vercel. Menggunakan mode cadangan.\n\nPesan Anda diterima dalam mode [${mode.toUpperCase()}]. Total Knowledge: ${knowledgeList?.length || 0}`,
        explanation: 'API Key AI tidak ditemukan.'
      });
    }

    // Gunakan model Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';

    if (mode === 'admin') {
      // 🛠️ ADMIN MODE: Diskusi, Evaluasi, dan Perbaikan Bug
      // Jika admin memberikan perintah perbaikan/instruksi baru, simpan otomatis ke Knowledge Base!
      if (lowerMsg.includes('perbaiki') || lowerMsg.includes('ubah') || lowerMsg.includes('harus') || lowerMsg.includes('tambahkan') || lowerMsg.includes('jangan')) {
        await supabase.from('knowledge_base').insert([
          {
            title: `Instruksi Admin: ${message.slice(0, 20)}...`,
            content: message
          }
        ]);
      }

      prompt = `
      Anda adalah AI Assistant & Debugger cerdas untuk sistem manajemen pusat kontrol TECNO Jogja.
      Admin sedang berdiskusi dengan Anda untuk melatih atau memperbaiki perilaku AI.
      
      Daftar Knowledge Base saat ini (${knowledgeList?.length || 0} aturan terdaftar):
      ${rulesContext}

      Pesan dari Admin: "${message}"

      Instruksi: Berikan respons sebagai AI yang kooperatif, ramah, dan profesional. Konfirmasikan apakah Anda telah memahami instruksi atau perbaikan bug tersebut, dan jelaskan bagaimana perubahan ini akan diterapkan pada mode User.
      `;
    } else {
      // 👤 USER MODE: Simulasi Customer Chat
      prompt = `
      Anda adalah Customer Service resmi TECNO Official Store Jogja yang melayani pelanggan dengan ramah, informatif, dan menggunakan bahasa Indonesia yang baik (panggil pelanggan dengan sapaan "Kak" jika relevan).
      
      PENTING: Anda WAJIB mematuhi dan menggunakan panduan/aturan berikut yang telah ditetapkan oleh Admin di Knowledge Base:
      ${rulesContext}

      Pesan dari Customer: "${message}"

      Instruksi: Jawablah pertanyaan customer tersebut secara natural dengan mengacu pada aturan Knowledge Base di atas.
      `;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({
      reply: responseText,
      explanation: mode === 'admin' 
        ? `🧠 **Admin Debugger Active:** Berdiskusi langsung dengan AI. Total Knowledge Terdeteksi: ${knowledgeList?.length || 0}`
        : `🧠 **AI Customer Service:** Merespons berdasarkan ${knowledgeList?.length || 0} aturan Knowledge Base aktif.`,
      currentKnowledgeCount: knowledgeList?.length || 0
    });

  } catch (err: any) {
    console.error('Simulate API Error:', err);
    return NextResponse.json({ 
      reply: 'Maaf, terjadi kendala saat memproses komunikasi dengan AI.', 
      explanation: err.message 
    }, { status: 500 });
  }
}
