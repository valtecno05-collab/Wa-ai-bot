'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="id">
      <head>
        <title>Tecno Official Store Jogja - AI Management</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; background-color: #f3f6fc; color: #1e293b; }
          .sidebar-item {
            display: flex; align-items: center; gap: 12px; padding: 10px 16px;
            border-radius: 12px; font-size: 14px; font-weight: 500; color: #64748b; transition: all 0.2s;
          }
          .sidebar-item:hover, .sidebar-item.active { color: #0052cc; background-color: #eff6ff; }
        `}</style>
      </head>
      <body className="flex min-h-screen flex-col md:flex-row">
        {/* Top Header Mobile (Hamburger Menu Toggle) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-blue-700 tracking-wider">TECNO</span>
            <span className="text-xs font-semibold text-slate-500">Jogja</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 focus:outline-none"
          >
            {isSidebarOpen ? '✕' : '☰ Menu'}
          </button>
        </div>

        {/* Sidebar Navigasi */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between 
          transform transition-transform duration-200 ease-in-out md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div>
            {/* Logo Tecno */}
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 text-white font-extrabold text-xl px-2.5 py-1 rounded-lg tracking-wider">TECNO</div>
              <div>
                <span className="font-bold text-sm text-slate-800 block leading-tight">Official Store</span>
                <span className="text-[10px] text-blue-600 font-semibold">Jogja Branch</span>
              </div>
            </div>

            {/* Navigasi Menu */}
            <nav className="space-y-1 text-xs">
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">📊 Dashboard</Link>
              <Link href="/training" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">🧠 AI Training & FAQ</Link>
              <Link href="/catalog-all" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">🖼️ Katalog All Seri</Link>
              <Link href="/catalog-series" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">📱 Katalog Per Seri</Link>
              <Link href="/color-media" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">🎨 Media Warna Per Seri</Link>
              <Link href="/follow-up" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">⏰ Follow Up Otomatis</Link>
              <Link href="/knowledge" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">📚 Knowledge Base</Link>
              <Link href="/reports" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">📈 Laporan Leads</Link>
              <Link href="/settings" onClick={() => setIsSidebarOpen(false)} className="sidebar-item">⚙️ Pengaturan Nomor Admin</Link>
            </nav>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            TECNO Jogja AI System v2.0
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 min-w-0 p-4 md:p-8">
          {children}
        </div>
      </body>
    </html>
  );
}
