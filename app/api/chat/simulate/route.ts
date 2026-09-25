import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message, phone_number } = await req.json();
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lower = message.toLowerCase().trim();

    // 1. Ambil Semua Pengetahuan AI Terbaru dari Supabase
    const { data: knowledge } = await supabase.from('knowledge_base').select('*').eq('is_active', true);
    const { data: rules } = await supabase.from('ai_rules').select('*').eq('is_active', true);

    // 2. Cari Aturan / Logika yang Cocok dengan Pertanyaan
    if (knowledge && knowledge.length > 0) {
      for (const item of knowledge) {
        const itemContent = (item.content || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();

        // Cek jika pertanyaan user mengandung kata kunci dari aturan yang ditraining
        const words = lower.split(' ');
        const isMatch = words.some(w => w.length > 2 && (itemContent.includes(w) || itemTitle.includes(w)));

        if (isMatch) {
          return NextResponse.json({ reply: item.content });
        }
      }
    }

    // 3. Respon Default Jika Belum Ada Logika Khusus
    return NextResponse.json({
      reply: 'Halo Kak! Terima kasih sudah menghubungi TECNO Official Store Jogja. Ada yang bisa kami bantu terkait unit atau promo hari ini?'
    });

  } catch (err: any) {
    return NextResponse.json({ reply: 'Sistem sedang memperbarui data.' });
  }
}
