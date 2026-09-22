'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [style, setStyle] = useState('Ramah, profesional, dan membantu.');
  const [instruction, setInstruction] = useState('Jawab pertanyaan pelanggan dengan singkat dan jelas.');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Simpan Setting ke Supabase via API
  const handleSave = async () => {
    setStatusMsg('Menyimpan...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, instruction }),
      });
      if (res.ok) {
        setStatusMsg('✅ Instruksi berhasil disimpan!');
      } else {
        setStatusMsg('❌ Gagal menyimpan instruksi.');
      }
    } catch (err) {
      setStatusMsg('❌ Terjadi kesalahan jaringan.');
    }
  };

  // Uji Coba AI
  const handleTest = async () => {
    if (!testInput) return;
    setLoading(true);
    setTestOutput('');
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testInput, style, instruction }),
      });
      const data = await res.json();
      setTestOutput(data.reply || data.message || 'Tidak ada respon.');
    } catch (err) {
      setTestOutput('❌ Error koneksi ke AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem', fontFamily: 'sans-serif', color: '#1f2937' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 0.5rem 0' }}>
            WA Bot AI Command Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
            Kelola instruksi, RAG Knowledge Base, dan Uji Coba AI
          </p>
          <span style={{ display: 'inline-block', marginTop: '0.75rem', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: '600', padding: '4px 12px', borderRadius: '9999px' }}>
            🟢 Supabase Connected
          </span>
        </div>

        {/* System Prompt Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            Cara AI Menjawab (System Prompt)
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Gaya Bahasa
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#111827', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Instruksi Utama
            </label>
            <textarea
              rows={4}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#111827', fontSize: '0.875rem', boxSizing: 'border-box' }}
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

        {/* Test AI Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            Uji Coba AI
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Ketik pesan tes..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#111827', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#059669', color: '#ffffff', fontWeight: '600', padding: '0.625rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            {loading ? 'Memproses...' : '🚀 Tes Respon AI'}
          </button>

          {testOutput && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#1f2937' }}>
              <strong>Hasil:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{testOutput}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
