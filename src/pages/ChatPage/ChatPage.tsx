import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import io, { Socket } from 'socket.io-client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import Navbar from '@/components/Navbar/Navbar';
import CreateRoomModal from '@/components/CreateRoomModal';

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

interface ChatRoom {
  id: string;
  name: string;
}

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<ChatRoom[]>([]);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState<boolean>(false);
  const [creatingRoom, setCreatingRoom] = useState<boolean>(false);
  const [createRoomError, setCreateRoomError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
      newSocket.emit('getRooms');
    });

    newSocket.on('roomsList', (rooms: ChatRoom[]) => {
      console.log('Received rooms list:', rooms);
      setAvailableRooms(rooms);
      if (!currentChatRoom && rooms.length > 0) {
        const generalRoom = rooms.find((room) => room.name === 'General');
        if (generalRoom) {
          setCurrentChatRoom(generalRoom);
          newSocket.emit('joinChat', generalRoom.id);
        } else {
          setCurrentChatRoom(rooms[0]);
          newSocket.emit('joinChat', rooms[0].id);
        }
      } else if (currentChatRoom) {
        newSocket.emit('joinChat', currentChatRoom.id);
      }
    });

    newSocket.on('chatJoined', (actualChatId: string) => {
      console.log('Successfully joined chat with ID:', actualChatId);
      const joinedRoom = availableRooms.find((room) => room.id === actualChatId);
      if (joinedRoom && currentChatRoom?.id !== joinedRoom.id) {
        setCurrentChatRoom(joinedRoom);
      }
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
      setCurrentChatRoom(null);
      setMessages([]);
      setAvailableRooms([]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket && user && currentChatRoom) {
      socket.emit('joinChat', currentChatRoom.id);
    }
  }, [currentChatRoom, socket, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket && input.trim() && user && currentChatRoom) {
      const messageData = {
        senderId: user._id,
        content: input.trim(),
        chatId: currentChatRoom.id,
      };
      socket.emit('sendMessage', messageData);
      setInput('');
    }
  };

  const handleRoomSelect = (roomName: string) => {
    const selectedRoom = availableRooms.find((room) => room.name === roomName);
    if (selectedRoom) {
      if (currentChatRoom && socket) {
        socket.emit('leaveChat', currentChatRoom.id);
      }
      setCurrentChatRoom(selectedRoom);
      setMessages([]);
    }
  };

  const handleCreateRoom = async (newRoomName: string) => {
    setCreatingRoom(true);
    setCreateRoomError(null);
    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name: newRoomName, isGroupChat: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      const newRoom: ChatRoom = { id: data.id, name: data.name };
      setAvailableRooms((prevRooms) => [...prevRooms, newRoom]);
      handleRoomSelect(newRoom.name);
      setIsCreateRoomModalOpen(false);
    } catch (error: any) {
      console.error('Error creating room:', error);
      setCreateRoomError(error.message || 'An unexpected error occurred.');
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <div className="chat-container">
      <Sidebar
        rooms={availableRooms.map((room) => room.name)}
        activeRoom={currentChatRoom?.name || ''}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={() => setIsCreateRoomModalOpen(true)}
      />

      <div className="chat-main">
        <Navbar
          username={user?.username}
          onLogout={logout}
          chatRoomName={currentChatRoom?.name || 'Loading Chat...'}
        />
        <div className="message-list">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-item ${msg.sender._id === user?._id ? 'my-message' : 'other-message'}`}
            >
              <strong className="message-sender">{msg.sender.username}:</strong>{' '}
              <span className="message-content">{msg.content}</span>
              <div className="message-timestamp">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
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

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => {
          setIsCreateRoomModalOpen(false);
          setCreateRoomError(null);
        }}
        onCreate={handleCreateRoom}
        isLoading={creatingRoom}
        error={createRoomError}
      />
    </div>
  );
};

export default ChatPage;
