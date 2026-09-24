import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nexchat AI Command Center',
  description: 'AI Management & Training Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f6fc;
            color: #1e293b;
          }
          .sidebar-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
            transition: all 0.2s;
          }
          .sidebar-item:hover, .sidebar-item.active {
            color: #2563eb;
            background-color: #eff6ff;
          }
          .card-box {
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          }
        `}</style>
      </head>
      <body className="flex min-h-screen">
        {/* Sidebar Left */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Logo Nexchat */}
            <div className="flex items-center gap-2 mb-8">
              <div className="text-blue-600 font-extrabold text-2xl">X</div>
              <span className="font-bold text-lg text-slate-800">Nexchat</span>
            </div>

            {/* Menu Navigation */}
            <nav className="space-y-1">
              <Link href="/" className="sidebar-item active">📊 Dashboard</Link>
              <Link href="/live-chats" className="sidebar-item">💬 Live Control AI</Link>
              <Link href="/training" className="sidebar-item">🧠 AI Training & FAQ</Link>
              <Link href="/follow-up" className="sidebar-item">⏰ Follow Up Otomatis</Link>
              <Link href="/catalog" className="sidebar-item">🖼️ Media Katalog</Link>
              <Link href="/knowledge" className="sidebar-item">📚 Knowledge Base</Link>
              <Link href="/reports" className="sidebar-item">📈 Laporan & Leads Excel</Link>
              <Link href="/settings" className="sidebar-item">⚙️ Pengaturan Nomor Admin</Link>
            </nav>
          </div>

          {/* Quick Onboarding Bubble Card (Persis Gambar) */}
          <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white p-5 rounded-2xl text-center shadow-lg shadow-blue-500/20">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">🌐</div>
            <h4 className="font-bold text-sm mb-1">Quick Onboarding</h4>
            <p className="text-[11px] text-blue-100 mb-3">Set up your AI Agent in a few simple steps.</p>
            <button className="w-full py-2 bg-white text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all">Get Started</button>
          </div>
        </aside>

        {/* Main Content & Top Header */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Navigation */}
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-lg">Onboarding</span>
              <span className="text-xs text-slate-400 font-medium">/ Step-by-Step Guide for AI Agent</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-600">⚙️</button>
              <button className="text-slate-400 hover:text-slate-600">🔔</button>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Avatar" />
              </div>
            </div>
          </header>

          <main className="p-6 md:p-8 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
