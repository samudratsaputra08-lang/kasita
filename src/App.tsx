import React, { useEffect, useState } from 'react';
import { initAuth, auth } from './lib/firebase';
import { getUserRoomId, setUserRoomId } from './lib/db';
import AuthScreen from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import DashboardScreen from './components/DashboardScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const unsub = initAuth(
      async (user) => {
        setNeedsAuth(false);
        const storedId = await getUserRoomId(user.uid);
        if (storedId) {
          setRoomId(storedId);
        } else {
          const localStoredId = localStorage.getItem('kasitaRoomId');
          if (localStoredId) {
            setRoomId(localStoredId);
          }
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
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
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
      onReset={async () => {
        localStorage.removeItem('kasitaRoomId');
        if (auth.currentUser) {
          try {
            await setUserRoomId(auth.currentUser.uid, '');
          } catch (e) {
            console.error(e);
          }
        }
        setRoomId('');
      }}
    />
  );
}
