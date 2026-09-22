'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  
  // Form Tambah Fitur Baru
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const resConfig = await fetch('/api/admin/config');
      const dataConfig = await resConfig.json();
      if (dataConfig.configs) setConfigs(dataConfig.configs);

      const resLeads = await fetch('/api/admin/leads');
      const dataLeads = await resLeads.json();
      if (dataLeads.leads) setLeads(dataLeads.leads);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simpan / Update Fitur AI
  const handleSaveFeature = async (featureName: string, desc: string, promptText: string, activeStatus: boolean) => {
    setMsg('Menyimpan...');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_name: featureName,
          description: desc,
          system_prompt: promptText,
          is_active: activeStatus,
        }),
      });

      if (res.ok) {
        setMsg('✅ Fitur AI Berhasil Diperbarui!');
        setNewFeatureName('');
        setNewDescription('');
        setNewPrompt('');
        loadData();
      } else {
        setMsg('❌ Gagal menyimpan.');
      }
    } catch (e) {
      setMsg('❌ Terjadi kesalahan jaringan.');
    }
  };

  // Hapus Fitur AI
  const handleDeleteFeature = async (featureName: string) => {
    if (!confirm(`Hapus fitur ${featureName}?`)) return;
    await fetch('/api/admin/config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_name: featureName }),
    });
    loadData();
  };

  // Switch Control AI Customer
  const toggleAICustomer = async (phoneNumber: string, currentStatus: boolean) => {
    await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phoneNumber, is_ai_active: !currentStatus }),
    });
    loadData();
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem', fontFamily: 'sans-serif', color: '#1f2937' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>
            🧠 Central AI Command & Feature Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
            Atur dan tambah kemampuan AI secara otomatis tanpa perlu ubah kodingan.
          </p>
        </div>

        {/* Form Tambah Fitur AI Baru */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            ➕ Tambah Fitur / Aturan AI Baru
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Nama Fitur (contoh: promo_garansi / cs_complaint)"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              placeholder="Deskripsi Singkat Fitur"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <textarea
              rows={3}
              placeholder="Instruksi / System Prompt Fitur (contoh: Jika customer tanya garansi, jelaskan garansi resmi 12 bulan dan cara klaimnya...)"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <button
              onClick={() => handleSaveFeature(newFeatureName, newDescription, newPrompt, true)}
              disabled={!newFeatureName || !newPrompt}
              style={{ backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', padding: '0.625rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              🚀 Aktifkan & Terapkan Fitur Baru
            </button>
            {msg && <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#4b5563' }}>{msg}</p>}
          </div>
        </div>

        {/* Daftar Fitur AI Terpasang */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            ⚙️ Fitur & Prompt AI Aktif
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {configs.map((cfg) => (
              <div key={cfg.id} style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>📌 {cfg.feature_name}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleSaveFeature(cfg.feature_name, cfg.description, cfg.system_prompt, !cfg.is_active)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cfg.is_active ? '#16a34a' : '#6b7280', color: '#fff' }}
                    >
                      {cfg.is_active ? 'Status: ON' : 'Status: OFF'}
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(cfg.feature_name)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#dc2626', color: '#fff' }}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>{cfg.description}</p>
                <textarea
                  rows={2}
                  defaultValue={cfg.system_prompt}
                  onBlur={(e) => handleSaveFeature(cfg.feature_name, cfg.description, e.target.value, cfg.is_active)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Live Monitoring */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            📱 Realtime Monitoring Chat Customer
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leads.map((item) => (
              <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>📞 {item.phone_number}</strong>
                  <button
                    onClick={() => toggleAICustomer(item.phone_number, item.is_ai_active)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: item.is_ai_active ? '#dc2626' : '#16a34a' }}
                  >
                    {item.is_ai_active ? '⏹️ Stop AI' : '▶️ Start AI'}
                  </button>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: '0.5rem 0 0 0' }}>💬 {item.last_message || '-'}</p>
                <p style={{ fontSize: '0.875rem', color: '#065f46', margin: '0.25rem 0 0 0' }}>🤖 {item.last_reply || '-'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
