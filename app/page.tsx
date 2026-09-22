'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [style, setStyle] = useState('Ramah, profesional, dan membantu.');
  const [instruction, setInstruction] = useState('Jawab pertanyaan pelanggan dengan singkat dan jelas.');
  const [statusMsg, setStatusMsg] = useState('');
  const [leads, setLeads] = useState<any[]>([]);

  // Auto-refresh data monitoring setiap 5 detik
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error('Gagal mengambil data monitoring', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toggle AI ON/OFF
  const toggleAI = async (phoneNumber: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, is_ai_active: !currentStatus }),
      });
      fetchLeads();
    } catch (err) {
      alert('Gagal mengubah status AI');
    }
  };

  const handleSave = async () => {
    setStatusMsg('Menyimpan...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, instruction }),
      });
      if (res.ok) setStatusMsg('✅ Instruksi berhasil disimpan!');
      else setStatusMsg('❌ Gagal menyimpan.');
    } catch (err) {
      setStatusMsg('❌ Kesalahan jaringan.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem', fontFamily: 'sans-serif', color: '#1f2937' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 0.5rem 0' }}>
            WA Bot AI Command Center
          </h1>
          <span style={{ backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: '600', padding: '4px 12px', borderRadius: '9999px' }}>
            🟢 Live Monitoring Active
          </span>
        </div>

        {/* Realtime Monitoring & Switch AI */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            📱 Monitoring Chat Customer Realtime
          </h2>

          {leads.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Belum ada obrolan masuk.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leads.map((item) => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>📞 {item.phone_number}</strong>
                    <button
                      onClick={() => toggleAI(item.phone_number, item.is_ai_active)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        backgroundColor: item.is_ai_active ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {item.is_ai_active ? '⏹️ Hentikan AI (Takeover)' : '▶️ Aktifkan AI'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0', color: '#4b5563' }}>
                    <strong>Sumber:</strong> {item.source || '-'} | <strong>Cari:</strong> {item.phone_series_searched || '-'}
                  </p>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f3f4f6' }}>
                    <p style={{ margin: 0, color: '#1e40af' }}>💬 <strong>Customer:</strong> {item.last_message || '-'}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#065f46' }}>🤖 <strong>AI:</strong> {item.last_reply || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Prompt Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            ⚙️ Pengaturan AI
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Gaya Bahasa</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', color: '#111827', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Instruksi Utama</label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', color: '#111827', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', padding: '0.625rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            💾 Simpan Instruksi
          </button>
          {statusMsg && <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', color: '#4b5563' }}>{statusMsg}</p>}
        </div>

      </div>
    </div>
  );
}
