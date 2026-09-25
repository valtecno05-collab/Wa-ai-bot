import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, mediaUrl, mediaType } = body;

    if (!message && !mediaUrl) {
      return NextResponse.json({ success: false, error: 'Pesan instruksi atau media wajib diisi.' }, { status: 400 });
    }

    const titleText = message ? (message.length > 30 ? message.slice(0, 30) + '...' : message) : `Media ${mediaType}`;
    let fullContent = message || '';

    if (mediaUrl) {
      fullContent += `\n\n[Lampiran ${mediaType || 'Media'}]: ${mediaUrl}`;
    }

    // SIMPAN LANGSUNG KE TABEL KNOWLEDGE_BASE SUPABASE
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([
        {
          title: titleText,
          content: fullContent,
        }
      ])
      .select();

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ success: false, error: 'Gagal menyimpan ke Knowledge Base: ' + error.message }, { status: 500 });
    }

    const aiUnderstanding = `AI berhasil mengindeks dan memahami aturan baru: "${titleText}". Aturan ini aktif di Knowledge Base.`;

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `✅ Aturan Baru Berhasil Disimpan ke Knowledge Base!`,
      understanding: aiUnderstanding
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
