import React, { useState, type FormEvent } from 'react';

import './CreateRoomModal.scss';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomName: string) => void;
  isLoading: boolean;
  error: string | null;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
  error,
}) => {
  const [roomName, setRoomName] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (roomName.trim()) {
      onCreate(roomName.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Chat Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name:</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="create-button">
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
