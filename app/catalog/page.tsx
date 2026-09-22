'use client';

import { useState, useEffect } from 'react';

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [price, setPrice] = useState('');
  const [colors, setColors] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadCatalog = async () => {
    const res = await fetch('/api/admin/catalog');
    const data = await res.json();
    if (data.catalog) setCatalog(data.catalog);
  };

  useEffect(() => { loadCatalog(); }, []);

  // Handler Upload File Gambar dari Penyimpanan Internal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url); // Set URL gambar otomatis dari Supabase Storage
      } else {
        alert('Gagal upload gambar');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    await fetch('/api/admin/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, series, price: parseFloat(price) || 0, colors, image_url: imageUrl, description }),
    });
    setName(''); setSeries(''); setPrice(''); setColors(''); setImageUrl(''); setDescription('');
    loadCatalog();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📦 Katalog Produk & Sampel Warna</h1>
        <p className="text-xs text-slate-400">Pilih gambar dari galeri/memori internal HP untuk langsung dimasukkan ke katalog AI.</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-sm font-semibold text-pink-300 tracking-wide uppercase">🖼️ Input Produk & Gambar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
          <input type="text" placeholder="Seri / Tipe" value={series} onChange={(e) => setSeries(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
          <input type="number" placeholder="Harga (Rp)" value={price} onChange={(e) => setPrice(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
          <input type="text" placeholder="Varian Warna (cth: Glacier White, Mint Green)" value={colors} onChange={(e) => setColors(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
        </div>

        {/* Tombol Ambil Gambar dari Internal */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-300 font-medium">📂 Pilih Foto Produk Dari Penyimpanan Internal:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="glass-input w-full p-2 rounded-xl text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
          />
          {uploading && <p className="text-xs text-pink-400 animate-pulse">Mengunggah gambar dari penyimpanan internal...</p>}
          {imageUrl && (
            <div className="flex items-center gap-3 pt-2">
              <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-white/20" />
              <span className="text-xs text-emerald-400 font-medium">✅ Gambar Siap Digunakan</span>
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!name || !imageUrl || uploading}
          className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
        >
          📥 Simpan ke Katalog Real-Time
        </button>
      </div>

      {/* Grid Display Katalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {catalog.map((item) => (
          <div key={item.id} className="glass-card p-4 rounded-2xl">
            <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover rounded-xl mb-3 border border-white/10" />
            <h3 className="font-bold text-sm text-white">{item.name}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Rp {Number(item.price).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-2">🎨 <span className="text-slate-200">{item.colors || '-'}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
