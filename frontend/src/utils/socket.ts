import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinTeam = (teamId: string) => {
  if (socket) {
    socket.emit('join_team', teamId);
  }
};

export const sendMessage = (data: {
  teamId: string;
  senderId: string;
  content: string;
  senderName: string;
}) => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const onReceiveMessage = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

export const onTeamUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('team_updated', callback);
  }
};

export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive_message');
  }
};

export const offTeamUpdate = () => {
  if (socket) {
    socket.off('team_updated');
  }
};