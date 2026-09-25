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

    // 1. CEK KNOWLEDGE BASE TERUPDATE (REAL-TIME)
    const { data: knowledge } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });

    if (knowledge && knowledge.length > 0) {
      // Cari instruksi/pengetahuan yang paling cocok dengan pertanyaan user
      const matchedKB = knowledge.find(k => {
        const contentLower = (k.content || '').toLowerCase();
        const titleLower = (k.title || '').toLowerCase();
        
        // Memecah kata kunci untuk pencocokan pintar
        const keywords = lower.split(' ');
        return keywords.some(word => word.length > 3 && (contentLower.includes(word) || titleLower.includes(word)));
      });

      if (matchedKB) {
        return NextResponse.json({ reply: matchedKB.content });
      }
    }

    // 2. CEK FAQ
    const { data: faqs } = await supabase.from('faqs').select('*');
    if (faqs && faqs.length > 0) {
      const matchedFaq = faqs.find(f => lower.includes(f.question.toLowerCase()));
      if (matchedFaq) {
        return NextResponse.json({ reply: matchedFaq.answer });
      }
    }

    // 3. SAPAAN DEFAULT JIKA BELUM ADA ATURAN KHUSUS
    if (lower.includes('hallo') || lower.includes('halo') || lower.includes('pagi') || lower.includes('malam') || lower.includes('siang')) {
      return NextResponse.json({
        reply: 'Halo Kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu hari ini?'
      });
    }

    return NextResponse.json({
      reply: 'Terima kasih telah menghubungi TECNO Official Store Jogja. Ada yang bisa kami bantu terkait produk atau promo kami?'
    });

  } catch (err: any) {
    return NextResponse.json({ reply: 'Sistem sedang menyesuaikan memori AI.' });
  }
}
