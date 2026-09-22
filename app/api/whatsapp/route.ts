import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';

async function sendWAMessage(to: string, message: string) {
  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: to, message }),
    });
  } catch (err) {
    console.error('Error sendWAMessage:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sender = body.sender;
    const rawMessage = (body.message || '').trim();

    if (!sender || !rawMessage) return NextResponse.json({ status: 'ignored' });

    // 1. Cek Data Customer & Status AI Takeover
    let { data: lead } = await supabase.from('leads').select('*').eq('phone_number', sender).single();

    if (lead && lead.is_ai_active === false) {
      await supabase.from('leads').update({ last_message: rawMessage, updated_at: new Date().toISOString() }).eq('phone_number', sender);
      return NextResponse.json({ status: 'ai_paused' });
    }

    if (!lead) {
      await supabase.from('leads').insert([{ phone_number: sender, status: 'ACTIVE', last_message: rawMessage }]);
    }

    // 2. AMBIL FITUR & PROMPT AKTIF DARI DATABASE DASHBOARD
    const { data: configs } = await supabase
      .from('ai_config')
      .select('feature_name, system_prompt')
      .eq('is_active', true);

    // Gabungkan seluruh prompt fitur menjadi 1 Master Instruction
    let compiledSystemPrompt = "ATURAN UTAMA SISTEM:\n";
    if (configs && configs.length > 0) {
      configs.forEach((item) => {
        compiledSystemPrompt += `\n--- FITUR: ${item.feature_name.toUpperCase()} ---\n${item.system_prompt}\n`;
      });
    } else {
      compiledSystemPrompt += "Jawab pertanyaan pelanggan dengan ramah dan sopan.";
    }

    // 3. GENERATE RESPON MENGGUNAKAN GEMINI AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = `${compiledSystemPrompt}\n\nPesan Customer: ${rawMessage}\nRespon Admin:`;
    
    const result = await model.generateContent(fullPrompt);
    const aiReply = result.response.text();

    // 4. KIRIM KE WHATSAPP & SIMPAN DOKUMEN CHAT
    await sendWAMessage(sender, aiReply);
    await supabase.from('leads').update({
      last_message: rawMessage,
      last_reply: aiReply,
      updated_at: new Date().toISOString()
    }).eq('phone_number', sender);

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
