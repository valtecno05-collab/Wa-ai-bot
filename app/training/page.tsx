'use client';

import { useState } from 'react';

export default function TrainingPage() {
  const [instruction, setInstruction] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk Live Uji Coba AI
  const [testInput, setTestInput] = useState('');
  const [chatLogs, setChatLogs] = useState<any[]>([
    { sender: 'ai', text: 'Sistem Training AI Aktif. Silakan uji coba aturan baru di sini.', explanation: '' }
  ]);
  const [isTesting, setIsTesting] = useState(false);

  // Fungsi Simpan Training
  const handleSaveTraining = async () => {
    if (!instruction.trim()) return alert('Ketik instruksi training terlebih dahulu.');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: instruction }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Instruksi berhasil disimpan ke Knowledge Base!');
        setInstruction('');
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kendala koneksi');
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi Live Uji Coba AI
  const handleTestAI = async () => {
    if (!testInput.trim()) return;

    const userQuery = testInput;
    const newLogs = [...chatLogs, { sender: 'user', text: userQuery }];
    setChatLogs(newLogs);
    setTestInput('');
    setIsTesting(true);

    try {
      const res = await fetch('/api/chat/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery }),
      });
      const data = await res.json();

      setChatLogs([
        ...newLogs,
        { sender: 'ai', text: data.reply, explanation: data.explanation }
      ]);
    } catch (err) {
      setChatLogs([
        ...newLogs,
        { sender: 'ai', text: 'Maaf, gagal memproses balasan uji coba.', explanation: '' }
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans p-4">
      {/* Box Input Training */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800">📝 Input Instruksi Training</h2>
        <textarea
          rows={4}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Ketik instruksi atau aturan di sini... (Contoh: Jika ditanya garansi, jawab garansi resmi TECNO 13 bulan)"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveTraining}
          disabled={isSaving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md"
        >
          {isSaving ? 'Menyimpan & Melatih AI...' : '🚀 Simpan & Terapkan Ke AI'}
        </button>
      </div>

      {/* Box Live Uji Coba AI */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          🧪 Live Uji Coba AI (Real-Time Test)
        </h2>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl h-80 overflow-y-auto space-y-3">
          {chatLogs.map((log, index) => (
            <div key={index} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3 rounded-2xl text-xs max-w-[85%] whitespace-pre-line ${
                  log.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                {log.text}
              </div>

              {/* Penjelasan Real-Time Aturan yang Dipahami AI */}
              {log.explanation && (
                <div className="mt-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2 rounded-xl max-w-[85%] font-medium shadow-2xs">
                  {log.explanation}
                </div>
              )}
            </div>
          ))}
          {isTesting && (
            <div className="text-[10px] text-slate-400 italic">AI sedang menganalisis aturan & menyusun balasan...</div>
          )}
        </div>

        {/* Input Uji Coba */}
        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestAI()}
            placeholder="Uji coba balasan AI..."
            className="flex-1 bg-slate-100 border-0 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTestAI}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
          >
            Tes
          </button>
        </div>
      </div>
    </div>
  );
}
