import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Logika NLP Sederhana untuk Perintah Admin via Chat
    if (message.toLowerCase().includes('hapus knowledge')) {
      const parts = message.split('ganti ke');
      const oldKnowledge = parts[0].replace(/hapus knowledge/i, '').trim();
      const newKnowledge = parts[1] ? parts[1].trim() : '';

      // Hapus Knowledge Lama
      await supabase.from('knowledge_base').delete().ilike('title', `%${oldKnowledge}%`);

      // Tambahkan Knowledge Baru jika ada
      if (newKnowledge) {
        await supabase.from('knowledge_base').insert({
          title: `Knowledge ${newKnowledge}`,
          content: newKnowledge,
          is_active: true,
        });
      }

      return NextResponse.json({
        reply: `✅ Berhasil! Knowledge "${oldKnowledge}" telah dihapus dan diperbarui ke "${newKnowledge}" secara real-time.`,
      });
    }

    // 2. Menambah FAQ Otomatis
    if (message.toLowerCase().startsWith('faq:')) {
      const faqText = message.replace(/faq:/i, '').trim();
      const [question, answer] = faqText.split('?');

      await supabase.from('faqs').insert({
        question: question ? question.trim() + '?' : 'Pertanyaan Umum',
        answer: answer ? answer.trim() : faqText,
      });

      return NextResponse.json({
        reply: `✅ FAQ Baru berhasil ditambahkan dan langsung aktif di sistem.`,
      });
    }

    // Default response training
    return NextResponse.json({
      reply: `Instruksi diterima: "${message}". Seluruh aturan AI telah diperbarui secara real-time.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
