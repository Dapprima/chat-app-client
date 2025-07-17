import React from 'react';

import './Navbar.scss';

interface NavbarProps {
  username: string | undefined;
  onLogout: () => void;
  chatRoomName: string;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout, chatRoomName }) => {
  return (
    <div className="chat-header">
      <h1>
        {chatRoomName} ({username})
      </h1>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
