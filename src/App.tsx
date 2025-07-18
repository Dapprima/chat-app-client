import React from 'react';

import { useAuth } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return <>{isAuthenticated ? <ChatPage /> : <AuthPage />}</>;
};

export default App;
