import React, { useEffect, useState, useMemo } from 'react';
import { deleteTransactionFirestore, subscribeTransactions, Transaction } from '../lib/db';
import { logoutUser } from '../lib/firebase';
import { Plus, TrendingUp, TrendingDown, Target, Trash2, LogOut, Copy, CheckCircle2 } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function DashboardScreen({ roomId, onReset }: { roomId: string, onReset: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeTransactions(roomId, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    try {
      await deleteTransactionFirestore(roomId, id);
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLogout = async () => {
    await logoutUser();
    window.location.reload();
  };

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const pieData = [
    { name: 'Pengeluaran', value: summary.expense, color: '#D4A373' }, 
    { name: 'Sisa Tabungan', value: Math.max(0, summary.balance), color: '#5A5A40' } 
  ];

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] pb-28">
      {/* Header */}
      <header className="px-6 mt-6 flex justify-between items-center max-w-lg mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white font-bold text-xl">K</div>
          <h1 className="text-2xl font-serif font-bold italic tracking-tight text-[#3D3D33]">Kasita</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="w-10 h-10 border border-[#E5E2D9] bg-white rounded-full flex items-center justify-center hover:bg-[#FAF9F6] transition text-[#3D3D33]"
            title="Salin Kode Ruang"
          >
            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 border border-[#E5E2D9] bg-white rounded-full flex items-center justify-center hover:bg-[#FAF9F6] transition text-[#3D3D33]"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>


      {/* Main Content */}
      <main className="px-6 space-y-6 max-w-lg mx-auto">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E5E2D9] flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-[#8C8A7D] font-bold mb-1">Tabungan Bersama</p>
            <h2 className="text-4xl sm:text-5xl font-serif font-light mb-8 text-[#3D3D33]">
              {formatCurrency(summary.balance)}
            </h2>
          </div>

          <div className="flex gap-4 mb-2">
            <div className="flex-1 bg-[#FAF9F6] rounded-2xl p-4 border border-[#F1EFE9]">
              <p className="text-xs font-bold uppercase text-[#8C8A7D] mb-1">Pemasukan</p>
              <p className="text-lg font-serif text-[#3D3D33]">{formatCurrency(summary.income)}</p>
            </div>
            <div className="flex-1 bg-[#FAF9F6] rounded-2xl p-4 border border-[#F1EFE9]">
              <p className="text-xs font-bold uppercase text-[#8C8A7D] mb-1">Pengeluaran</p>
              <p className="text-lg font-serif text-[#3D3D33]">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        {summary.income > 0 && (
          <div className="bg-white p-6 rounded-[32px] border border-[#E5E2D9] shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C8A7D] mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#5A5A40]" />
              Progres Dana
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E2D9] shadow-sm flex flex-col pt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-[#3D3D33]">Aktivitas Terkini</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-[#E5E2D9] border-t-[#5A5A40] rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-[#E5E2D9] rounded-2xl">
              <p className="text-[#8C8A7D]">Belum ada transaksi.</p>
              <p className="text-sm text-[#5A5A40] mt-1 italic">Mulai catat tabungan pertama kalian!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 10).map(t => (
                <div key={t.id} className="flex items-center justify-between py-4 border-b border-[#F1EFE9] group last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#5A5A40]">
                      {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3D3D33]">{t.description || t.category}</p>
                      <p className="text-xs text-[#8C8A7D]">
                        Oleh <span className="font-bold">{t.contributor}</span> &bull; {new Date(t.date).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className={`font-medium ${t.type === 'income' ? 'text-[#5A5A40]' : 'text-[#D4A373]'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition mt-1"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Custom Bottom Bar Action */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm flex gap-4">
        <button 
          onClick={() => { setTransactionType('income'); setShowAddModal(true); }}
          className="flex-1 py-4 bg-[#5A5A40] text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg text-sm flex justify-center items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Dana
        </button>
        <button 
          onClick={() => { setTransactionType('expense'); setShowAddModal(true); }}
          className="flex-1 py-4 bg-[#D4A373] text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg text-sm flex justify-center items-center gap-2"
        >
          - Pengeluaran
        </button>
      </div>

      {showAddModal && (
        <AddTransactionModal 
          type={transactionType}
          roomId={roomId}
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}
