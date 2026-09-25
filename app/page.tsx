'use client';

import { useState } from 'react';
import AiToggle from './components/AiToggle';

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hallo selamat datang di Tecno Official Store Jogja ada yang bisa saya bantu hari ini.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        setMessages([...newMsgs, { sender: 'ai', text: data.reply }]);
      }, 800);
    } catch {
      setIsTyping(false);
      setMessages([...newMsgs, { sender: 'ai', text: 'Maaf, terjadi kendala saat memproses balasan.' }]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans p-4">
      {/* Tombol Control ON/OFF AI */}
      <AiToggle />

      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-md">
        <h1 className="text-xl md:text-2xl font-bold">TECNO Official Store Jogja - Command Center</h1>
        <p className="text-xs text-blue-100 mt-1">Sistem Otomatisasi WhatsApp & Live Customer Chat Tester.</p>
      </div>

      {/* Simulator Chat Mockup */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-2 py-0.5 rounded">TECNO</span>
            <span className="font-bold text-xs">Official Store Jogja</span>
          </div>
          <span className="text-xs text-emerald-400">● Online (Real-Time Test)</span>
        </div>

        <div className="p-4 space-y-3 h-80 overflow-y-auto bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-xs text-slate-400 italic p-2">AI sedang mengetik balasan...</div>}
        </div>

        <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan sebagai customer..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="flex-1 bg-slate-100 border-0 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSendChat} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700">Kirim</button>
        </div>
      </div>
    </div>
  );
}
