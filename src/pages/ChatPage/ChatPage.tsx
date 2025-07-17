import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import io, { Socket } from 'socket.io-client';

import { useAuth } from '@/context/AuthContext';

import './ChatPage.scss';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  chat: string;
  createdAt: string;
}

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
      newSocket.emit('joinChat', 'general');
    });

    newSocket.on('chatJoined', (actualChatId: string) => {
      console.log('Successfully joined chat with ID:', actualChatId);
      setCurrentChatId(actualChatId);
    });

    newSocket.on('previousMessages', (prevMessages: Message[]) => {
      console.log('Received previous messages:', prevMessages);
      setMessages(prevMessages);
    });

    newSocket.on('receiveMessage', (message: Message) => {
      console.log('Received new message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('error', (errorMessage: string) => {
      console.error('Socket error:', errorMessage);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
    });

    return () => {
      newSocket.disconnect();
      setCurrentChatId('');
      setMessages([]);
    };
  }, [user]);

  useEffect(() => {
    if (socket && user && currentChatId) {
      socket.emit('joinChat', currentChatId);
    }
  }, [socket, user, currentChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket && input.trim() && user && currentChatId) {
      const messageData = {
        senderId: user._id,
        content: input.trim(),
        chatId: currentChatId,
      };
      socket.emit('sendMessage', messageData);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">
        Real-time Chat ({user?.username})
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </h1>
      <div className="message-list">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-item ${msg.sender._id === user?._id ? 'my-message' : 'other-message'}`}
          >
            <strong className="message-sender">{msg.sender.username}:</strong>{' '}
            <span className="message-content">{msg.content}</span>
            <div className="message-timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
