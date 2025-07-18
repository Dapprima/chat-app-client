import React, { useState, type FormEvent } from 'react';

import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/api/auth';

import './Login.scss';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const userData = await loginUser({ email, password });

      login(userData);
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p className="auth-message error">{message}</p>}
      <p className="auth-switch">
        Don't have an account? <span onClick={onSwitchToRegister}>Register here</span>
      </p>
    </div>
  );
};

export default Login;
