'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function KnowledgePage() {
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledgeList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal memuat knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus instruksi ini dari memori AI?')) return;
    await supabase.from('knowledge_base').delete().eq('id', id);
    fetchKnowledge();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans p-4">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📚 Database Pengetahuan AI (Pusat Kontrol)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Total Aktif: {knowledgeList.length} Aturan/Instruksi Terindeks.</p>
        </div>
        <button 
          onClick={fetchKnowledge} 
          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

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
                  {item.title || 'Instruksi AI'}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1">{item.content}</p>
                <span className="text-[10px] text-slate-400 block pt-1">Dibuat: {new Date(item.created_at).toLocaleString('id-ID')}</span>
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
