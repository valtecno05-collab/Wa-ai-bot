import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// GET: Ambil daftar chat realtime seluruh customer
export async function GET() {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, phone_number, source, phone_series_searched, status, is_ai_active, last_message, last_reply, updated_at')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Toggle On/Off AI untuk nomor tertentu
export async function POST(req: Request) {
  try {
    const { phone_number, is_ai_active } = await req.json();

    const { error } = await supabase
      .from('leads')
      .update({ is_ai_active })
      .eq('phone_number', phone_number);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
