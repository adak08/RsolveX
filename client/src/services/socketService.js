import { io } from 'socket.io-client';
import { BASE_URL } from '../api/axios';

let socket = null;

export const socketService = {
  init(token) {
    if (socket) return socket;
    socket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    return socket;
  },

  getSocket() { return socket; },

  join(userId) {
    if (socket) socket.emit('join', userId);
  },

  joinWorkspace(workspaceId) {
    if (socket) socket.emit('join_workspace', workspaceId);
  },

  on(event, cb) {
    if (socket) socket.on(event, cb);
  },

  off(event, cb) {
    if (socket) socket.off(event, cb);
  },

  emit(event, data) {
    if (socket) socket.emit(event, data);
  },

  disconnect() {
    if (socket) { socket.disconnect(); socket = null; }
  },
};

export default socketService;
