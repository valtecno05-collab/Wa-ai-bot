import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function sendWAMessage(to: string, text: string) {
  await fetch('https://api.whatsapp-gateway.com/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: to, message: text }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sender = body.from || body.sender;
    const rawMessage = (body.text || body.message || body.body || '').trim();

    if (!rawMessage) return NextResponse.json({ status: 'ignored' });

    // 1. Cek status customer di Database
    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone_number', sender)
      .single();

    // Jika customer baru, kirim Greeting & kunci pesan (WAITING_SOURCE)
    if (!lead) {
      await supabase.from('leads').insert([
        { phone_number: sender, status: 'WAITING_SOURCE' }
      ]);

      const greetingText = `Halo! Selamat datang di toko kami 👋\n\n` +
        `Sebelum kita mulai, mohon bantu kami dengan menjawab: Dari mana Kamu mendapatkan nomor WhatsApp kami?\n\n` +
        `1. Instagram\n` +
        `2. Google Maps\n` +
        `3. TikTok\n\n` +
        `*Silakan ketik angkanya saja (1/2/3).*`;

      await sendWAMessage(sender, greetingText);
      return NextResponse.json({ status: 'greeting_sent' });
    }

    // 2. Jika status masih WAITING_SOURCE, AI DIBLOKIR sampai menjawab 1, 2, atau 3
    if (lead.status === 'WAITING_SOURCE') {
      let selectedSource = '';
      if (rawMessage === '1') selectedSource = 'Instagram';
      else if (rawMessage === '2') selectedSource = 'Google Maps';
      else if (rawMessage === '3') selectedSource = 'TikTok';

      if (!selectedSource) {
        // Balasan jika user mengetik hal lain sebelum memilih 1-3
        await sendWAMessage(
          sender,
          `Mohon pilih angka 1, 2, atau 3 terlebih dahulu untuk melanjutkan ya:\n1. Instagram\n2. Google Maps\n3. TikTok`
        );
        return NextResponse.json({ status: 'waiting_valid_option' });
      }

      // Update sumber informasi dan ubah status jadi ACTIVE
      await supabase
        .from('leads')
        .update({ source: selectedSource, status: 'ACTIVE' })
        .eq('phone_number', sender);

      await sendWAMessage(
        sender,
        `Terima kasih! Ada seri HP apa yang sedang Kamu cari hari ini?`
      );
      return NextResponse.json({ status: 'source_saved' });
    }

    // 3. Tangkap Seri HP yang dicari jika belum ada
    if (!lead.phone_series_searched) {
      await supabase
        .from('leads')
        .update({ phone_series_searched: rawMessage })
        .eq('phone_number', sender);
    }

    // 4. Setelah survey selesai, bot melanjutkan ke AI / Catalog normal
    await sendWAMessage(sender, `Baik, tim AI kami sedang memproses pertanyaan Kamu tentang "${rawMessage}"...`);

    return NextResponse.json({ status: 'processed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
