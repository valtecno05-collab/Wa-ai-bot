import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// 1. ENDPOINT GET: Untuk Verifikasi Webhook dari WhatsApp Cloud API / Provider WA
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'tecno_jogja_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// 2. ENDPOINT POST: Memproses Pesan WhatsApp Masuk Real-Time
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pastikan payload berisi pesan masuk
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObj = value?.messages?.[0];

    if (!messageObj) {
      return NextResponse.json({ status: 'Ignored: Not a message event' });
    }

    const senderPhone = messageObj.from; // Nomor HP Pelanggan
    const incomingMessage = messageObj.text?.body || '';

    if (!incomingMessage) {
      return NextResponse.json({ status: 'Ignored: Empty message' });
    }

    // -------------------------------------------------------------
    // LOGIKA A: CEK STATUS ON / OFF AI DARI SYSTEM SETTINGS
    // -------------------------------------------------------------
    const { data: config } = await supabase
      .from('system_settings')
      .select('is_ai_active')
      .eq('id', 'global_config')
      .single();

    if (!config?.is_ai_active) {
      console.log(`[AI OFF] Pesan dari ${senderPhone} diabaikan karena AI dalam Mode Training.`);
      return NextResponse.json({ status: 'AI Is OFF (Training Mode)' });
    }

    // -------------------------------------------------------------
    // LOGIKA B: SIMPAN PESAN USER MASUK KE DATABASE (CHAT HISTORY)
    // -------------------------------------------------------------
    await supabase.from('chat_history').insert({
      phone_number: senderPhone,
      sender: 'user',
      message: incomingMessage,
    });

    // -------------------------------------------------------------
    // LOGIKA C: BACA RIWAYAT OBROLAN LAMA (MEMORY THREAD PER NOMOR HP)
    // -------------------------------------------------------------
    const { data: history } = await supabase
      .from('chat_history')
      .select('sender, message')
      .eq('phone_number', senderPhone)
      .order('created_at', { ascending: false })
      .limit(6);

    const lowerMessage = incomingMessage.toLowerCase().trim();

    // -------------------------------------------------------------
    // LOGIKA D: CARI JAWABAN DARI KNOWLEDGE BASE & AI RULES
    // -------------------------------------------------------------
    const { data: knowledge } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true);

    let aiReply = '';

    if (knowledge && knowledge.length > 0) {
      for (const item of knowledge) {
        const itemContent = (item.content || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();

        const words = lowerMessage.split(' ');
        const isMatch = words.some(
          (w) => w.length > 2 && (itemContent.includes(w) || itemTitle.includes(w))
        );

        if (isMatch) {
          aiReply = item.content;
          break;
        }
      }
    }

    // Balasan Default jika belum ada aturan khusus yang cocok
    if (!aiReply) {
      if (
        lowerMessage.includes('hallo') ||
        lowerMessage.includes('halo') ||
        lowerMessage.includes('pagi') ||
        lowerMessage.includes('malam') ||
        lowerMessage.includes('siang')
      ) {
        aiReply =
          'Halo Kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu terkait produk atau promo hari ini?';
      } else {
        aiReply =
          'Terima kasih telah menghubungi TECNO Official Store Jogja. Ada info tipe/seri HP TECNO yang ingin Kakak tanyakan?';
      }
    }

    // -------------------------------------------------------------
    // LOGIKA E: SIMPAN BALASAN AI KE CHAT HISTORY
    // -------------------------------------------------------------
    await supabase.from('chat_history').insert({
      phone_number: senderPhone,
      sender: 'ai',
      message: aiReply,
    });

    // -------------------------------------------------------------
    // LOGIKA F: KIRIM BALASAN KE WHATSAPP PELANGGAN
    // (Integrasi WhatsApp Cloud API / Provider WA Gateway)
    // -------------------------------------------------------------
    const waToken = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (waToken && phoneId) {
      await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: senderPhone,
          text: { body: aiReply },
        }),
      });
    }

    return NextResponse.json({ success: true, reply: aiReply });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
