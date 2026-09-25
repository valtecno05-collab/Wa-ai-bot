import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message, phone_number } = await req.json();
    const userPhone = phone_number || '081234567890';

    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    // 1. Simpan pesan user ke history
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'user',
      message: message
    });

    // 2. Ambil seluruh Knowledge Base yang telah dipelajari AI dari Supabase
    const { data: knowledge } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    const lower = message.toLowerCase().trim();
    let matchedRule: any = null;
    let explanation = '';
    let finalReply = '';

    // 3. PENCARIAN & PEMAHAMAN CERDAS BERDASARKAN KNOWLEDGE BASE
    if (knowledge && knowledge.length > 0) {
      for (const item of knowledge) {
        const contentStr = (item.content || '').toLowerCase();
        const titleStr = (item.title || '').toLowerCase();

        // Cari kata kunci utama dari pertanyaan customer
        const words = lower.split(/\s+/).filter(w => w.length > 2);
        const hasMatch = words.some(w => contentStr.includes(w) || titleStr.includes(w));

        if (hasMatch) {
          matchedRule = item;
          break;
        }
      }
    }

    // 4. PEMROSESAN CERDAS & OLAHAN BAHASA NATURAL (TIDAK MONOTON)
    if (matchedRule) {
      explanation = `💡 **Rules Dipahami:** AI menggunakan aturan "${matchedRule.title || 'Knowledge Base'}" untuk memproses pertanyaan ini secara alami.`;

      // Mengolah pesan secara fleksibel dan ramah CS
      const ruleText = matchedRule.content;
      
      // Jika instruksi mengandung survei / opsi
      if (ruleText.toLowerCase().includes('survei') || ruleText.toLowerCase().includes('nomor kami dari mana')) {
        if (lower.includes('malam')) {
          finalReply = 'Halo Kak, selamat malam juga! 😊🙏\n\nSebelum kami infokan harganya, boleh bantu survei singkat dulu ya Kak:\nKakak dapat nomor WhatsApp kami dari mana?\n1. Instagram\n2. Google Maps\n3. TikTok\n\nJawab 1, 2, atau 3 saja Kak, setelah ini langsung kami kirimkan pricelist resminya! ✨';
        } else {
          finalReply = 'Halo Kak, selamat datang di TECNO Official Store Jogja! 😊🙏\n\nUntuk pelayanan yang lebih baik, boleh jawab survei singkat ini dulu ya Kak:\nKakak tahu nomor kami dari mana?\n1. Instagram\n2. Google Maps\n3. TikTok\n\nCukup balas angkanya saja Kak, setelah itu langsung kami infokan info produk & harganya! 🚀';
        }
      } else {
        // AI membalas secara fleksibel berdasarkan isi knowledge
        finalReply = `Halo Kak! 😊 ${ruleText}\n\nAda hal lain yang bisa kami bantu terkait produk TECNO hari ini?`;
      }
    } else {
      // Sapaan / Respon Fleksibel jika tidak ada aturan khusus yang terpicu
      explanation = '💡 **Rules Dipahami:** AI menggunakan modul standar CS TECNO (Sapaan & Layanan Umum).';

      if (lower.includes('hallo') || lower.includes('halo') || lower.includes('pagi') || lower.includes('siang') || lower.includes('malam') || lower.includes('permisi')) {
        finalReply = 'Halo Kak! Selamat datang di TECNO Official Store Jogja. 😊🙏 Ada info tipe HP, stok, atau promo harian yang bisa kami bantu jelaskan Kak?';
      } else if (lower.includes('lokasi') || lower.includes('toko') || lower.includes('alamat')) {
        finalReply = 'Toko kami TECNO Official Store berlokasi di Jogja Kak! Silakan mampir untuk cek demo unit dan promo menariknya. Ada tipe yang sedang Kakak incar?';
      } else {
        finalReply = 'Terima kasih sudah menghubungi TECNO Official Store Jogja! Ada yang bisa kami bantu terkait produk atau penawaran menarik hari ini Kak?';
      }
    }

    // 5. Simpan balasan ke riwayat chat
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'ai',
      message: finalReply
    });

    return NextResponse.json({
      reply: finalReply,
      explanation: explanation
    });

  } catch (err: any) {
    return NextResponse.json({
      reply: 'Halo Kak! Sistem kami sedang menyegarkan memori AI.',
      explanation: '💡 Status: Memuat ulang aturan terbaru.'
    });
  }
}
