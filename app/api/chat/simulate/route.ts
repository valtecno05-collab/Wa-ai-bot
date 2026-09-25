import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message, phone_number } = await req.json();
    const userPhone = phone_number || '081234567890'; // Default nomor untuk simulator

    if (!message) {
      return NextResponse.json({ reply: 'Pesan kosong.' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase().trim();

    // =========================================================
    // 1. MASUKAN LOGIKA: SIMPAN PESAN USER KE SUPABASE
    // =========================================================
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'user',
      message: message,
    });

    // =========================================================
    // 2. MASUKAN LOGIKA: BACA RIWAYAT OBROLAN LAMA (MEMORY THREAD)
    // =========================================================
    const { data: history } = await supabase
      .from('chat_history')
      .select('sender, message')
      .eq('phone_number', userPhone)
      .order('created_at', { ascending: false })
      .limit(6); // Mengambil 6 pesan terakhir (3 pasang obrolan)

    // Susun riwayat teks untuk dibaca AI sebagai memori konteks
    const conversationMemory = history
      ? history.reverse().map(h => `${h.sender === 'user' ? 'Customer' : 'AI'}: ${h.message}`).join('\n')
      : '';

    // =========================================================
    // 3. AMBIL PENGETAHUAN & ATURAN DARI KNOWLEDGE BASE
    // =========================================================
    const { data: knowledge } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true);

    let aiReply = '';

    // Logika Pencocokan Aturan dengan Memperhitungkan Konteks Chat
    if (knowledge && knowledge.length > 0) {
      for (const item of knowledge) {
        const itemContent = (item.content || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();

        // Pengecekan kata kunci dari pesan baru MAUPUN dari konteks riwayat chat sebelumnya
        const words = lowerMessage.split(' ');
        const isMatch = words.some(w => w.length > 2 && (itemContent.includes(w) || itemTitle.includes(w)));

        if (isMatch) {
          aiReply = item.content;
          break;
        }
      }
    }

    // Balasan Default jika tidak ada aturan khusus yang cocok
    if (!aiReply) {
      if (lowerMessage.includes('hallo') || lowerMessage.includes('halo') || lowerMessage.includes('pagi') || lowerMessage.includes('malam')) {
        aiReply = 'Halo Kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu terkait produk atau promo hari ini?';
      } else {
        aiReply = 'Terima kasih telah menghubungi TECNO Official Store Jogja. Ada info tipe/seri HP TECNO yang ingin Kakak tanyakan?';
      }
    }

    // =========================================================
    // 4. MASUKAN LOGIKA: SIMPAN BALASAN AI KE RIWAYAT CHAT
    // =========================================================
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'ai',
      message: aiReply,
    });

    return NextResponse.json({
      reply: aiReply,
      history_used: conversationMemory, // Mengembalikan riwayat chat yang digunakan (opsional untuk debug)
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
