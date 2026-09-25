'use client';

import { useState, useEffect } from 'react';

export default function KnowledgePage() {
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge');
      const data = await res.json();
      setKnowledgeList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal memuat knowledge', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus instruksi ini dari memori AI?')) return;
    await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
    fetchKnowledge();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans p-4">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📚 Database Pengetahuan AI (Real-Time)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh instruksi, aturan promo, dan media yang dipelajari oleh AI TECNO.</p>
        </div>
        <button 
          onClick={fetchKnowledge} 
          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="text-center py-10 text-xs text-slate-400">Memuat data dari database...</div>
      ) : knowledgeList.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Belum ada pelajaran tersimpan. Latih AI kamu di menu <b>AI Training</b>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {knowledgeList.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start gap-4 hover:border-slate-300 transition-all">
              <div className="space-y-1">
                <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md">
                  Instruksi Tersimpan
                </span>
                <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors p-1"
                title="Hapus Knowledge"
              >
                🗑️ Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
