import { io } from 'socket.io-client';

// Auto-detect the correct socket URL based on environment
const getSocketUrl = () => {
  // If we have a specific API URL set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (deployed), use the same domain as the frontend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // In development, use localhost
  return 'http://localhost:3001';
};

const URL = getSocketUrl();

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});
