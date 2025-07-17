import React, { useState } from 'react';

import Login from '@/components/Login';
import Register from '@/components/Register';

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  const handleAuthSuccess = () => {
    console.log('Authentication successful. Context handles state.');
  };

  return (
    <>
      {showRegister ? (
        <Register onSuccess={handleAuthSuccess} onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onSuccess={handleAuthSuccess} onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </>
  );
};

export default AuthPage;
