'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [adminPhone, setAdminPhone] = useState('');
  const [forwardPhone, setForwardPhone] = useState('');
  const [enableForwardLeads, setEnableForwardLeads] = useState(true);
  const [enableForwardHandover, setEnableForwardHandover] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Ambil data pengaturan saat ini
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAdminPhone(data.admin_phone || '');
          setForwardPhone(data.forward_phone || '');
          setEnableForwardLeads(data.forward_leads ?? true);
          setEnableForwardHandover(data.forward_handover ?? true);
        }
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_phone: adminPhone,
        forward_phone: forwardPhone,
        forward_leads: enableForwardLeads,
        forward_handover: enableForwardHandover,
      }),
    });

    setIsSaving(false);
    if (res.ok) {
      alert('✅ Pengaturan Nomor Admin & Forward Berhasil Disimpan!');
    } else {
      alert('Gagal menyimpan pengaturan.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Pengaturan Nomor Admin & Forward</h1>
        <p className="text-xs text-slate-500">Atur nomor WhatsApp admin penerima rekap mingguan dan nomor tujuan forward pesan otomatis.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Admin Utama</label>
          <input
            type="text"
            placeholder="081234567890"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p className="text-[10px] text-slate-400 mt-1">Nomor ini akan menerima laporan Excel Leads mingguan setiap hari Minggu.</p>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Forward (Penerus Pesan)</label>
          <input
            type="text"
            placeholder="089876543210"
            value={forwardPhone}
            onChange={(e) => setForwardPhone(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p className="text-[10px] text-slate-400 mt-1">Pesan tertentu dari pelanggan di WhatsApp akan diteruskan secara otomatis ke nomor ini.</p>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-700">Aturan Pengiriman Forward:</h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableForwardLeads}
              onChange={(e) => setEnableForwardLeads(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700">Forward otomatis saat ada Customer/Leads Baru masuk</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableForwardHandover}
              onChange={(e) => setEnableForwardHandover(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700">Forward pesan ketika customer minta berbicara dengan CS/Manusia (*Handover*)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          {isSaving ? 'Menyimpan...' : '💾 Simpan Pengaturan Nomor Admin'}
        </button>
      </form>
    </div>
  );
}
