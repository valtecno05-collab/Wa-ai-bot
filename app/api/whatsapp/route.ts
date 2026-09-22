import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';

async function sendWAMessage(to: string, message: string, mediaUrl?: string) {
  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: to, message: message, url: mediaUrl }),
    });
  } catch (err) {
    console.error('Error sendWAMessage:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sender = body.sender;
    const rawMessage = (body.message || '').trim();

    if (!sender || !rawMessage) return NextResponse.json({ status: 'ignored' });

    let { data: lead } = await supabase.from('leads').select('*').eq('phone_number', sender).single();

    // 1. CEK STATUS KONTROL AI (Jika OFF/PAUSE, Bot diam dan abaikan pesan)
    if (lead && lead.is_ai_active === false) {
      await supabase.from('leads').update({
        last_message: rawMessage,
        updated_at: new Date().toISOString()
      }).eq('phone_number', sender);

      return NextResponse.json({ status: 'ai_paused_by_admin' });
    }

    // 2. JIKA CUSTOMER BARU
    if (!lead) {
      await supabase.from('leads').insert([
        { phone_number: sender, status: 'WAITING_SOURCE', last_message: rawMessage }
      ]);

      const greetingText = `Halo! Selamat datang 👋\n\n` +
        `Sebelum kita mulai, mohon pilih: Dari mana Kamu mendapat nomor WhatsApp kami?\n\n` +
        `1. Instagram\n2. Google Maps\n3. TikTok\n\n` +
        `*Silakan ketik angkanya saja (1/2/3).*`;

      await sendWAMessage(sender, greetingText);
      await supabase.from('leads').update({ last_reply: greetingText }).eq('phone_number', sender);
      return NextResponse.json({ status: 'greeting_sent' });
    }

    // UPDATE PESAN TERAKHIR
    let replyText = '';

    // 3. SURVEI 1/2/3
    if (lead.status === 'WAITING_SOURCE') {
      let selectedSource = '';
      if (rawMessage === '1') selectedSource = 'Instagram';
      else if (rawMessage === '2') selectedSource = 'Google Maps';
      else if (rawMessage === '3') selectedSource = 'TikTok';

      if (!selectedSource) {
        replyText = `Mohon pilih angka 1, 2, atau 3 terlebih dahulu:\n\n1. Instagram\n2. Google Maps\n3. TikTok`;
      } else {
        await supabase.from('leads').update({ source: selectedSource, status: 'ACTIVE' }).eq('phone_number', sender);
        replyText = `Terima kasih! Seri HP tipe apa yang sedang Kamu cari hari ini?`;
      }

      await sendWAMessage(sender, replyText);
      await supabase.from('leads').update({ last_message: rawMessage, last_reply: replyText, updated_at: new Date().toISOString() }).eq('phone_number', sender);
      return NextResponse.json({ status: 'processed' });
    }

    // BALASAN UMUM AI
    replyText = `Terima kasih! Tim kami telah mencatat permintaan Kamu: *${rawMessage}*. Ketik *Katalog* untuk melihat pilihan unit.`;
    await sendWAMessage(sender, replyText);

    await supabase.from('leads').update({
      last_message: rawMessage,
      last_reply: replyText,
      updated_at: new Date().toISOString()
    }).eq('phone_number', sender);

    return NextResponse.json({ status: 'processed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
