import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, instruction, content, title } = body;

    const textToSave = instruction || content || message;
    const titleToSave = title || (textToSave ? textToSave.slice(0, 35) + '...' : 'Instruksi AI');

    if (!textToSave) {
      return NextResponse.json({ error: 'Instruksi tidak boleh kosong' }, { status: 400 });
    }

    // Simpan ke Knowledge Base Supabase
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        title: titleToSave,
        content: textToSave
      })
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan ke database: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reply: `✅ **Instruksi Berhasil Dipelajari AI!**\n\n📌 **Ringkasan:** ${titleToSave}\n\nAturan ini sudah aktif di Knowledge Base dan akan diolah AI saat membalas customer.`,
      data
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
