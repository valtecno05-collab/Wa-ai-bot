'use client';

import { useState, useEffect } from 'react';

export default function LiveChatsPage() {
  const [leads, setLeads] = useState<any[]>([]);

  const loadLeads = async () => {
    const res = await fetch('/api/admin/leads');
    const data = await res.json();
    if (data.leads) setLeads(data.leads);
  };

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleAI = async (phone: string, status: boolean) => {
    await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, is_ai_active: !status }),
    });
    loadLeads();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💬 Live Control Chat</h1>
        <p className="text-xs text-slate-400">Pantau obrolan atau matikan AI jika ingin menjawab manual.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {leads.map((item) => (
          <div key={item.id} className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-purple-300">📞 {item.phone_number}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_ai_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {item.is_ai_active ? 'AI Active' : 'AI Paused (Manual)'}
                </span>
              </div>
              <p className="text-xs text-indigo-300">💬 Cust: {item.last_message || '-'}</p>
              <p className="text-xs text-emerald-300">🤖 AI: {item.last_reply || '-'}</p>
            </div>

            <button
              onClick={() => toggleAI(item.phone_number, item.is_ai_active)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${item.is_ai_active ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
            >
              {item.is_ai_active ? '⏹️ Takeover (Stop AI)' : '▶️ Resume AI'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
