'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello, I am NexChat AI. How can I help you?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = async () => {
    if (!inputMessage) return;

    const newMsgs = [...messages, { sender: 'user', text: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);

    // Kirim ke API AI Real-time
    const res = await fetch('/api/admin/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputMessage }),
    });
    const data = await res.json();

    setTimeout(() => {
      setIsTyping(false);
      setMessages([...newMsgs, { sender: 'ai', text: data.reply || 'AI sedang memproses...' }]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Stepper Indicator (Persis Gambar) */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
          Configuration
        </div>
        <span className="text-slate-300">&gt;</span>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">2</span>
          Upload File
        </div>
        <span className="text-slate-300">&gt;</span>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span>
          Create your AI Agent
        </div>
        <span className="text-slate-300">&gt;</span>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">4</span>
          Playground
        </div>
      </div>

      {/* Main Grid Section (Left Info + Right Chat Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Explanation Panel */}
        <div className="space-y-4 pt-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Congratulations 🎉</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            AI Agent kamu telah berhasil dikonfigurasi dan aktif secara real-time. Kamu bisa menguji coba logika dan aturan jawaban langsung di simulator sebelah kanan.
          </p>
          <div className="pt-2">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all">
              Embed chatbot on your site
            </button>
          </div>
        </div>

        {/* Right WhatsApp Simulator Box (Persis Seperti di Gambar) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto w-full">
          {/* Header Chat */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              <span className="font-bold text-sm">X Nexchat</span>
            </div>
            <span className="text-xs text-slate-400">•••</span>
          </div>

          <div className="p-4 bg-slate-50 text-center border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">Chat With Us</h3>
            <div className="flex justify-center gap-2 mt-3">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm cursor-pointer">💬 Chat</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm cursor-pointer">🎧 Helpdesk</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm cursor-pointer">🕒 History</span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 space-y-3 h-80 overflow-y-auto bg-white">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                <span className="text-[11px] ml-1">AI sedang mengetik...</span>
              </div>
            )}
          </div>

          {/* Input Chat */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
            <input
              type="text"
              placeholder="Tulis pesan atau beri instruksi..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleSendChat} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700">Kirim</button>
          </div>
        </div>
      </div>
    </div>
  );
}
