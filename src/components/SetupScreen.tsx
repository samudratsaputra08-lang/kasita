import React, { useState } from 'react';
import { createSpace } from '../lib/db';
import { FileSpreadsheet, Link, Plus, ArrowRight } from 'lucide-react';

export default function SetupScreen({ onComplete }: { onComplete: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'select' | 'new' | 'join'>('select');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateNew = async () => {
    setLoading(true);
    setError('');
    try {
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      await createSpace(id);
      localStorage.setItem('kasitaRoomId', id);
      onComplete(id);
    } catch (err: any) {
      console.error(err);
      setError('Gagal membuat ruang bersama.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('kasitaRoomId', roomId.trim().toUpperCase());
      onComplete(roomId.trim().toUpperCase());
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] border border-[#E5E2D9] shadow-sm p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-[#5A5A40] text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif text-[#3D3D33] italic">Mulai Tabungan</h2>
          <p className="text-[#8C8A7D] text-sm">
            Pilih apakah Anda ingin membuat ruang baru atau bergabung dengan pasangan Anda.
          </p>

          <div className="space-y-4 mt-8">
            <button
              onClick={() => handleCreateNew()}
              disabled={loading}
              className="w-full flex items-center justify-between p-5 rounded-2xl border border-[#E5E2D9] hover:bg-[#FAF9F6] transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F1EFE9] text-[#5A5A40] rounded-full flex items-center justify-center group-hover:bg-[#E5E2D9] transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D3D33]">Buat Baru</h3>
                  <p className="text-xs text-[#8C8A7D] mt-0.5">Buat ruang baru.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#E5E2D9] group-hover:text-[#5A5A40] transition-colors" />
            </button>

            <button
              onClick={() => setMode('join')}
              disabled={loading}
              className="w-full flex items-center justify-between p-5 rounded-2xl border border-[#E5E2D9] hover:bg-[#FAF9F6] transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F1EFE9] text-[#D4A373] rounded-full flex items-center justify-center group-hover:bg-[#E5E2D9] transition-colors">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D3D33]">Gabung</h3>
                  <p className="text-xs text-[#8C8A7D] mt-0.5">Masukkan Kode dari pasangan.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#E5E2D9] group-hover:text-[#D4A373] transition-colors" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] border border-[#E5E2D9] shadow-sm p-8 space-y-6">
        <button onClick={() => setMode('select')} className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] border-b border-[#5A5A40] mb-2 inline-block hover:opacity-80 transition-opacity">
          &larr; Kembali
        </button>
        <h2 className="text-3xl font-serif text-[#3D3D33] italic">Masukkan Kode</h2>
        <p className="text-[#8C8A7D] text-sm">
          Minta Kode Ruang dari pasangan Anda dan tempel di bawah ini.
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Contoh: AB12CD"
              className="w-full border border-[#E5E2D9] rounded-2xl p-4 focus:outline-none focus:border-[#5A5A40] bg-[#FAF9F6] text-[#3D3D33] uppercase"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !roomId}
            className="w-full bg-[#5A5A40] text-white font-medium py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Menghubungkan...' : 'Gabung Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
