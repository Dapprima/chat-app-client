import React from 'react';

import './Sidebar.scss';

interface SidebarProps {
  rooms: string[];
  activeRoom: string;
  onRoomSelect: (roomName: string) => void;
  onCreateRoom: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ rooms, activeRoom, onRoomSelect, onCreateRoom }) => {
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
    </div>
  );
};

export default Sidebar;
