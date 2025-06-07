import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001'; // Match agent port
let socket = null;

export const initSocket = () => {
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => console.log('WebSocket connected'));
  socket.on('disconnect', () => console.log('WebSocket disconnected'));
  socket.on('connect_error', (err) => console.error('Connection error:', err));
  
  return socket;
};

export const getSocket = () => socket;