import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Daftar model cadangan jika server Google sedang sibuk/overload (503)
const AVAILABLE_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

async function generateAIResponseWithFallback(prompt: string) {
  let lastError = null;

  for (const modelName of AVAILABLE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        return { text, usedModel: modelName };
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} gagal/overload, mencoba model cadangan...`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Semua model Gemini sedang sibuk.');
}

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lowerMsg = message.toLowerCase().trim();

    // 1. Ambil data Knowledge Base dari Supabase
    const { data: knowledgeList } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    const rulesContext = knowledgeList && knowledgeList.length > 0
      ? knowledgeList.map((k, i) => `- [${k.title}]: ${k.content}`).join('\n')
      : 'Belum ada aturan khusus.';

    if (!apiKey) {
      return NextResponse.json({
        reply: '⚠️ GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables.',
        explanation: 'API Key Kosong'
      });
    }

    let prompt = '';

    if (mode === 'admin') {
      // Jika Admin memberikan instruksi perbaikan via chat
      if (lowerMsg.includes('jawab') || lowerMsg.includes('perbaiki') || lowerMsg.includes('ubah') || lowerMsg.includes('harus') || lowerMsg.includes('lokasi')) {
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

      Instruksi: Tanggapi pesan Admin dengan singkat, ramah, dan pastikan Anda mengonfirmasi bahwa aturan baru tersebut telah disimpan dan siap diterapkan pada Mode User.
      `;
    } else {
      prompt = `
      Anda adalah Customer Service resmi TECNO Official Store Jogja yang melayani pelanggan dengan ramah (panggil pelanggan dengan sapaan "Kak").
      
      Aturan & Informasi Wajib dari Knowledge Base:
      ${rulesContext}

      Pesan dari Customer: "${message}"

      Instruksi: Jawab pertanyaan customer berdasarkan aturan Knowledge Base di atas.
      `;
    }

    // 2. Panggil fungsi AI dengan proteksi Auto-Fallback
    const { text: responseText, usedModel } = await generateAIResponseWithFallback(prompt);

    return NextResponse.json({
      reply: responseText,
      explanation: mode === 'admin' 
        ? `🧠 **Admin Debugger (${usedModel}):** Berhasil memproses instruksi. Total Knowledge Terdeteksi: ${(knowledgeList?.length || 0) + 1}`
        : `🧠 **AI Customer Service (${usedModel}):** Merespons berdasarkan aturan Knowledge Base aktif.`
    });

  } catch (err: any) {
    console.error('Simulate API Error:', err);
    return NextResponse.json({ 
      reply: 'Maaf, server AI sedang mengalami beban tinggi (overload). Silakan coba kirim ulang dalam beberapa detik.', 
      explanation: err.message || 'Error 503 Server Unavailable' 
    }, { status: 500 });
  }
}
