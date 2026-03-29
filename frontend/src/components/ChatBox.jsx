import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import API from '../api';

const socket = io('http://localhost:5000');

export default function ChatBox({ peerId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const myMessagingId = user?.id_auth || user?.id; // Use UUID if available, fallback to legacy ID

  useEffect(() => {
    if (!myMessagingId || !peerId) return;

    // Join room for this specific user - important to use UUID string
    socket.emit('join_room', String(myMessagingId));
    
    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${peerId}?userId=${myMessagingId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();

    const handleReceiveMessage = (msgData) => {
      const incomingSender = String(msgData.sender_id);
      const incomingReceiver = String(msgData.receiver_id);
      const currentPeer = String(peerId);
      const currentMe = String(myMessagingId);

      // Filter to only show messages for the current open chat
      if ((incomingSender === currentPeer && incomingReceiver === currentMe) || 
          (incomingSender === currentMe && incomingReceiver === currentPeer)) {
        setMessages((prev) => [...prev, msgData]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [myMessagingId, peerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !myMessagingId) return;

    const newMsg = {
      sender_id: myMessagingId,
      receiver_id: peerId, // No more Number() cast
      content: inputValue,
      created_at: new Date().toISOString()
    };

    try {
      const res = await API.post('/messages', newMsg);
      const savedMsg = res.data;
      
      // Emit via socket - ensure it goes to the correct room string
      socket.emit('send_message', savedMsg);
      
      setMessages((prev) => [...prev, savedMsg]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!myMessagingId) return <div>Please log in to chat.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
      
      {/* MESSAGE SCROLL WINDOW */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, idx) => {
          const isMine = String(m.sender_id) === String(myMessagingId);
          
          return (
            <div key={idx} style={{ 
              alignSelf: isMine ? 'flex-end' : 'flex-start',
              backgroundColor: isMine ? 'var(--blue-50)' : 'var(--bg-card)',
              padding: '8px 12px',
              borderRadius: '8px',
              borderTopRightRadius: isMine ? '0' : '8px',
              borderTopLeftRadius: isMine ? '8px' : '0',
              boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
              marginBottom: '8px',
              maxWidth: '65%',
              position: 'relative'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '19px', wordWrap: 'break-word' }}>
                {m.content}
              </p>
              <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.45)', float: 'right', margin: '-10px 0 -5px 10px', alignSelf: 'flex-end', paddingTop: '10px' }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT BAR */}
      <div style={{ backgroundColor: 'var(--gray-100)', borderTop: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Type a message" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '12px 20px', 
              borderRadius: '24px', 
              outline: 'none', 
              marginRight: '15px', 
              fontSize: '0.95rem',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#1a73e8', 
              color: 'white', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            ➤
          </button>
        </form>
      </div>
      
    </div>
  );
}
