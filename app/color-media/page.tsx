'use client';

import { useState } from 'react';

export default function ColorMediaPage() {
  const [colorLabel, setColorLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !colorLabel) return alert('Lengkapi nama label warna dan pilih file foto/video!');

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      const isVideo = file.type.startsWith('video');

      await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'color_media',
          label_name: colorLabel,
          file_data: base64Data,
          file_type: isVideo ? 'video' : 'image',
        }),
      });

      setIsUploading(false);
      alert(`File Warna "${colorLabel}" Berhasil Disimpan!`);
      setColorLabel('');
      setFile(null);
    };
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🎨 Upload Media Warna Per Seri</h1>
        <p className="text-xs text-slate-500">Upload foto atau video contoh fisik warna HP per seri untuk pemicu AI Training.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Seri & Warna (Label File)</label>
          <input
            type="text"
            placeholder="Contoh: warna_camon30_mint_green"
            value={colorLabel}
            onChange={(e) => setColorLabel(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Foto atau Video Warna</label>
          <input
            type="file"
            accept="image/*,video/*"
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
          {isUploading ? 'Mengunggah...' : '🚀 Simpan Media Warna'}
        </button>
      </form>
    </div>
  );
}
