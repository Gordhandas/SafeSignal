import React, { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { User } from './types';
import { MOCK_FAMILY_MEMBERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = useCallback((name: string) => {
    const newUser: User = {
      id: 'user_current',
      name: name,
      status: 'online',
      lastLocation: null,
      isCurrentUser: true,
    };
    setCurrentUser(newUser);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen font-sans">
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard 
          currentUser={currentUser}
          familyMembers={[currentUser, ...MOCK_FAMILY_MEMBERS]}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
