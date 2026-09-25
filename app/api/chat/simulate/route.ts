import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message, phone_number } = await req.json();
    const userPhone = phone_number || '081234567890';

    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    // 1. Simpan pesan user ke riwayat
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'user',
      message: message
    });

    // 2. Ambil seluruh aturan & Knowledge Base dari Supabase
    const { data: knowledge } = await supabase.from('knowledge_base').select('*');

    // Kumpulkan semua instruksi dari Knowledge Base
    const rulesPrompt = knowledge && knowledge.length > 0 
      ? knowledge.map(k => `- ${k.content}`).join('\n')
      : 'Berilahkan balasan yang ramah sebagai CS TECNO Official Store Jogja.';

    const lower = message.toLowerCase().trim();
    let finalReply = '';

    // 3. Logika Pemprosesan Instruksi Dinamis (Contoh Skenario Survei & Greeting)
    if (rulesPrompt.includes('survei') || rulesPrompt.includes('dapat nomor kami dari mana')) {
      if (lower.includes('hallo malam') || lower.includes('halo malam')) {
        finalReply = 'Hallo kak malam juga 😊🙏\n\nUntuk keperluan survei dan pelayanan yang lebih baik, boleh tanya dulu ya: Kak dapat nomor kami dari mana?\n1. Instagram\n2. Google Maps\n3. Tiktok\n\nMohon bantuannya untuk dijawab sebentar saja ya kak, setelah itu kami akan langsung bantu informasikan daftar harganya. 🙏😊';
      } else if (lower.includes('hallo') || lower.includes('permisi') || lower.includes('pagi') || lower.includes('siang')) {
        finalReply = 'Hallo kak 😊🙏\n\nUntuk keperluan survei dan pelayanan yang lebih baik, boleh tanya dulu ya: Kak dapat nomor kami dari mana?\n1. Instagram\n2. Google Maps\n3. Tiktok\n\nMohon bantuannya untuk dijawab sebentar saja ya kak, setelah itu kami akan langsung bantu informasikan daftar harganya. 🙏😊';
      } else if (['1', '2', '3', 'instagram', 'google', 'tiktok', 'maps'].some(w => lower.includes(w))) {
        finalReply = 'Terima kasih banyak sudah menjawab surveinya kak! Kakak sedang mencari seri/tipe HP TECNO apa hari ini? Biar kami infokan promo harga terbaiknya.';
      }
    }

    // Balasan Default jika tidak masuk skenario di atas
    if (!finalReply) {
      finalReply = 'Hallo kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu terkait promo atau tipe HP TECNO hari ini?';
    }

    // 4. Simpan balasan ke riwayat chat
    await supabase.from('chat_history').insert({
      phone_number: userPhone,
      sender: 'ai',
      message: finalReply
    });

    return NextResponse.json({ reply: finalReply });

  } catch (err: any) {
    return NextResponse.json({ reply: 'Maaf, sistem sedang memproses instruksi baru.' });
  }
}
