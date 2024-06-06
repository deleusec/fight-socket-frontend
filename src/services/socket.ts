import io from 'socket.io-client';

const socket = io('https://fight-socket-backend-1.onrender.com/', {
    withCredentials: true,
  });

export default socket;