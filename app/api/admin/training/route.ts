import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, media_label, media_data, media_type } = body;

    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase().trim();

    // 1. PENGEMBANGAN KALIMAT & SKEMA LOGIKA OTOMATIS
    if (lowerMessage.startsWith('kembangkan kalimat:') || lowerMessage.startsWith('buatkan skema:')) {
      const userDraft = message.replace(/kembangkan kalimat:|buatkan skema:/i, '').trim();
      const expandedResponse = `Halo Kak! Terima kasih sudah menghubungi TECNO Official Store Jogja. ${userDraft} Ada yang bisa kami bantu kembali Kak?`;

      await supabase.from('knowledge_base').insert({
        title: `Auto-Expanded Rule: ${userDraft.slice(0, 20)}...`,
        content: expandedResponse,
        is_active: true,
      });

      return NextResponse.json({
        reply: `✨ **Hasil Pengembangan AI & Skema Logika:**\n\n"${expandedResponse}"\n\n✅ Aturan ini telah otomatis disimpan dan aktif di WhatsApp!`,
      });
    }

    // 2. FOLLOW-UP OTOMATIS VIA CHAT
    if (lowerMessage.startsWith('followup') || lowerMessage.startsWith('follow up')) {
      const phoneMatch = message.match(/08\d+/);
      const targetPhone = phoneMatch ? phoneMatch[0] : null;

      if (!targetPhone) {
        return NextResponse.json({
          reply: '⚠️ Nomor HP tidak ditemukan. Format: "followup [nomor_hp] [waktu] bilang [pesan]"',
        });
      }

      const messageParts = message.split(/bilang/i);
      const followUpText = messageParts[1] ? messageParts[1].trim() : 'Halo kak, ada yang bisa dibantu kembali?';

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

    // 3. PEMICU MEDIA (GAMBAR / VIDEO)
    if (lowerMessage.includes('kirim gambar') || lowerMessage.includes('kirim video') || media_data) {
      const isVideo = lowerMessage.includes('kirim video') || media_type === 'video';
      const type = isVideo ? 'video' : 'image';

      await supabase.from('media_rules').insert({
        trigger_instruction: message,
        label_name: media_label || 'media_attachment',
        media_data: media_data || null,
        media_type: type,
        is_active: true,
      });

      return NextResponse.json({
        reply: `✅ Aturan ${type.toUpperCase()} Disimpan!\n📌 Instruksi: "${message}"\n\nAI akan melampirkan media secara otomatis saat pemicu terpenuhi di WhatsApp.`,
      });
    }

    // 4. HAPUS / GANTI KNOWLEDGE BASE
    if (lowerMessage.includes('hapus knowledge')) {
      const parts = message.split(/ganti ke/i);
      const oldKnowledge = parts[0].replace(/hapus knowledge/i, '').trim();
      const newKnowledge = parts[1] ? parts[1].trim() : '';

      await supabase.from('knowledge_base').delete().ilike('title', `%${oldKnowledge}%`);

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

    // 5. TAMBAH FAQ OTOMATIS
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

    // 6. DEFAULT INSTRUKSI TRAINING
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
