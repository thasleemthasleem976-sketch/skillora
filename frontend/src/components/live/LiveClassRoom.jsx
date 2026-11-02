import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  Users,
  Send,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LiveClassRoom({ liveClass, onLeave }) {
  const { user } = useAuth();
  const socket = getSocket();

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      user: { name: 'Skillora Live Bot', role: 'system' },
      text: `Welcome to ${liveClass.title}! Class attendance is being recorded automatically.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [participants, setParticipants] = useState([
    {
      socketId: 'local',
      user: user,
      audio: true,
      video: true,
      joinedAt: new Date(),
    },
  ]);

  // Record Attendance & Socket initialization
  useEffect(() => {
    // 1. Record join attendance on backend
    api.post(`/live-classes/${liveClass._id}/attendance`, { action: 'join' }).catch(() => {});

    // 2. Start local media stream
    const initLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Could not initialize local camera/mic stream:', err.message);
      }
    };

    initLocalMedia();

    // 3. Join Socket room
    socket.emit('join-live-class', {
      roomId: liveClass.roomId,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });

    // Handle incoming chat
    socket.on('receive-live-chat', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Handle participant joined
    socket.on('participant-joined', ({ user: joinedUser, socketId }) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === socketId)) return prev;
        return [
          ...prev,
          { socketId, user: joinedUser, audio: true, video: true, joinedAt: new Date() },
        ];
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: { name: 'System' },
          text: `${joinedUser.name} (${joinedUser.role}) joined the class.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    });

    // Handle participant left
    socket.on('participant-left', ({ socketId, user: leftUser }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      if (leftUser) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: { name: 'System' },
            text: `${leftUser.name} left the class.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    });

    return () => {
      // Record leave attendance on backend
      api.post(`/live-classes/${liveClass._id}/attendance`, { action: 'leave' }).catch(() => {});

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      socket.off('receive-live-chat');
      socket.off('participant-joined');
      socket.off('participant-left');
    };
  }, [liveClass._id, liveClass.roomId]);

  // Toggle Audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        socket.emit('toggle-media-status', {
          roomId: liveClass.roomId,
          mediaType: 'audio',
          enabled: audioTrack.enabled,
        });
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        socket.emit('toggle-media-status', {
          roomId: liveClass.roomId,
          mediaType: 'video',
          enabled: videoTrack.enabled,
        });
      }
    }
  };

  // Screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch (err) {
        console.warn('Screen share canceled or failed:', err);
      }
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    socket.emit('send-live-chat', {
      roomId: liveClass.roomId,
      message: inputMessage.trim(),
      user: {
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });

    setInputMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none">
      {/* Top Session Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">{liveClass.title}</h2>
            <span className="text-[11px] text-slate-400">
              Instructor: {liveClass.instructor?.name || 'Prof. Vance'} • Room: {liveClass.roomId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Attendance Recorded</span>
          </div>
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            Leave Class
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Live Stage / Video Grid */}
        <div className="flex-1 p-4 bg-slate-950 flex flex-col justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center p-2">
            {/* Primary / Teacher Video Container */}
            <div className="relative w-full h-full min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isScreenSharing ? 'transform -scale-x-100' : ''}`}
              />

              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Camera is turned off</span>
                </div>
              )}

              {/* Tag banner */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2">
                <span>{user.name} (You)</span>
                {isAudioEnabled ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            </div>

            {/* Remote Peer Stream simulation / Teacher view */}
            <div className="relative w-full h-full min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                alt="Instructor"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2">
                <span>{liveClass.instructor?.name || 'Prof. David Vance'} (Teacher)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
            </div>
          </div>

          {/* Bottom Call Controls */}
          <div className="h-16 flex items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-2 mt-2">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-xl transition-all ${
                isAudioEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              }`}
              title={isAudioEnabled ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-xl transition-all ${
                isVideoEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              }`}
              title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-xl transition-all ${
                isScreenSharing
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
              title="Share Screen"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar: Chat & Participants */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-white text-white bg-gray-800/60'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'participants'
                  ? 'border-white text-white bg-gray-800/60'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Roster ({participants.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className="text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="font-bold text-gray-200">{msg.user?.name || 'Guest'}</span>
                      <span className="text-[10px]">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-300 mt-0.5 bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60 break-words">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="p-2 bg-white hover:bg-gray-200 text-black rounded-xl transition-all font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Class Attendance Roster
              </p>
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={p.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user?.name}`}
                      alt={p.user?.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{p.user?.name}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                        {p.user?.role || 'student'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Present</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
