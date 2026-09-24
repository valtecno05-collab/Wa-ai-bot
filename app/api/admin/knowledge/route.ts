import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Get All Pelajaran AI
export async function GET() {
  try {
    const { data: kb } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });
    const { data: rules } = await supabase.from('ai_rules').select('*').order('created_at', { ascending: false });

    // Gabungkan data Knowledge Base dan Rules
    const combined = [
      ...(kb || []).map(item => ({ ...item, type: 'Knowledge Base' })),
      ...(rules || []).map(item => ({ ...item, title: item.instruction, content: item.instruction, type: 'Aturan AI' }))
    ];

    return NextResponse.json(combined);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete Pelajaran AI
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await supabase.from('knowledge_base').delete().eq('id', id);
      await supabase.from('ai_rules').delete().eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
