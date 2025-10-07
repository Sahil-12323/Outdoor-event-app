import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const ChatMessage = ({ message, isOwn, currentUser }) => {
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`chat-message ${isOwn ? 'chat-message-own' : ''}`}>
      {!isOwn && (
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.user_name)}&background=10b981&color=fff&size=32`}
          alt={message.user_name}
          className="chat-avatar"
        />
      )}
      
      <div className="chat-message-content">
        {!isOwn && (
          <div className="chat-message-name">{message.user_name}</div>
        )}
        <div className="chat-message-text">{message.message}</div>
        <div className="chat-message-time">{formatTime(message.timestamp)}</div>
      </div>
      
      {isOwn && (
        <img
          src={currentUser?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=10b981&color=fff&size=32`}
          alt={currentUser?.name}
          className="chat-avatar"
        />
      )}
    </div>
  );
};

const ChatPanel = ({ event, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages every 3 seconds
    return () => clearInterval(interval);
  }, [event.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/events/${event.id}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || sending) return;

    setSending(true);
    
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/events/${event.id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: trimmedMessage })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="chat-overlay fade-in" data-testid="chat-panel">
      <div className="chat-header">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-500">Event Chat</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          data-testid="close-chat-btn"
        >
          ✕
        </button>
      </div>

      <div className="chat-messages" data-testid="chat-messages">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="loading-spinner w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.user_id === user?.id}
                currentUser={user}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={sendMessage} className="chat-input-form">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="chat-input"
            maxLength={1000}
            rows={1}
            disabled={sending}
            data-testid="chat-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="chat-send-btn"
            data-testid="send-message-btn"
          >
            {sending ? (
              <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '➤'
            )}
          </button>
        </form>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{newMessage.length}/1000</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;