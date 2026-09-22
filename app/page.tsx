'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [roleTone, setRoleTone] = useState('Ramah & Santai');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [testInput, setTestInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('bot_settings').select('*').limit(1).maybeSingle();
      if (data) {
        setRoleTone(data.role_tone);
        setSystemPrompt(data.system_prompt);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const { data: existing } = await supabase.from('bot_settings').select('id').limit(1).maybeSingle();
    if (existing?.id) {
      await supabase.from('bot_settings').update({ role_tone: roleTone, system_prompt: systemPrompt }).eq('id', existing.id);
    } else {
      await supabase.from('bot_settings').insert([{ role_tone: roleTone, system_prompt: systemPrompt }]);
    }
    alert('Pengaturan AI Berhasil Disimpan!');
  };

  const handleAddKnowledge = async () => {
    if (!kbTitle || !kbContent) return alert('Isi judul dan konten!');
    setLoading(true);
    await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: kbTitle, content: kbContent }),
    });
    setLoading(false);
    setKbTitle('');
    setKbContent('');
    alert('Dokumen berhasil dikonversi ke Vector DB Supabase!');
  };

  const handleTestChat = async () => {
    if (!testInput.trim()) return;
    const msg = testInput;
    setTestInput('');
    setChatHistory((prev) => [...prev, { sender: 'User', text: msg }]);

    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: '62812345678', sender_name: 'Tester', message: msg }),
    });
    const data = await res.json();
    setChatHistory((prev) => [...prev, { sender: 'AI', text: data.reply || 'Error' }]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-100 to-blue-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">WA Bot AI Command Center</h1>
            <p className="text-sm text-slate-500">Kelola instruksi, RAG Knowledge Base, dan Uji Coba AI</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-full text-xs font-semibold">
            🟢 Supabase Connected
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-blue-900">Cara AI Menjawab (System Prompt)</h2>
              <div>
                <label className="text-xs font-semibold text-slate-600">Gaya Bahasa</label>
                <select 
                  value={roleTone} 
                  onChange={(e) => setRoleTone(e.target.value)} 
                  className="w-full mt-1 p-3 rounded-xl bg-white/70 border border-white text-sm"
                >
                  <option>Ramah & Santai</option>
                  <option>Formal & Profesional</option>
                  <option>Direct & Persuasif (Sales)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Instruksi Utama</label>
                <textarea 
                  rows={4} 
                  value={systemPrompt} 
                  onChange={(e) => setSystemPrompt(e.target.value)} 
                  placeholder="Contoh: Kamu adalah CS Toko Sepatu. Selalu jawab dengan sopan dan tanyakan ukuran kaki pelanggan..." 
                  className="w-full mt-1 p-3 rounded-xl bg-white/70 border border-white text-sm"
                />
              </div>
              <button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition">
                💾 Simpan Instruksi
              </button>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-blue-900">Basis Pengetahuan Produk (RAG)</h2>
              <input 
                type="text" 
                placeholder="Judul Info (misal: Jam Operasional / Daftar Harga)" 
                value={kbTitle} 
                onChange={(e) => setKbTitle(e.target.value)} 
                className="w-full p-3 rounded-xl bg-white/70 border border-white text-sm"
              />
              <textarea 
                rows={3} 
                placeholder="Rincian informasi produk / FAQ bisnis Anda..." 
                value={kbContent} 
                onChange={(e) => setKbContent(e.target.value)} 
                className="w-full p-3 rounded-xl bg-white/70 border border-white text-sm"
              />
              <button onClick={handleAddKnowledge} disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition">
                {loading ? 'Mengindeks Vector...' : '+ Tambah ke Database Vector'}
              </button>
            </div>

          </div>

          <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-blue-900">Simulator AI</h2>
            <div className="h-80 bg-white/40 rounded-xl p-3 overflow-y-auto space-y-2 text-xs border border-white">
              {chatHistory.map((c, i) => (
                <div key={i} className={`p-2.5 rounded-xl max-w-[85%] ${c.sender === 'User' ? 'bg-blue-600 text-white ml-auto' : 'bg-white text-slate-800 border'}`}>
                  <b>{c.sender}:</b> {c.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ketik tes pesan..." 
                value={testInput} 
                onChange={(e) => setTestInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()} 
                className="flex-grow p-2.5 rounded-xl bg-white/70 border border-white text-sm"
              />
              <button onClick={handleTestChat} className="bg-blue-600 text-white px-4 rounded-xl text-sm font-semibold">
                Kirim
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
