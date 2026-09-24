export async function sendWhatsAppMessageWithTyping(
  phoneNumber: string,
  messageText: string,
  fonnteToken: string
) {
  // Hitung jumlah kata
  const wordCount = messageText.trim().split(/\s+/).length;

  // Rumus jeda waktu: ~250ms per kata (minimum 2 detik, maksimum 10 detik)
  const typingDelayMs = Math.min(Math.max(wordCount * 250, 2000), 10000);

  // 1. Kirim Signal "Composing/Typing" ke WhatsApp via API Fonnte/WA Gateway
  await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      Authorization: fonnteToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: phoneNumber,
      typing: true, // Mengaktifkan indikator "mengetik..."
    }),
  });

  // 2. Berikan jeda sesuai estimasi kecepatan ketik manusia
  await new Promise((resolve) => setTimeout(resolve, typingDelayMs));

  // 3. Kirimkan pesan teks yang sebenarnya
  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      Authorization: fonnteToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: phoneNumber,
      message: messageText,
    }),
  });

  return response.json();
}
