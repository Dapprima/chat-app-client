import { API_ROUTES } from '@/constants/api';

interface CreateRoomPayload {
  name: string;
  isGroupChat: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
}

export const createRoom = async (newRoomName: string, token: string): Promise<ChatRoom> => {
  const response = await fetch(API_ROUTES.CHATS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: newRoomName,
      isGroupChat: true,
    } satisfies CreateRoomPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create room');
  }

  return {
    id: data.id,
    name: data.name,
  };
};
