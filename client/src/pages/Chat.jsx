import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlinePaperAirplane, HiOutlinePaperClip, HiOutlineChatAlt2 } from 'react-icons/hi';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket() || {};
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => {
        setConversations(data.conversations || []);
        if (conversationId) setActiveConvo(conversationId);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvo) return;
    chatAPI.getMessages(activeConvo)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(console.error);

    // Join socket room
    socket?.emit('joinConversation', activeConvo);
    socket?.emit('markRead', { conversationId: activeConvo });

    return () => {
      socket?.emit('leaveConversation', activeConvo);
    };
  }, [activeConvo, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (message) => {
      if (message.conversation === activeConvo || message.conversation?._id === activeConvo) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversation list
      setConversations(prev => prev.map(c => {
        if (c._id === (message.conversation?._id || message.conversation)) {
          return { ...c, lastMessage: { content: message.content, sender: message.sender, createdAt: message.createdAt } };
        }
        return c;
      }));
    });

    socket.on('userTyping', ({ userId, conversationId: cId }) => {
      if (cId === activeConvo) setTyping(userId);
    });

    socket.on('userStoppedTyping', ({ conversationId: cId }) => {
      if (cId === activeConvo) setTyping(null);
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [socket, activeConvo]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;

    socket?.emit('sendMessage', {
      conversationId: activeConvo,
      content: newMessage,
    });

    socket?.emit('stopTyping', { conversationId: activeConvo });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket?.emit('typing', { conversationId: activeConvo });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stopTyping', { conversationId: activeConvo });
    }, 2000);
  };

  const getOtherUser = (convo) => {
    return convo.participants?.find(p => p._id !== user?._id) || {};
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 lg:w-96 border-r border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex flex-col ${activeConvo ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <HiOutlineChatAlt2 className="w-5 h-5 text-primary-500" /> Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? conversations.map((convo) => {
            const other = getOtherUser(convo);
            const isActive = activeConvo === convo._id;
            const online = isUserOnline?.(other._id);
            return (
              <button
                key={convo._id}
                onClick={() => setActiveConvo(convo._id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-surface-100 dark:border-surface-800 transition-colors text-left
                  ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold overflow-hidden">
                    {other.avatar ? <img src={other.avatar} alt="" className="w-full h-full object-cover" /> : other.name?.[0] || '?'}
                  </div>
                  {online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-surface-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-white text-sm truncate">{other.name || 'Unknown'}</p>
                  <p className="text-xs text-surface-400 truncate">{convo.lastMessage?.content || 'Start chatting...'}</p>
                </div>
              </button>
            );
          }) : (
            <div className="p-8 text-center text-surface-400">
              <HiOutlineChatAlt2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Message someone from Matches!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeConvo ? 'hidden sm:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center gap-3">
              <button onClick={() => setActiveConvo(null)} className="sm:hidden btn-ghost p-1">←</button>
              {(() => {
                const convo = conversations.find(c => c._id === activeConvo);
                const other = convo ? getOtherUser(convo) : {};
                const online = isUserOnline?.(other._id);
                return (
                  <>
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold overflow-hidden">
                      {other.avatar ? <img src={other.avatar} alt="" className="w-full h-full object-cover" /> : other.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white text-sm">{other.name || 'Unknown'}</p>
                      <p className="text-xs text-surface-400">
                        {typing ? 'typing...' : online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50 dark:bg-surface-950">
              {messages.map((msg, idx) => {
                const isMine = (msg.sender?._id || msg.sender) === user?._id;
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-bl-md border border-surface-200 dark:border-surface-700'
                    }`}>
                      {msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block mb-1 underline text-xs opacity-80">
                          📎 {msg.fileName || 'Attachment'}
                        </a>
                      )}
                      {msg.content}
                      <span className={`block text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-surface-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center gap-3">
              <input
                type="text" value={newMessage} onChange={handleTyping}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button type="submit" disabled={!newMessage.trim()} className="btn-primary p-3 rounded-xl">
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-surface-400">
            <div className="text-center">
              <HiOutlineChatAlt2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your contacts or start a new chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
