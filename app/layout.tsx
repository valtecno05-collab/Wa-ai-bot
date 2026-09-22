import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TECNO AI Command Center',
  description: 'TECNO AI Management Dashboard',
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: linear-gradient(135deg, #f0f6ff 0%, #e0eefd 50%, #f8fafc 100%);
            color: #0f172a;
            min-height: 100vh;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 102, 255, 0.15);
            box-shadow: 0 10px 30px rgba(0, 80, 200, 0.08);
          }
          .glass-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.04);
            transition: all 0.25s ease-in-out;
          }
          .glass-card:hover {
            border-color: #0066ff;
            box-shadow: 0 8px 25px rgba(0, 102, 255, 0.12);
            transform: translateY(-2px);
          }
          /* Perbaikan Kolom Input: Teks Gelap, Latar Putih Tegas, Placeholder Jelas */
          .glass-input {
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
            font-weight: 500;
          }
          .glass-input::placeholder {
            color: #94a3b8 !important;
            font-weight: 400;
          }
          .glass-input:focus {
            border-color: #0066ff !important;
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15) !important;
          }
        `}</style>
      </head>
      <body className="flex min-h-screen">
        {/* Sidebar TECNO Theme */}
        <aside className="w-64 glass-panel m-4 rounded-3xl p-6 flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0052cc] to-[#0088ff] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                T
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-[#0052cc] tracking-wide">
                  TECNO <span className="text-sky-500">AI</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Command Center</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:text-[#0052cc] hover:bg-blue-50/80 transition-all">
                📊 Dashboard
              </Link>
              <Link href="/brain" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:text-[#0052cc] hover:bg-blue-50/80 transition-all">
                🧠 Otak & Logika AI
              </Link>
              <Link href="/catalog" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:text-[#0052cc] hover:bg-blue-50/80 transition-all">
                📦 Katalog & Warna
              </Link>
              <Link href="/live-chats" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:text-[#0052cc] hover:bg-blue-50/80 transition-all">
                💬 Live Control Chat
              </Link>
            </nav>
          </div>

          <div className="glass-card p-4 rounded-2xl text-xs text-slate-500 text-center bg-blue-50/50 border-blue-100">
            <p className="font-bold text-slate-700">Status WhatsApp AI</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-600 font-bold">Terhubung & Aktif</span>
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
