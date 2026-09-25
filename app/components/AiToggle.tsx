'use client';

import { useState, useEffect } from 'react';

export default function AiToggle() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil status saat ini
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setIsActive(data.is_ai_active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = !isActive;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_ai_active: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setIsActive(newStatus);
        alert(data.message);
      }
    } catch (err) {
      alert('Gagal mengubah status AI');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-400">Memuat status AI...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Status Otomatisasi AI WhatsApp: {isActive ? '🟢 AKTIF (24/7)' : '⏸️ MODE TRAINING (MATI)'}
          </h3>
          <p className="text-xs text-slate-500">
            {isActive
              ? 'AI sedang membalas chat WhatsApp pelanggan secara otomatis secara real-time.'
              : 'AI matikan dulu agar kamu bebas melatih dan mengetes aturan AI tanpa mengganggu pelanggan.'}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {isActive ? '⏹️ Matikan AI (Buka Mode Training)' : '▶️ Jalankan AI Full-Time (24/7)'}
      </button>
    </div>
  );
}
