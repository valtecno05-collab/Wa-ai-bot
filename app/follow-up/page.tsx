'use client';

import { useState } from 'react';

export default function FollowUpPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSchedule = async () => {
    await fetch('/api/admin/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, scheduleDate, scheduleTime }),
    });
    alert('Jadwal Follow-Up Berhasil Disimpan!');
    setPhone(''); setMessage('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">⏰ Follow Up Otomatis Scheduled</h1>
        <p className="text-xs text-slate-500">Atur jadwal pengiriman pesan follow up otomatis berdasarkan jam & tanggal pilihan.</p>
      </div>

      <div className="card-box p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Target</label>
          <input
            type="text"
            placeholder="081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kirim</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jam Kirim</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pesan Follow Up</label>
          <textarea
            rows={3}
            placeholder="Halo kak, bagaimanakah kelanjutan pesanan seri TECNO kemarin?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
          />
        </div>

        <button
          onClick={handleSchedule}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all"
        >
          🚀 Jadwalkan Follow Up
        </button>
      </div>
    </div>
  );
}
