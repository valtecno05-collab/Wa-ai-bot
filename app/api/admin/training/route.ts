import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase().trim();

    // 1. LOGIKA FOLLOW-UP OTOMATIS VIA CHAT
    // Contoh: "followup 081234567890 besok jam 10 pagi bilang stok camon 30 ready"
    if (lowerMessage.startsWith('followup') || lowerMessage.startsWith('follow up')) {
      const phoneMatch = message.match(/08\d+/);
      const targetPhone = phoneMatch ? phoneMatch[0] : null;

      if (!targetPhone) {
        return NextResponse.json({
          reply: '⚠️ Nomor HP tidak ditemukan. Gunakan format: "followup [nomor_hp] [waktu] bilang [pesan]"',
        });
      }

      const messageParts = message.split(/bilang/i);
      const followUpText = messageParts[1] ? messageParts[1].trim() : 'Halo kak, ada yang bisa dibantu kembali?';

      // Estimasi jadwal pengiriman (Default: 24 jam dari sekarang)
      let scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + 1);

      if (lowerMessage.includes('hari ini')) {
        scheduleDate = new Date();
      }

      await supabase.from('scheduled_followups').insert({
        phone_number: targetPhone,
        message: followUpText,
        scheduled_at: scheduleDate.toISOString(),
        status: 'pending',
      });

      return NextResponse.json({
        reply: `✅ Jadwal Follow-Up Berhasil Dibuat!\n📌 Nomor: ${targetPhone}\n📅 Jadwal: ${scheduleDate.toLocaleString('id-ID')}\n💬 Pesan: "${followUpText}"`,
      });
    }

    // 2. LOGIKA KIRIM GAMBAR / VIDEO PADA SITUASI SPESIFIK
    // Contoh: "Jika customer tanya warna camon 30 pro, kirim gambar camon_30_colors.jpg"
    if (lowerMessage.includes('kirim gambar') || lowerMessage.includes('kirim video')) {
      const isVideo = lowerMessage.includes('kirim video');
      const mediaType = isVideo ? 'video' : 'image';

      // Simpan aturan pemicu media ke database
      await supabase.from('media_rules').insert({
        trigger_instruction: message,
        media_type: mediaType,
        is_active: true,
      });

      return NextResponse.json({
        reply: `✅ Aturan Pengiriman ${mediaType.toUpperCase()} Disimpan!\n📌 Instruksi: "${message}"\n\nAI akan otomatis melampirkan media dari katalog secara real-time saat situasi tersebut terpenuhi di WhatsApp.`,
      });
    }

    // 3. LOGIKA HAPUS / GANTI KNOWLEDGE BASE
    // Contoh: "hapus knowledge promo lama ganti ke promo september diskon 15%"
    if (lowerMessage.includes('hapus knowledge')) {
      const parts = message.split(/ganti ke/i);
      const oldKnowledge = parts[0].replace(/hapus knowledge/i, '').trim();
      const newKnowledge = parts[1] ? parts[1].trim() : '';

      // Hapus data lama
      await supabase.from('knowledge_base').delete().ilike('title', `%${oldKnowledge}%`);

      // Tambahkan data pengganti jika ada
      if (newKnowledge) {
        await supabase.from('knowledge_base').insert({
          title: `Knowledge ${newKnowledge.slice(0, 20)}...`,
          content: newKnowledge,
          is_active: true,
        });
      }

      return NextResponse.json({
        reply: `✅ Knowledge Base Diperbarui!\n🗑️ Dihapus: "${oldKnowledge}"\n✨ Diganti: "${newKnowledge || 'Tanpa Pengganti'}"`,
      });
    }

    // 4. LOGIKA TAMBAH FAQ OTOMATIS
    // Contoh: "faq: garansi berapa lama? jawab Garansi resmi TECNO 12 bulan"
    if (lowerMessage.startsWith('faq:')) {
      const faqText = message.replace(/^faq:/i, '').trim();
      const [question, answer] = faqText.split(/jawab/i);

      await supabase.from('faqs').insert({
        question: question ? question.trim() : 'Pertanyaan Umum',
        answer: answer ? answer.trim() : faqText,
      });

      return NextResponse.json({
        reply: `✅ FAQ Baru Berhasil Ditambahkan!\n❓ Tanya: ${question ? question.trim() : '-'}\n💡 Jawab: ${answer ? answer.trim() : faqText}`,
      });
    }

    // 5. ATURAN INSTRUKSI UMUM / SYSTEM PROMPT
    await supabase.from('ai_rules').insert({
      instruction: message,
      is_active: true,
    });

    return NextResponse.json({
      reply: `⚙️ Aturan umum AI diperbarui: "${message}". Sistem langsung menyesuaikan logika respon secara real-time.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
