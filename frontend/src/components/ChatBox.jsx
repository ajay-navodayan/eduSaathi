import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const socket = io('http://localhost:5000');

export default function ChatBox({ peerId, peerName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket.emit('join_room', user.id);
    }
    
    // Fetch history
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${peerId}?userId=${user.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    if (user && peerId) {
      fetchHistory();
    }

    const receiveMessageHandler = (msgData) => {
      if ((msgData.sender_id === peerId && msgData.receiver_id === user.id) || 
          (msgData.sender_id === user.id && msgData.receiver_id === peerId)) {
        setMessages((prev) => [...prev, msgData]);
      }
    };

    socket.on('receive_message', receiveMessageHandler);

    return () => {
      socket.off('receive_message', receiveMessageHandler);
    };
  }, [user, peerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      sender_id: user.id,
      receiver_id: peerId,
      content: inputValue
    };

    try {
      // Save to DB
      const res = await API.post('/messages', newMsg);
      const savedMsg = res.data;
      
      // Emit via socket
      socket.emit('send_message', savedMsg);
      
      // Update local UI
      setMessages((prev) => [...prev, savedMsg]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>
        Chat with {peerName || 'User'}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((m, i) => {
          const isMine = m.sender_id === user.id;
          return (
            <div key={i} style={{ 
              alignSelf: isMine ? 'flex-end' : 'flex-start',
              backgroundColor: isMine ? '#dcf8c6' : '#fff',
              padding: '8px 12px',
              borderRadius: '16px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {m.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Type a message..." 
          style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '0 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}
