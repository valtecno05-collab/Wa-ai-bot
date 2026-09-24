'use client';

import { useState } from 'react';

export default function TrainingPage() {
  const [instruction, setInstruction] = useState('');
  const [mediaLabel, setMediaLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulator State
  const [testInput, setTestInput] = useState('');
  const [chatLogs, setChatLogs] = useState<{ sender: string; text: string }[]>([
    { sender: 'ai', text: 'Sistem Training AI Aktif. Silakan uji coba aturan baru di sini.' }
  ]);

  // Submit Training Teks & Media
  const handleTrainAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction) return alert('Masukkan instruksi atau aturan training!');

    setIsLoading(true);
    let base64Media = null;
    let fileType = 'text';

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          base64Media = reader.result;
          fileType = file.type.startsWith('video') ? 'video' : 'image';
          resolve(true);
        };
      });
    }

    try {
      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: instruction,
          media_label: mediaLabel || null,
          media_data: base64Media,
          media_type: fileType,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        alert('✅ AI Berhasil Dilatih!');
        setChatLogs([...chatLogs, { sender: 'system', text: `[Training Baru]: ${instruction}` }]);
        setInstruction('');
        setMediaLabel('');
        setFile(null);
      } else {
        alert('Gagal melatih AI: ' + data.error);
      }
    } catch {
      setIsLoading(false);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  // Live Test Simulator
  const handleTestChat = async () => {
    if (!testInput) return;
    const newLogs = [...chatLogs, { sender: 'user', text: testInput }];
    setChatLogs(newLogs);
    setTestInput('');

    const res = await fetch('/api/admin/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testInput }),
    });
    const data = await res.json();

    setChatLogs([...newLogs, { sender: 'ai', text: data.reply || 'Instruksi diproses.' }]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🧠 Central AI Training Center</h1>
        <p className="text-xs text-slate-500">Latih logika balasan AI, tambahkan FAQ, atau unggah gambar/video instruksi untuk dikirim otomatis ke pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Training AI & Upload Media */}
        <form onSubmit={handleTrainAI} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-800 border-b pb-2">📝 Input Instruksi Training</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instruksi / Perintah AI</label>
            <textarea
              rows={4}
              placeholder="Contoh: Jika customer tanya lokasi toko Jogja, jelaskan alamat lengkap di Jl. Gejayan dan kirim gambar peta_toko"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 mb-2">📎 Upload Media Lampiran (Opsional)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nama Label Media</label>
                <input
                  type="text"
                  placeholder="Contoh: peta_toko_gejayan / video_unboxing_camon30"
                  value={mediaLabel}
                  onChange={(e) => setMediaLabel(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Pilih File Foto atau Video (.mp4)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            {isLoading ? 'Menyimpan & Melatih AI...' : '🚀 Simpan & Terapkan Ke AI'}
          </button>
        </form>

        {/* Live Test Playground */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[480px]">
          <h2 className="font-bold text-sm text-slate-800 border-b pb-2">🧪 Live Uji Coba AI</h2>

          <div className="flex-1 overflow-y-auto p-3 bg-slate-50 rounded-xl my-3 space-y-2">
            {chatLogs.map((log, index) => (
              <div key={index} className={`flex ${log.sender === 'user' ? 'justify-end' : log.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                  log.sender === 'user' ? 'bg-blue-600 text-white' : 
                  log.sender === 'system' ? 'bg-amber-100 text-amber-800 text-[10px] font-medium' : 
                  'bg-white border border-slate-200 text-slate-800'
                }`}>
                  {log.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Uji coba balasan AI..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs"
            />
            <button onClick={handleTestChat} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs">Tes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
