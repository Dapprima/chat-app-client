import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/constants/api';

import { type Message, type ChatRoom, type OnlineUser } from '@/types/chat';

interface UseChatSocketProps {
  userId: string | undefined;
  username: string | undefined;
  token: string | undefined;
}

interface UseChatSocketReturn {
  socket: Socket | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentChatRoom: ChatRoom | null;
  setCurrentChatRoom: React.Dispatch<React.SetStateAction<ChatRoom | null>>;
  availableRooms: ChatRoom[];
  setAvailableRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
  onlineUsers: OnlineUser[];
  joinChatRoom: (roomId: string) => void;
  leaveChatRoom: (roomId: string) => void;
  requestRoomsList: () => void;
  sendMessage: (content: string, chatId: string) => void;
}

const useChatSocket = ({ userId, username, token }: UseChatSocketProps): UseChatSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<ChatRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const initialJoinAttempted = useRef(false);

  useEffect(() => {
    if (!userId || !username || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      setCurrentChatRoom(null);
      setMessages([]);
      setAvailableRooms([]);
      setOnlineUsers([]);

      initialJoinAttempted.current = false;
      return;
    }

    if (socket && socket.connected) {
      return;
    }

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    initialJoinAttempted.current = false;

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
      newSocket.emit('getRooms');
    });

    newSocket.on('roomsList', (rooms: ChatRoom[]) => {
      console.log('Received rooms list:', rooms);
      setAvailableRooms(rooms);

      if (!initialJoinAttempted.current && rooms.length > 0) {
        let roomToJoin: ChatRoom | null = null;

        if (currentChatRoom) {
          roomToJoin = rooms.find((room) => room.id === currentChatRoom.id) || null;
        }

        if (!roomToJoin) {
          roomToJoin = rooms.find((room) => room.name === 'General') || rooms[0];
        }

        if (roomToJoin) {
          setCurrentChatRoom(roomToJoin);

          newSocket.emit('joinChat', {
            chatId: roomToJoin.id,
            userId: userId,
            username: username,
          });

          initialJoinAttempted.current = true;
        } else {
          setCurrentChatRoom(null);
        }
      } else if (currentChatRoom && !initialJoinAttempted.current) {
        const roomExists = rooms.some((room) => room.id === currentChatRoom.id);

        if (roomExists) {
          newSocket.emit('joinChat', {
            chatId: currentChatRoom.id,
            userId: userId,
            username: username,
          });
          initialJoinAttempted.current = true;
        } else if (rooms.length > 0) {
          const generalRoom = rooms.find((room) => room.name === 'General') || rooms[0];
          setCurrentChatRoom(generalRoom);
          newSocket.emit('joinChat', {
            chatId: generalRoom.id,
            userId: userId,
            username: username,
          });
          initialJoinAttempted.current = true;
        }
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

    newSocket.on('onlineUsersInRoom', (users: OnlineUser[]) => {
      console.log('Online users in room:', users);
      setOnlineUsers(users);
    });

    newSocket.on('userJoinedRoom', (userJoined: OnlineUser) => {
      console.log('User joined room:', userJoined.username);
      setOnlineUsers((prevUsers) => {
        if (!prevUsers.some((u) => u.id === userJoined.id)) {
          return [...prevUsers, userJoined];
        }

        return prevUsers;
      });
    });

    newSocket.on('userLeftRoom', (userLeft: OnlineUser) => {
      console.log('User left room:', userLeft.username);
      setOnlineUsers((prevUsers) => prevUsers.filter((u) => u.id !== userLeft.id));
    });

    newSocket.on('error', (errorMessage: string) => {
      console.error('Socket error:', errorMessage);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
      setCurrentChatRoom(null);
      setMessages([]);
      setAvailableRooms([]);
      setOnlineUsers([]);
      initialJoinAttempted.current = false;
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, username, token]);

  useEffect(() => {
    if (socket && userId && username && currentChatRoom && socket.connected) {
      socket.emit('joinChat', {
        chatId: currentChatRoom.id,
        userId: userId,
        username: username,
      });

      setMessages([]);
      setOnlineUsers([]);
    }
  }, [currentChatRoom, socket, userId, username]);

  const joinChatRoom = (roomId: string) => {
    const selectedRoom = availableRooms.find((room) => room.id === roomId);

    if (selectedRoom) {
      if (currentChatRoom?.id !== selectedRoom.id) {
        if (currentChatRoom && socket) {
          socket.emit('leaveChat', currentChatRoom.id);
        }

        setCurrentChatRoom(selectedRoom);
      }
    }
  };

  const leaveChatRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leaveChat', roomId);
    }
  };

  const requestRoomsList = () => {
    if (socket) {
      socket.emit('getRooms');
    }
  };

  const sendMessage = (content: string, chatId: string) => {
    if (socket && content.trim() && userId && chatId) {
      const messageData = {
        senderId: userId,
        content: content.trim(),
        chatId: chatId,
      };
      socket.emit('sendMessage', messageData);
    }
  };

  return {
    socket,
    messages,
    setMessages,
    currentChatRoom,
    setCurrentChatRoom,
    availableRooms,
    setAvailableRooms,
    onlineUsers,
    joinChatRoom,
    leaveChatRoom,
    requestRoomsList,
    sendMessage,
  };
};

export default useChatSocket;
