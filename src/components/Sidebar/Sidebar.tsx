import React from 'react';
import './Sidebar.scss';

interface OnlineUser {
  id: string;
  username: string;
}

interface SidebarProps {
  rooms: string[];
  activeRoom: string;
  onRoomSelect: (roomName: string) => void;
  onCreateRoom: () => void;
  onlineUsers: OnlineUser[];
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  activeRoom,
  onRoomSelect,
  onCreateRoom,
  onlineUsers,
}) => {
  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h3>Rooms</h3>
      </div>
      <ul className="room-list">
        {rooms.map((room) => (
          <li
            key={room}
            className={`room-item ${room === activeRoom ? 'active' : ''}`}
            onClick={() => onRoomSelect(room)}
          >
            # {room}
          </li>
        ))}
      </ul>
      <button className="create-room-button" onClick={onCreateRoom}>
        + Create New Room
      </button>

      <div className="online-users-section">
        <div className="online-users-header">
          <h3>Online Users ({onlineUsers.length})</h3>
        </div>
        <ul className="online-user-list">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <li key={user.id} className="online-user-item">
                <span className="online-indicator"></span> {user.username}
              </li>
            ))
          ) : (
            <li className="no-users">No users online in this room.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
