import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const groqApiKey = process.env.GROQ_API_KEY || '';

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

    if (!groqApiKey) {
      return NextResponse.json({
        reply: '⚠️ GROQ_API_KEY belum dikonfigurasi di Environment Variables Vercel.',
        explanation: 'API Key Kosong'
      });
    }

    let systemPrompt = '';

    if (mode === 'admin') {
      // Simpan otomatis jika admin memberikan instruksi perbaikan/knowledge baru
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

      systemPrompt = `
      Anda adalah AI Assistant & Debugger cerdas untuk sistem TECNO Jogja.
      Admin sedang berdiskusi dengan Anda untuk menginstruksikan atau memperbaiki aturan balasan AI.
      
      Daftar Knowledge Base saat ini (${knowledgeList?.length || 0} aturan):
      ${rulesContext}

      Tanggapi pesan Admin dengan singkat, ramah, dan konfirmasikan bahwa instruksi tersebut dipahami dan sudah tersimpan di Knowledge Base.
      `;
    } else {
      systemPrompt = `
      Anda adalah Customer Service resmi TECNO Official Store Jogja yang melayani pelanggan dengan ramah (sapa pelanggan dengan sapaan "Kak").
      
      Aturan & Informasi Wajib dari Knowledge Base:
      ${rulesContext}

      Jawab pertanyaan customer berdasarkan aturan Knowledge Base di atas secara natural dan profesional.
      `;
    }

    // 2. Panggil Groq API via HTTP Native Fetch (Sangat stabil & Cepat)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    const resultData = await groqResponse.json();

    if (!groqResponse.ok) {
      throw new Error(resultData.error?.message || 'Gagal terhubung ke Groq AI');
    }

    const responseText = resultData.choices?.[0]?.message?.content || 'Tidak ada response dari AI.';

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
