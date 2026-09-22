import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embedRes = await embedModel.embedContent(content);
    const embedding = embedRes.embedding.values;

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([{ title, content, embedding }])
      .select();

    if (error) throw error;
    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
