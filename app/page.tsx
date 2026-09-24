'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya NexChat AI. Ada yang bisa dibantu?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = async () => {
    if (!inputMessage) return;

    const newMsgs = [...messages, { sender: 'user', text: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        setMessages([...newMsgs, { sender: 'ai', text: data.reply || 'Instruksi berhasil diproses.' }]);
      }, 1000);
    } catch {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto font-sans">
      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-xl font-bold">🚀 Nexchat Command Center</h1>
        <p className="text-xs text-blue-100 mt-1">Sistem Training AI, Follow-Up, & Media Otomatis Active.</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-800 text-sm">🧪 Simulator Training AI</h2>
          <p className="text-[11px] text-slate-400">Ketik perintah follow-up, tambah FAQ, atau set aturan media di sini.</p>
        </div>

        <div className="space-y-3 h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-xs text-slate-400 italic p-2">AI sedang memproses...</div>}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Coba: followup 08123... atau kirim gambar..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="flex-1 bg-slate-100 border-0 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSendChat} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">Kirim</button>
        </div>
      </div>
    </div>
  );
}
