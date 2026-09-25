import { NextResponse } from 'next/server';
// Impor db / prisma instance kamu di sini, contoh:
// import { db } from '@/lib/db'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, mediaUrl, mediaType } = body;

    if (!message && !mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Pesan instruksi tidak boleh kosong' },
        { status: 400 }
      );
    }

    // 1. SIMPAN KE DATABASE KNOWLEDGE / TRAINING LOG
    // Contoh jika memakai Prisma/DB:
    /*
    const savedKnowledge = await db.knowledge.create({
      data: {
        title: message.substring(0, 30) + '...',
        content: message,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      }
    });
    */

    // 2. FORMULASIKAN PENJELASAN AI (UNDERSTANDING)
    const aiUnderstanding = `AI telah mempelajari dan mengaktifkan aturan baru ini: "${message}"${
      mediaUrl ? ` beserta lampiran media (${mediaType}).` : '.'
    }`;

    // 3. RETURN RESPONSE HARUS SESUAI DENGAN PROPERTY YANG DIPANGGUL FRONTEND
    return NextResponse.json({
      success: true,
      message: 'Aturan & Knowledge AI berhasil diperbarui!',
      understanding: aiUnderstanding,
    });
  } catch (error: any) {
    console.error('Error saving training:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan training ke database' },
      { status: 500 }
    );
  }
}
