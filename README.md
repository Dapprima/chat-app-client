# Real-Time Chat Application - Client

This repository contains the frontend application for a real-time chat system.

## Features

- **User Authentication:** Registration and login.
- **Chat Room Management:** Display, join, and create chat rooms.
- **Real-Time Messaging:** Instant message sending and receiving.
- **Online User Presence:** Displays users active in the current room.
- **Responsive Design:** Adapts to various screen sizes.
- **Modular Architecture:** Organized React components and hooks.

## Technologies

- **Framework:** React with TypeScript
- **Styling:** SCSS
- **Build Tool:** Vite
- **Real-time:** Socket.IO Client
- **State Management:** React Context API

## Assumptions

- **Backend URL:** Assumes backend is accessible at `http://localhost:5000`.
- **Session Storage:** JWT token stored in `localStorage` for session persistence.
- **Error Handling:** Console logging and in-component state for errors. No global toast system implemented.

## Setup and Installation

### Prerequisites

- Node.js (v18+)
- npm
- Git

### Steps

1.  **Navigate:** `cd fullstack-chatapp/client`
2.  **Install:** `npm install`
3.  **Run:** `npm run dev`
    - **Note:** Ensure the backend server is running first (refer to [Backend README](../server/README.md)).

## Usage

1.  Access `http://localhost:5173` in your browser.
2.  Register or log in.
3.  Join existing rooms or create new ones via the modal.
4.  Send and receive messages in real-time.
5.  Observe online users in the sidebar.
6.  Logout via the top navigation.
