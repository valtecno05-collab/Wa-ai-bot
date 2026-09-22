import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Memanggil nama variabel dari Environment Variables Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Logika pesan masuk dari WhatsApp Gateway
    const sender = body.from || body.sender;
    const message = body.text || body.message || body.body;

    if (!message) {
      return NextResponse.json({ status: 'ignored', reason: 'No message content' });
    }

    // Simpan log pesan ke Supabase
    await supabase.from('chat_logs').insert([
      { sender: sender, message: message, role: 'user' }
    ]);

    return NextResponse.json({ status: 'success', message: 'Webhook received' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'WhatsApp Webhook active' });
}
