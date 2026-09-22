import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendWAMessage(to: string, text: string, mediaUrl?: string) {
  await fetch('https://api.whatsapp-gateway.com/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: to,
      message: text,
      url: mediaUrl,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sender = body.from || body.sender;
    const rawMessage = (body.text || body.message || body.body || '').trim();
    const lowerMessage = rawMessage.toLowerCase();

    if (!rawMessage) return NextResponse.json({ status: 'ignored' });

    // Ambil nomor Admin
    const { data: adminSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_phone')
      .single();
    const adminPhone = adminSetting?.value || '';

    // Cek Data Lead
    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone_number', sender)
      .single();

    // 1. CUSTOMER BARU: Tampilkan Greeting & Wajibkan Jawab Sumber Info
    if (!lead) {
      await supabase.from('leads').insert([
        { phone_number: sender, status: 'WAITING_SOURCE' }
      ]);

      const greetingText = `Halo! Selamat datang 👋\n\n` +
        `Sebelum kita mulai, mohon bantu kami memilih: Dari mana Kamu mendapat nomor WhatsApp kami?\n\n` +
        `1. Instagram\n` +
        `2. Google Maps\n` +
        `3. TikTok\n\n` +
        `*Silakan jawab dengan mengetik angkanya saja (1/2/3).*`;

      await sendWAMessage(sender, greetingText);
      return NextResponse.json({ status: 'greeting_sent' });
    }

    // 2. STATUS WAITING_SOURCE: AI Diblokir Sebelum Menjawab 1/2/3
    if (lead.status === 'WAITING_SOURCE') {
      let selectedSource = '';
      if (rawMessage === '1') selectedSource = 'Instagram';
      else if (rawMessage === '2') selectedSource = 'Google Maps';
      else if (rawMessage === '3') selectedSource = 'TikTok';

      if (!selectedSource) {
        await sendWAMessage(
          sender,
          `Mohon pilih angka 1, 2, atau 3 terlebih dahulu untuk melanjutkan:\n\n1. Instagram\n2. Google Maps\n3. TikTok`
        );
        return NextResponse.json({ status: 'waiting_valid_option' });
      }

      await supabase
        .from('leads')
        .update({ source: selectedSource, status: 'ACTIVE' })
        .eq('phone_number', sender);

      await sendWAMessage(
        sender,
        `Terima kasih! Seri HP tipe apa yang sedang Kamu cari hari ini?`
      );
      return NextResponse.json({ status: 'source_saved' });
    }

    // 3. Rekap Seri HP yang Dicari
    if (!lead.phone_series_searched) {
      await supabase
        .from('leads')
        .update({ phone_series_searched: rawMessage })
        .eq('phone_number', sender);
    }

    // 4. FITUR KATALOG / FOTO / WARNA
    if (lowerMessage.includes('katalog') || lowerMessage.includes('foto') || lowerMessage.includes('warna')) {
      const { data: products } = await supabase.from('catalog').select('*').limit(3);

      if (products && products.length > 0) {
        for (const item of products) {
          await sendWAMessage(sender, `🎨 *${item.name}*\n${item.description || ''}`, item.image_url);
        }
      } else {
        await sendWAMessage(sender, 'Katalog foto saat ini sedang disiapkan.');
      }
      return NextResponse.json({ status: 'catalog_sent' });
    }

    // 5. FITUR CEK STOK (Forward ke Admin)
    if (lowerMessage.includes('stok') || lowerMessage.includes('ready')) {
      await sendWAMessage(sender, 'Pertanyaan stok/warna Kamu sudah kami teruskan ke Admin. Mohon tunggu sebentar ya!');
      if (adminPhone) {
        await sendWAMessage(adminPhone, `📌 *PERMINTAAN CEK STOK*\nDari: ${sender}\nPesan: "${rawMessage}"`);
      }
      return NextResponse.json({ status: 'stock_forwarded' });
    }

    // 6. FITUR ORDER (Rincian Order ke Admin)
    if (lowerMessage.includes('order') || lowerMessage.includes('pesan')) {
      await sendWAMessage(sender, 'Rincian order Kamu telah kami catat dan diteruskan ke Admin untuk proses transaksi.');
      if (adminPhone) {
        await sendWAMessage(adminPhone, `🛒 *RINCIAN ORDER BARU*\nDari: ${sender}\nDetail: "${rawMessage}"`);
      }
      return NextResponse.json({ status: 'order_forwarded' });
    }

    // 7. BALASAN UMUM
    await sendWAMessage(sender, `Terima kasih! Tim kami telah mencatat permintaan Kamu untuk tipe: *${rawMessage}*. Ketik *Katalog* untuk melihat foto unit/warna.`);

    return NextResponse.json({ status: 'processed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
