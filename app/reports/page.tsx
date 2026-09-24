'use client';

export default function ReportsPage() {
  const handleDownloadExcel = () => {
    window.open('/api/admin/reports/excel', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📈 Laporan Leads & Data Customer</h1>
          <p className="text-xs text-slate-500">Laporan mingguan dikirim otomatis ke nomor admin berbentuk Excel.</p>
        </div>
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
        >
          📊 Unduh File Excel (.xlsx)
        </button>
      </div>

      <div className="card-box overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-4">Nomor HP Customer</th>
              <th className="p-4">Sumber Leads</th>
              <th className="p-4">Seri Yang Dicari</th>
              <th className="p-4">Tanggal Masuk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            <tr>
              <td className="p-4">081298765432</td>
              <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">TikTok Ads</span></td>
              <td className="p-4">TECNO CAMON 30 Pro</td>
              <td className="p-4">25 Sep 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
