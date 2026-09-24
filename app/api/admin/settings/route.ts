import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  const { data } = await supabase.from('admin_settings').select('*').single();
  return NextResponse.json(data || {});
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabase.from('admin_settings').upsert({
      id: 1, // Memakai ID tunggal untuk konfigurasi global
      admin_phone: body.admin_phone,
      forward_phone: body.forward_phone,
      forward_leads: body.forward_leads,
      forward_handover: body.forward_handover,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
