import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// GET: Ambil daftar seluruh fitur/prompt AI
export async function GET() {
  try {
    const { data: configs, error } = await supabase
      .from('ai_config')
      .select('*')
      .order('id', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ configs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Tambah atau Update Fitur AI Baru
export async function POST(req: Request) {
  try {
    const { feature_name, description, system_prompt, is_active } = await req.json();

    const { error } = await supabase
      .from('ai_config')
      .upsert(
        { feature_name, description, system_prompt, is_active, updated_at: new Date().toISOString() },
        { onConflict: 'feature_name' }
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus Fitur AI
export async function DELETE(req: Request) {
  try {
    const { feature_name } = await req.json();
    const { error } = await supabase.from('ai_config').delete().eq('feature_name', feature_name);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
