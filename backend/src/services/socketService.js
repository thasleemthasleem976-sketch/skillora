import { Server } from 'socket.io';

let io = null;

// Store active live rooms and participants
// { [roomId]: { [socketId]: { user, socketId, audio: true, video: true } } }
const liveRooms = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // ---- WebRTC Live Classroom Signaling ----
    socket.on('join-live-class', ({ roomId, user }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.user = user;

      if (!liveRooms.has(roomId)) {
        liveRooms.set(roomId, new Map());
      }

      const roomParticipants = liveRooms.get(roomId);
      roomParticipants.set(socket.id, {
        user,
        socketId: socket.id,
        audio: true,
        video: true,
        joinedAt: new Date(),
      });

      // Send existing participants to the newcomer
      const participantList = Array.from(roomParticipants.values());
      socket.emit('existing-participants', participantList);

      // Notify others in the room
      socket.to(roomId).emit('participant-joined', {
        user,
        socketId: socket.id,
      });

      console.log(`[Socket.io] User ${user?.name || socket.id} joined live class ${roomId}`);
    });

    // WebRTC Offer
    socket.on('webrtc-offer', ({ targetSocketId, callerSocketId, sdp }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        callerSocketId,
        sdp,
        user: socket.user,
      });
    });

    // WebRTC Answer
    socket.on('webrtc-answer', ({ targetSocketId, answerSocketId, sdp }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answerSocketId,
        sdp,
      });
    });

    // WebRTC ICE Candidate
    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        callerSocketId: socket.id,
        candidate,
      });
    });

    // Live Class Chat Message
    socket.on('send-live-chat', ({ roomId, message, user }) => {
      io.to(roomId).emit('receive-live-chat', {
        id: Date.now() + '-' + Math.random(),
        text: message,
        user,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // Media toggle sync (mic/camera toggle)
    socket.on('toggle-media-status', ({ roomId, mediaType, enabled }) => {
      if (liveRooms.has(roomId)) {
        const participant = liveRooms.get(roomId).get(socket.id);
        if (participant) {
          participant[mediaType] = enabled;
        }
      }
      socket.to(roomId).emit('participant-media-changed', {
        socketId: socket.id,
        mediaType,
        enabled,
      });
    });

    // ---- Exam Proctoring Real-time Supervision ----
    socket.on('join-exam-proctoring', ({ examId }) => {
      const room = `exam-proctoring-${examId}`;
      socket.join(room);
      console.log(`[Proctoring] Proctor/Instructor joined stream supervision for exam ${examId}`);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const roomId = socket.roomId;
      if (roomId && liveRooms.has(roomId)) {
        const roomParticipants = liveRooms.get(roomId);
        roomParticipants.delete(socket.id);

        socket.to(roomId).emit('participant-left', {
          socketId: socket.id,
          user: socket.user,
        });

        if (roomParticipants.size === 0) {
          liveRooms.delete(roomId);
        }
      }
    });
  });

  return io;
};

export const getSocketIO = () => io;
