import React, { useEffect, useState } from 'react';
import { initAuth } from './lib/firebase';
import AuthScreen from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import DashboardScreen from './components/DashboardScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const unsub = initAuth(
      (user) => {
        setNeedsAuth(false);
        const storedId = localStorage.getItem('kasitaRoomId');
        if (storedId) {
          setRoomId(storedId);
        }
        setLoading(false);
      },
      () => {
        setNeedsAuth(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E5E2D9] border-t-[#5A5A40] rounded-full animate-spin" />
      </div>
    );
  }

  if (needsAuth) {
    return <AuthScreen onLogin={() => setNeedsAuth(false)} />;
  }

  if (!roomId) {
    return (
      <SetupScreen 
        onComplete={(id) => setRoomId(id)} 
      />
    );
  }

  return (
    <DashboardScreen 
      roomId={roomId} 
      onReset={() => {
        localStorage.removeItem('kasitaRoomId');
        setRoomId('');
      }}
    />
  );
}
