import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, title, content } = body;

    const inputContent = content || message;
    const inputTitle = title || (inputContent ? inputContent.slice(0, 30) : 'Aturan Baru');

    if (!inputContent) {
      return NextResponse.json({ error: 'Instruksi tidak boleh kosong' }, { status: 400 });
    }

    // 1. Simpan ke Knowledge Base Supabase secara Otomatis
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .insert({
        title: inputTitle,
        content: inputContent,
        is_active: true
      })
      .select();

    // 2. Simpan juga ke AI Rules
    await supabase.from('ai_rules').insert({
      instruction: inputContent,
      is_active: true
    });

    if (kbError) {
      console.error('Database Error:', kbError);
      return NextResponse.json({ error: 'Gagal menyimpan ke database Supabase: ' + kbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reply: `✅ **Berhasil Disimpan & AI Langsung Mengerti!**\n\n📌 **Judul/Topik:** ${inputTitle}\n💡 **Instruksi Logika:** "${inputContent}"\n\nAturan ini sudah otomatis aktif di WhatsApp & Simulator!`,
      data: kbData
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
