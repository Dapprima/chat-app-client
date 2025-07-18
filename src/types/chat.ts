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

interface OnlineUser {
  id: string;
  username: string;
}

export type { Message, ChatRoom, OnlineUser };
