import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Get Status ON/OFF
export async function GET() {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('is_ai_active')
      .eq('id', 'global_config')
      .single();

    return NextResponse.json({ is_ai_active: data?.is_ai_active ?? false });
  } catch (err: any) {
    return NextResponse.json({ is_ai_active: false });
  }
}

// Toggle ON/OFF Status
export async function POST(req: Request) {
  try {
    const { is_ai_active } = await req.json();

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'global_config',
        is_ai_active: is_ai_active,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      is_ai_active,
      message: is_ai_active
        ? '🤖 AI WhatsApp Auto-Reply BERHASIL DIAKTIFKAN (24/7 Mode Active)!'
        : '⏸️ AI WhatsApp Auto-Reply DIMATIKAN (Mode Training / Testing Active).',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
