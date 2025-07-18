import React, { useState, type FormEvent } from 'react';

import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/api/auth';

import './Register.scss';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const newUser = await registerUser({ username, email, password });

      login(newUser);
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage(error.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      {message && <p className="auth-message error">{message}</p>}
      <p className="auth-switch">
        Already have an account? <span onClick={onSwitchToLogin}>Login here</span>
      </p>
    </div>
  );
};

export default Register;
