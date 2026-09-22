'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({ features: 0, products: 0, chats: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [resConfig, resCat, resLeads] = await Promise.all([
          fetch('/api/admin/config').then(r => r.json()),
          fetch('/api/admin/catalog').then(r => r.json()),
          fetch('/api/admin/leads').then(r => r.json())
        ]);

        setStats({
          features: resConfig.configs?.length || 0,
          products: resCat.catalog?.length || 0,
          chats: resLeads.leads?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
          Selamat Datang, Admin ✨
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl text-sm">
          Semua kendala dan penambahan instruksi AI bisa dikontrol penuh tanpa perlu menyentuh kode program.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fitur AI Aktif</span>
          <div className="text-4xl font-extrabold text-purple-400 mt-4">{stats.features}</div>
          <Link href="/brain" className="text-xs text-purple-300 mt-4 hover:underline">Kelola Instruksi Logika →</Link>
        </div>

        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Katalog Produk</span>
          <div className="text-4xl font-extrabold text-pink-400 mt-4">{stats.products}</div>
          <Link href="/catalog" className="text-xs text-pink-300 mt-4 hover:underline">Kelola Stok & Warna →</Link>
        </div>

        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Interaksi Chat</span>
          <div className="text-4xl font-extrabold text-emerald-400 mt-4">{stats.chats}</div>
          <Link href="/live-chats" className="text-xs text-emerald-300 mt-4 hover:underline">Lihat Live Monitoring →</Link>
        </div>
      </div>
    </div>
  );
}
