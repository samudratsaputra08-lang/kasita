import React, { useState } from 'react';
import { googleSignIn } from '../lib/firebase';
import { Wallet, Sparkles } from 'lucide-react';

export default function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await googleSignIn();
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login dibatalkan.');
      } else {
        setError('Gagal masuk. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] border border-pink-200 shadow-sm p-8 text-center space-y-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-pink-600 text-white rounded-full flex items-center justify-center mb-6">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif font-bold italic tracking-tight text-pink-950 mb-2">Kasita</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8C8A7D] flex items-center justify-center gap-1 text-pink-600">
            Tabungan Bersama <Sparkles className="w-3 h-3" />
          </p>
          <p className="text-pink-600 mt-4 text-sm leading-relaxed">
            Pantau pengeluaran dan tabungan bersama pasangan secara transparan.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm z-10 relative">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="relative z-10 w-full flex items-center justify-center gap-3 bg-white border border-pink-200 text-pink-950 font-medium py-4 px-4 rounded-2xl hover:bg-pink-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Masuk dengan Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
