import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lowerMsg = message.toLowerCase().trim();

    // 1. Ambil data Knowledge Base terbaru dari Supabase
    const { data: knowledgeList } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    const rulesContext = knowledgeList && knowledgeList.length > 0
      ? knowledgeList.map((k) => `- [${k.title}]: ${k.content}`).join('\n')
      : 'Belum ada aturan khusus.';

    if (!apiKey) {
      return NextResponse.json({
        reply: '⚠️ GEMINI_API_KEY belum dikonfigurasi di Environment Variables.',
        explanation: 'API Key Kosong'
      });
    }

    let prompt = '';

    if (mode === 'admin') {
      // Jika Admin memberikan instruksi baru via chat, simpan otomatis ke Supabase
      if (
        lowerMsg.includes('jawab') || 
        lowerMsg.includes('perbaiki') || 
        lowerMsg.includes('ubah') || 
        lowerMsg.includes('harus') || 
        lowerMsg.includes('lokasi') ||
        lowerMsg.includes('toko')
      ) {
        await supabase.from('knowledge_base').insert([
          {
            title: `Instruksi Admin: ${message.slice(0, 25)}...`,
            content: message
          }
        ]);
      }

      prompt = `
      Anda adalah AI Assistant & Debugger cerdas untuk sistem TECNO Jogja.
      Admin sedang berdiskusi dengan Anda untuk menginstruksikan atau memperbaiki aturan balasan AI.
      
      Daftar Knowledge Base saat ini (${knowledgeList?.length || 0} aturan):
      ${rulesContext}

      Pesan dari Admin: "${message}"

      Instruksi: Tanggapi pesan Admin dengan singkat, ramah, dan konfirmasikan bahwa instruksi tersebut dipahami dan sudah/akan diterapkan pada mode User.
      `;
    } else {
      prompt = `
      Anda adalah Customer Service resmi TECNO Official Store Jogja yang melayani pelanggan dengan ramah (sapa pelanggan dengan sapaan "Kak").
      
      Aturan & Informasi Wajib dari Knowledge Base:
      ${rulesContext}

      Pesan dari Customer: "${message}"

      Instruksi: Jawab pertanyaan customer berdasarkan aturan Knowledge Base di atas secara natural.
      `;
    }

    // 2. Pemanggilan Gemini API menggunakan SDK terbaru @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text || 'Tidak ada tanggapan dari AI.';

    return NextResponse.json({
      reply: responseText,
      explanation: mode === 'admin' 
        ? `🧠 **Admin Debugger:** Berhasil berdiskusi. Total Knowledge Terdeteksi: ${(knowledgeList?.length || 0)}`
        : `🧠 **AI Customer Service:** Merespons berdasarkan aturan Knowledge Base.`
    });

  } catch (err: any) {
    console.error('Simulate API Error:', err);
    return NextResponse.json({ 
      reply: 'Maaf, terjadi kendala saat memproses komunikasi dengan AI.', 
      explanation: err.message || 'Terjadi kesalahan sistem.' 
    }, { status: 500 });
  }
}
