'use client';

import { useState, useEffect } from 'react';

export default function BrainPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadConfigs = async () => {
    const res = await fetch('/api/admin/config');
    const data = await res.json();
    if (data.configs) setConfigs(data.configs);
  };

  useEffect(() => { loadConfigs(); }, []);

  const handleSave = async () => {
    setUploading(true);
    let imageUrl = '';

    // Upload Gambar dari Penyimpanan Internal jika ada
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      const resUpload = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const dataUpload = await resUpload.json();
      if (dataUpload.url) imageUrl = dataUpload.url;
    }

    // Gabungkan Skema & Gambar ke System Prompt AI
    const fullSystemPrompt = imageUrl 
      ? `${prompt}\n\n[SKEMA/REFERENSI GAMBAR ATURAN]: ${imageUrl}`
      : prompt;

    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_name: featureName,
        description: description,
        system_prompt: fullSystemPrompt,
        is_active: true,
      }),
    });

    setFeatureName(''); setDescription(''); setPrompt(''); setImageFile(null);
    setUploading(false);
    loadConfigs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🧠 Otak & Training AI Agent</h1>
        <p className="text-xs text-slate-400">Upload gambar skema/SOP dari HP/Laptop dan beri instruksi real-time untuk AI.</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-sm font-semibold text-purple-300 tracking-wide uppercase">➕ Tambah Fitur & Training Skema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nama Fitur / Skema (cth: sop_retur_barang)"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            className="glass-input p-3 rounded-xl text-sm"
          />
          <input
            type="text"
            placeholder="Deskripsi Fitur"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input p-3 rounded-xl text-sm"
          />
        </div>

        {/* Input Gambar dari Internal */}
        <div>
          <label className="block text-xs text-slate-300 mb-2 font-medium">📷 Upload Gambar Skema/SOP (Penyimpanan Internal):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="glass-input w-full p-2 rounded-xl text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Tuliskan skema dan instruksi AI di sini (contoh: Ikuti alur skema pada gambar jika customer ingin klaim garansi...)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="glass-input w-full p-3 rounded-xl text-sm"
        />

        <button
          onClick={handleSave}
          disabled={uploading || !featureName || !prompt}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          {uploading ? 'Proses Upload & Simpan...' : '🚀 Simpan & Pelajari Skema Real-Time'}
        </button>
      </div>

      {/* List Prompt Active */}
      <div className="grid grid-cols-1 gap-4">
        {configs.map((cfg) => (
          <div key={cfg.id} className="glass-card p-5 rounded-2xl space-y-2">
            <span className="font-bold text-purple-300 text-sm">📌 {cfg.feature_name}</span>
            <p className="text-xs text-slate-400">{cfg.description}</p>
            <div className="text-xs text-slate-200 bg-black/20 p-3 rounded-xl whitespace-pre-wrap">{cfg.system_prompt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
