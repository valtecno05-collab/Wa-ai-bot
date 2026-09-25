import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json(); // mode: 'admin' | 'user'
    if (!message) return NextResponse.json({ reply: 'Pesan kosong.' });

    const lowerMsg = message.toLowerCase().trim();

    // 1. Ambil seluruh Knowledge Base terbaru dari Supabase
    const { data: knowledge } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    const allRules = knowledge && knowledge.length > 0
      ? knowledge.map((k, i) => `${i + 1}. ${k.content}`).join('\n')
      : 'Belum ada aturan khusus.';

    // MODE 1: ADMIN MODE (Diskusi, Evaluasi Bug & Tambah Instruksi Langsung)
    if (mode === 'admin') {
      let adminReply = '';
      let explanation = '';

      // Jika Admin memberikan perbaikan/instruksi tambahan via chat
      if (lowerMsg.includes('perbaiki') || lowerMsg.includes('ubah') || lowerMsg.includes('harus') || lowerMsg.includes('salah')) {
        // Simpan instruksi perbaikan langsung dari chat ke Knowledge Base
        await supabase.from('knowledge_base').insert([
          {
            title: `Perbaikan: ${message.slice(0, 25)}...`,
            content: message
          }
        ]);

        adminReply = `🤖 **Siap Admin!** Bug/Instruksi baru sudah saya pahami dan langsung saya masukkan ke Knowledge Base:\n\n> "${message}"\n\nSilakan beralih ke Mode User untuk menguji balasan terbarunya.`;
        explanation = `🧠 **AI Debugger:** Menyimpan instruksi perbaikan langsung dari sesi obrolan Admin ke database.`;
      } else {
        adminReply = `🤖 **Halo Admin!** Saat ini saya beroperasi menggunakan **${knowledge?.length || 0} Aturan Knowledge Base**.\n\nJika ada balasan saya yang kurang sesuai pada mode User, katakan langsung di sini (contoh: *"Perbaiki balasan greeting harus pakai kata Kak"*), dan saya akan memutakhirkan memori saya secara otomatis.`;
        explanation = `🧠 **AI Debugger Active:** Berdiskusi dengan Admin mengenai performa dan logika AI.`;
      }

      return NextResponse.json({
        reply: adminReply,
        explanation: explanation,
        currentKnowledgeCount: knowledge?.length || 0
      });
    }

    // MODE 2: USER MODE (Customer Simulation)
    let finalReply = '';
    let matchedRule = '';

    // Cek ketersediaan aturan di Knowledge
    if (knowledge && knowledge.length > 0) {
      for (const item of knowledge) {
        const contentStr = (item.content || '').toLowerCase();
        const words = lowerMsg.split(/\s+/).filter(w => w.length > 2);
        
        if (words.some(w => contentStr.includes(w))) {
          matchedRule = item.content;
          break;
        }
      }
    }

    if (matchedRule) {
      finalReply = `Halo Kak! 😊 ${matchedRule}`;
    } else if (lowerMsg.includes('hallo') || lowerMsg.includes('halo') || lowerMsg.includes('pagi') || lowerMsg.includes('siang') || lowerMsg.includes('malam')) {
      finalReply = `Halo Kak! Selamat datang di TECNO Official Store Jogja. Ada yang bisa kami bantu mengenai produk HP TECNO hari ini? 😊`;
    } else {
      finalReply = `Terima kasih sudah menghubungi TECNO Jogja Kak. Boleh diinfokan tipe HP TECNO yang sedang dicari?`;
    }

    return NextResponse.json({
      reply: finalReply,
      explanation: matchedRule 
        ? `🧠 **Aturan Terpakai:** "${matchedRule}"` 
        : `🧠 **Aturan Terpakai:** Sapaan Standar Customer Service.`
    });

  } catch (err: any) {
    return NextResponse.json({ reply: 'Sistem mengalami kendala koneksi.', explanation: err.message });
  }
}
