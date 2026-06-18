import React, { useState } from 'react';
import { appendTransactionFirestore, Transaction } from '../lib/db';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function AddTransactionModal({ 
  type, 
  roomId,
  onClose, 
  onSuccess 
}: { 
  type: 'income' | 'expense', 
  roomId: string,
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const isIncome = type === 'income';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    contributor: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.contributor) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      const t: Transaction = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        contributor: form.contributor,
        type,
        amount: parseFloat(form.amount.replace(/\D/g, '') || '0'),
        category: form.description,
        description: form.description,
      };
      await appendTransactionFirestore(roomId, t);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-pink-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300 border border-pink-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-3xl font-serif italic mb-8 ${isIncome ? 'text-pink-600' : 'text-rose-500'}`}>
          {isIncome ? 'Tambah Tabungan' : 'Input Pengeluaran'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">Kontributor</label>
            <input 
              type="text" 
              required
              value={form.contributor}
              onChange={(e) => setForm({ ...form, contributor: e.target.value })}
              placeholder="Fina atau Samudra"
              className="w-full border border-pink-200 rounded-2xl p-4 focus:outline-none focus:border-pink-500 bg-pink-50 text-pink-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600 font-medium">Rp</span>
              <input 
                type="number" 
                required
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="50000"
                className="w-full text-2xl font-serif border border-pink-200 rounded-2xl p-4 pl-12 focus:outline-none focus:border-pink-500 bg-pink-50 text-pink-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">Keterangan Singkat</label>
            <input 
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={isIncome ? 'Setoran Mingguan' : 'Belanja Bulanan'}
              className="w-full border border-pink-200 rounded-2xl p-4 focus:outline-none focus:border-pink-500 bg-pink-50 text-pink-950"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-2xl text-white font-medium transition-opacity disabled:opacity-50 ${
              isIncome 
                ? 'bg-pink-600 hover:opacity-90' 
                : 'bg-rose-500 hover:opacity-90'
            }`}
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
