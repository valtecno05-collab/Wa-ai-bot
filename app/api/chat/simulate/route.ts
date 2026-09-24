import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lower = message.toLowerCase().trim();

    // 1. Cek Sapaan Umum
    if (lower.includes('hallo') || lower.includes('halo') || lower.includes('malam') || lower.includes('pagi') || lower.includes('siang')) {
      return NextResponse.json({
        reply: 'Halo Kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu terkait produk atau promo TECNO hari ini?'
      });
    }

    // 2. Cek FAQ dari Database Supabase
    const { data: faqs } = await supabase.from('faqs').select('*');
    if (faqs && faqs.length > 0) {
      const matchedFaq = faqs.find(f => lower.includes(f.question.toLowerCase()));
      if (matchedFaq) {
        return NextResponse.json({ reply: matchedFaq.answer });
      }
    }

    // 3. Cek Knowledge Base
    const { data: knowledge } = await supabase.from('knowledge_base').select('*');
    if (knowledge && knowledge.length > 0) {
      const matchedKB = knowledge.find(k => lower.includes(k.title.toLowerCase()) || lower.includes(k.content.toLowerCase()));
      if (matchedKB) {
        return NextResponse.json({ reply: matchedKB.content });
      }
    }

    // Default Balasan AI jika belum ada aturan spesifik
    return NextResponse.json({
      reply: 'Terima kasih telah menghubungi TECNO Official Store Jogja. Ada info tipe/seri HP TECNO yang ingin Kakak tanyakan?'
    });

  } catch (err: any) {
    return NextResponse.json({ reply: 'Maaf, sistem sedang memproses pembaruan aturan.' });
  }
}
