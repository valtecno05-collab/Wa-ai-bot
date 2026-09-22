import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';

// Fungsi Kirim Pesan / Gambar ke Fonnte
async function sendWAMessage(to: string, message: string, urlMedia?: string) {
  try {
    const bodyData: any = { target: to, message: message };
    if (urlMedia) bodyData.url = urlMedia; // Jika ada gambar produk

    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
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

    // 1. Cek Control Switch AI
    let { data: lead } = await supabase.from('leads').select('*').eq('phone_number', sender).single();
    if (lead && lead.is_ai_active === false) {
      await supabase.from('leads').update({ last_message: rawMessage, updated_at: new Date().toISOString() }).eq('phone_number', sender);
      return NextResponse.json({ status: 'ai_paused' });
    }

    if (!lead) {
      await supabase.from('leads').insert([{ phone_number: sender, status: 'ACTIVE', last_message: rawMessage }]);
    }

    // 2. AMBIL KATALOG PRODUK
    const { data: products } = await supabase.from('products').select('*');
    let productContext = "KATALOG PRODUK YANG TERSEDIA:\n";
    let matchedImage = "";

    if (products && products.length > 0) {
      products.forEach((p) => {
        productContext += `- Nama: ${p.name} | Seri: ${p.series} | Harga: Rp${Number(p.price).toLocaleString('id-ID')} | Warna: ${p.colors} | URL Gambar: ${p.image_url}\n`;
        
        // Deteksi jika customer menyebutkan nama/seri produk spesifik
        if (rawMessage.toLowerCase().includes(p.name.toLowerCase()) || (p.series && rawMessage.toLowerCase().includes(p.series.toLowerCase()))) {
          matchedImage = p.image_url;
        }
      });
    }

    // 3. AMBIL DYNAMIC PROMPTS
    const { data: configs } = await supabase.from('ai_config').select('system_prompt').eq('is_active', true);
    let systemPrompt = configs ? configs.map(c => c.system_prompt).join("\n") : "Bantu jawab customer dengan ramah.";

    // 4. MINTA GEMINI AI MERESPONS
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = `${systemPrompt}\n\n${productContext}\n\nCustomer bertatanya: "${rawMessage}"\n\nJawab pertanyaan dengan menyebutkan detail harga, spesifikasi, dan pilihan warna jika tersedia.`;

    const result = await model.generateContent(fullPrompt);
    const aiReply = result.response.text();

    // 5. KIRIM BALASAN (Beserta Gambar Jika Ada Produk yang Cocok)
    await sendWAMessage(sender, aiReply, matchedImage || undefined);

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
