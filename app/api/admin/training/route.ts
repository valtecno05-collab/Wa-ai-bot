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
      return NextResponse.json({ error: 'Pesan instruksi tidak boleh kosong' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase().trim();

    // 1. INSTRUKSI PENGEMBANGAN KALIMAT / SKEMA LOGIKA
    if (lowerMessage.startsWith('kembangkan kalimat:') || lowerMessage.startsWith('buatkan skema:')) {
      const userDraft = message.replace(/kembangkan kalimat:|buatkan skema:/i, '').trim();
      const expandedResponse = `Halo Kak! Terima kasih telah menghubungi TECNO Official Store Jogja. ${userDraft} Ada yang bisa kami bantu kembali Kak?`;

      await supabase.from('knowledge_base').insert({
        title: `Skema: ${userDraft.slice(0, 30)}`,
        content: expandedResponse,
        is_active: true,
      });

      return NextResponse.json({
        reply: `✨ **Aturan Berhasil Disimpan ke Knowledge Base!**\n\n"${expandedResponse}"`,
      });
    }

    // 2. INSTRUKSI PEMICU MEDIA (GAMBAR/VIDEO)
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

      // Simpan juga ringkasan aturan ke Knowledge Base
      await supabase.from('knowledge_base').insert({
        title: `Media Rule (${type.toUpperCase()})`,
        content: message,
        is_active: true,
      });

      return NextResponse.json({
        reply: `✅ **Aturan Media Disimpan ke Knowledge Base!**\n📌 Instruksi: "${message}"`,
      });
    }

    // 3. INSTRUKSI DEFAULT (SEMUA PESAN TRAINING LAINNYA)
    // Otomatis disimpan langsung ke Knowledge Base & AI Rules
    await supabase.from('knowledge_base').insert({
      title: `Training: ${message.slice(0, 30)}...`,
      content: message,
      is_active: true,
    });

    await supabase.from('ai_rules').insert({
      instruction: message,
      is_active: true,
    });

    return NextResponse.json({
      reply: `⚙️ **Aturan AI Berhasil Dipelajari & Tersimpan!**\n\nInstruksi: "${message}"\n\nSistem telah memperbarui Knowledge Base secara real-time.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
