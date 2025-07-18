import React, { useState, useEffect, useRef, type FormEvent } from 'react';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import Navbar from '@/components/Navbar/Navbar';
import CreateRoomModal from '@/components/CreateRoomModal/CreateRoomModal';
import { createRoom } from '@/api/chat';
import useChatSocket from '@/hooks/useChatSocket';

import './ChatPage.scss';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [input, setInput] = useState<string>('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState<boolean>(false);
  const [creatingRoom, setCreatingRoom] = useState<boolean>(false);
  const [createRoomError, setCreateRoomError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    socket,
    messages,
    currentChatRoom,
    availableRooms,
    onlineUsers,
    joinChatRoom,
    sendMessage: sendSocketMessage,
    requestRoomsList,
    setAvailableRooms,
  } = useChatSocket({
    userId: user?._id,
    username: user?.username,
    token: user?.token,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 0);
    }
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (input.trim() && currentChatRoom) {
      sendSocketMessage(input.trim(), currentChatRoom.id);
      setInput('');
    }
  };

  const handleRoomSelect = (roomName: string) => {
    const selectedRoom = availableRooms.find((room) => room.name === roomName);

    if (selectedRoom) {
      joinChatRoom(selectedRoom.id);
    }
  };

  const handleCreateRoom = async (newRoomName: string) => {
    setCreatingRoom(true);
    setCreateRoomError(null);

    try {
      if (!user?.token) throw new Error('User not authenticated');

      const newRoom = await createRoom(newRoomName, user.token);

      setAvailableRooms((prevRooms) => [...prevRooms, newRoom]);
      joinChatRoom(newRoom.id);
      setIsCreateRoomModalOpen(false);
      requestRoomsList();
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
        onlineUsers={onlineUsers}
      />

      <div className="chat-main">
        <Navbar
          username={user?.username}
          onLogout={logout}
          chatRoomName={
            currentChatRoom?.name || (socket?.connected ? 'Connecting to chat...' : 'Not Connected')
          }
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
            disabled={!currentChatRoom || !socket?.connected}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!currentChatRoom || !socket?.connected}
          >
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
