'use client';

import { useState } from 'react';

export default function CatalogAllPage() {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileName) return alert('Harap isi nama file dan pilih gambar!');

    setIsUploading(true);

    // Konversi File ke Base64 agar tidak terjadi error transmisi di HP
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;

      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'all_series',
          label_name: fileName,
          file_data: base64Data,
          file_type: 'image',
        }),
      });

      setIsUploading(false);
      if (res.ok) {
        alert('Gambar Katalog All Seri Berhasil Disimpan!');
        setItems([...items, { label_name: fileName, file_url: base64Data }]);
        setFileName('');
        setFile(null);
      } else {
        alert('Gagal mengunggah file.');
      }
    };
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🖼️ Katalog Produk All Seri</h1>
        <p className="text-xs text-slate-500">Upload gambar gabungan katalog all seri. Beri nama file agar mudah dipanggil saat Training AI.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nama / Label File Katalog</label>
          <input
            type="text"
            placeholder="Contoh: katalog_all_series_september"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Gambar Katalog</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
        >
          {isUploading ? 'Mengunggah...' : '🚀 Simpan Gambar Katalog'}
        </button>
      </form>
    </div>
  );
}
