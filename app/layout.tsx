import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Command Center',
  description: 'Liquid Glass AI Management Dashboard',
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at top left, #1e1b4b, #0f172a, #020617);
            color: #f8fafc;
            min-height: 100vh;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .glass-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(168, 85, 247, 0.4);
            transform: translateY(-2px);
          }
          .glass-input {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
          }
          .glass-input:focus {
            border-color: #a855f7;
            outline: none;
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
          }
        `}</style>
      </head>
      <body className="flex min-h-screen">
        {/* Sidebar Liquid Glass */}
        <aside className="w-64 glass-panel m-4 rounded-3xl p-6 flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/30">
                ⚡
              </div>
              <div>
                <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                  NEXUS AI
                </h1>
                <p className="text-xs text-slate-400">v2.5 Liquid Glass</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                📊 Dashboard
              </Link>
              <Link href="/brain" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                🧠 Otak & Logika AI
              </Link>
              <Link href="/catalog" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                📦 Katalog & Warna
              </Link>
              <Link href="/live-chats" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                💬 Live Control Chat
              </Link>
            </nav>
          </div>

          <div className="glass-card p-4 rounded-2xl text-xs text-slate-400 text-center">
            <p className="font-semibold text-slate-200">System Status</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-medium">WhatsApp Sync ON</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
