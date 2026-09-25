'use client';

import { useState, useRef } from 'react';

export default function TrainingPage() {
  const [instruction, setInstruction] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pop-up State
  const [popup, setPopup] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Live Chat Logs State
  const [chatLogs, setChatLogs] = useState<any[]>([
    { sender: 'ai', text: 'Sistem Training AI Aktif. Silakan uji coba aturan baru di sini.', explanation: '' }
  ]);
  const [testInput, setTestInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    }
  };

  // Simpan Training Ke Pusat Kontrol AI
  const handleSaveTraining = async () => {
    if (!instruction.trim() && !selectedFile) {
      setPopup({
        show: true,
        type: 'error',
        title: 'Error!',
        message: 'Mohon ketik instruksi atau pilih media terlebih dahulu.'
      });
      return;
    }

    setIsSaving(true);

    try {
      let mediaUrl = '';
      if (selectedFile) {
        mediaUrl = `https://storage.tecno.id/${selectedFile.name}`;
      }

      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: instruction,
          mediaUrl: mediaUrl,
          mediaType: mediaType
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Tampilkan Popup Sukses Soft 3D
        setPopup({
          show: true,
          type: 'success',
          title: 'Success!',
          message: 'Instruksi AI berhasil disimpan ke Knowledge & Pusat Kontrol.'
        });

        // Ambil text penjelasan dari backend (cegah undefined)
        const understandingText = data.understanding || data.message || 'Instruksi baru berhasil dipahami oleh sistem.';
        const responseText = data.message || 'Training AI Berhasil Diproses.';

        // Tambahkan Log ke Uji Coba Real-Time
        setChatLogs(prev => [
          ...prev,
          {
            sender: 'ai',
            text: responseText,
            explanation: `🧠 **Penjelasan AI (Real-Time):**\n${understandingText}`
          }
        ]);

        // Reset Form
        setInstruction('');
        setSelectedFile(null);
        setFilePreview(null);
        setMediaType(null);
      } else {
        setPopup({
          show: true,
          type: 'error',
          title: 'Error!',
          message: data.error || 'Terjadi kesalahan saat menyimpan ke database.'
        });
      }
    } catch (err) {
      setPopup({
        show: true,
        type: 'error',
        title: 'Error!',
        message: 'Gagal menghubungkan ke server. Silakan coba lagi.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Live Uji Coba AI
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
        { 
          sender: 'ai', 
          text: data.reply || 'Respon AI diproses.', 
          explanation: data.explanation ? `🧠 **Penjelasan AI (Real-Time):**\n${data.explanation}` : '' 
        }
      ]);
    } catch (err) {
      setChatLogs([
        ...newLogs,
        { sender: 'ai', text: 'Maaf, terjadi kendala saat memproses balasan uji coba.', explanation: '' }
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans p-4 relative">
      
      {/* 3D POPUP MODAL */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100 flex flex-col items-center">
            
            {/* Circle Badge Icon */}
            {popup.type === 'success' ? (
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl shadow-lg shadow-blue-300 -mt-12 mb-4 border-4 border-white">
                ✓
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-400 text-white rounded-full flex items-center justify-center text-3xl shadow-lg shadow-rose-200 -mt-12 mb-4 border-4 border-white">
                ✕
              </div>
            )}

            <h3 className="text-xl font-bold text-slate-800 mb-1">{popup.title}</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed px-2">{popup.message}</p>

            <button
              onClick={() => setPopup({ ...popup, show: false })}
              className={`w-full py-3 rounded-full text-xs font-bold text-white shadow-md transition-transform active:scale-95 ${
                popup.type === 'success'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 shadow-blue-200'
                  : 'bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 shadow-rose-200'
              }`}
            >
              {popup.type === 'success' ? 'Continue' : 'Try again'}
            </button>
          </div>
        </div>
      )}

      {/* INPUT TRAINING LIQUID GLASS DARK STYLE */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          📝 Input Instruksi Training AI
        </h2>

        <div className="bg-[#1E252B] rounded-[28px] p-4 shadow-xl border border-slate-700/50 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Message..."
            className="w-full bg-transparent text-slate-100 text-sm placeholder-slate-400 focus:outline-none resize-none px-1"
          />

          {filePreview && (
            <div className="mb-2 p-1.5 bg-slate-800/80 rounded-2xl w-fit border border-slate-600">
              {mediaType === 'image' ? (
                <img src={filePreview} alt="Preview" className="h-20 rounded-xl object-cover" />
              ) : (
                <video src={filePreview} className="h-20 rounded-xl" />
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="bg-slate-800/80 text-slate-300 text-xs font-medium px-4 py-1.5 rounded-full border border-slate-600/50 hover:bg-slate-700 cursor-pointer">
              My reply
            </span>

            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-200 transition-colors text-lg p-1">
                😊
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Lampirkan File/Media"
              >
                📎
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Ambil/Pilih Gambar"
              >
                📷
              </button>

              <button
                onClick={handleSaveTraining}
                disabled={isSaving}
                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-white text-slate-900 flex items-center justify-center font-bold shadow-md transition-all active:scale-90"
                title="Simpan & Terapkan"
              >
                {isSaving ? '⌛' : '🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE UJI COBA AI */}
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

              {log.explanation && (
                <div className="mt-1 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-2.5 rounded-xl max-w-[85%] font-medium leading-relaxed shadow-2xs">
                  {log.explanation}
                </div>
              )}
            </div>
          ))}
          {isTesting && (
            <div className="text-[10px] text-slate-400 italic">AI sedang menganalisis aturan & menyusun balasan...</div>
          )}
        </div>

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
