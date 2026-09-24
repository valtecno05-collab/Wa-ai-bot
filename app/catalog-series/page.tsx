'use client';

import { useState } from 'react';

export default function CatalogSeriesPage() {
  const [seriesName, setSeriesName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !seriesName) return alert('Lengkapi nama seri dan pilih gambar!');

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;

      await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'per_series',
          label_name: seriesName,
          file_data: base64Data,
          file_type: 'image',
        }),
      });

      setIsUploading(false);
      alert(`Katalog Seri "${seriesName}" Berhasil Disimpan!`);
      setSeriesName('');
      setFile(null);
    };
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📱 Katalog Produk Per Seri</h1>
        <p className="text-xs text-slate-500">Upload gambar spesifikasi / brosur khusus per Seri (Tanpa memisahkan varian RAM/Internal).</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Seri HP</label>
          <input
            type="text"
            placeholder="Contoh: brosur_tecno_pova_6"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Gambar Brosur/Spesifikasi Seri</label>
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
          {isUploading ? 'Mengunggah...' : '🚀 Simpan Katalog Seri'}
        </button>
      </form>
    </div>
  );
}
