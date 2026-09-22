'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // Form Input Katalog Baru
  const [pName, setPName] = useState('');
  const [pSeries, setPSeries] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pColors, setPColors] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [msgCatalog, setMsgCatalog] = useState('');

  const loadData = async () => {
    try {
      const resCat = await fetch('/api/admin/catalog');
      const dataCat = await resCat.json();
      if (dataCat.catalog) setCatalog(dataCat.catalog);

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

  // Simpan Produk Baru
  const handleAddProduct = async () => {
    setMsgCatalog('Menyimpan produk...');
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pName,
          series: pSeries,
          price: parseFloat(pPrice) || 0,
          colors: pColors,
          image_url: pImageUrl,
          description: pDesc,
        }),
      });

      if (res.ok) {
        setMsgCatalog('✅ Produk & Gambar berhasil ditambahkan!');
        setPName(''); setPSeries(''); setPPrice(''); setPColors(''); setPImageUrl(''); setPDesc('');
        loadData();
      } else {
        setMsgCatalog('❌ Gagal menyimpan produk.');
      }
    } catch (e) {
      setMsgCatalog('❌ Error koneksi.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Hapus produk ini dari katalog?')) return;
    await fetch('/api/admin/catalog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem', fontFamily: 'sans-serif', color: '#1f2937' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>
            📦 Katalog Produk & AI Command Center
          </h1>
        </div>

        {/* SECTION: INPUT KATALOG PRODUK & WARNA */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            📸 Input Katalog, Gambar & Warna Produk
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Nama Produk (misal: TECNO Camon 30 Pro)"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <input
              type="text"
              placeholder="Seri / Tipe (misal: Camon Series)"
              value={pSeries}
              onChange={(e) => setPSeries(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <input
              type="number"
              placeholder="Harga (misal: 3500000)"
              value={pPrice}
              onChange={(e) => setPPrice(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <input
              type="text"
              placeholder="Pilihan Warna (misal: Black Star, Glacier White)"
              value={pColors}
              onChange={(e) => setPColors(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="URL Gambar/Foto Katalog (Contoh: https://i.imgur.com/sample.jpg)"
              value={pImageUrl}
              onChange={(e) => setPImageUrl(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <textarea
              rows={2}
              placeholder="Deskripsi / Keunggulan Produk"
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleAddProduct}
              disabled={!pName || !pImageUrl}
              style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 'bold', padding: '0.625rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              📥 Simpan Ke Katalog AI
            </button>
            {msgCatalog && <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#4b5563' }}>{msgCatalog}</p>}
          </div>
        </div>

        {/* SECTION: LIST PRODUK AKTIF */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem' }}>
            📱 Daftar Katalog & Sampel Warna
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {catalog.map((item) => (
              <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', backgroundColor: '#f9fafb' }}>
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }} />
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>{item.name}</strong>
                <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 'bold', margin: '0.25rem 0' }}>
                  Rp{Number(item.price).toLocaleString('id-ID')}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.25rem 0' }}>
                  🎨 <strong>Warna:</strong> {item.colors || '-'}
                </p>
                <button
                  onClick={() => handleDeleteProduct(item.id)}
                  style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  🗑️ Hapus Produk
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
