import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import API from '../api';
import './ChatApp.css';

export default function GuiderDashboard() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // stores { peer_id, name, role }
  const [newChatId, setNewChatId] = useState('');

  useEffect(() => {
    if (user?.id) {
      // Use user.id consistently for all messaging features
      API.get(`/messages/conversations/${user.id}`)
        .then(res => setContacts(res.data))
        .catch(err => console.error("Failed to load contacts", err));
    }
  }, [user]);

  const handleStartManualChat = (e) => {
    e.preventDefault();
    if (newChatId.trim()) {
      setActiveChat({ peer_id: parseInt(newChatId), name: `User ${newChatId}`, role: 'Unknown' });
      setNewChatId('');
    }
  };

  return (
    <div className="chat-layout">
      
      {/* LEFT PANE: CONTACTS */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span>Chats</span>
        </div>
        
        <div className="contact-list">
          {/* Manual New Chat Form hidden beautifully */}
          <form style={{ padding: '10px 15px', borderBottom: '1px solid #ddd' }} onSubmit={handleStartManualChat}>
             <input 
               type="number" 
               placeholder="Search or start new chat by ID..." 
               value={newChatId}
               onChange={(e) => setNewChatId(e.target.value)}
               style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#f0f2f5', outline: 'none' }}
             />
          </form>

          {contacts.length === 0 ? (
             <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No recent chats found.</p>
          ) : (
             contacts.map(c => {
               // Generate random appealing color for dummy avatar
               const avatarColors = ['#1a73e8', '#34a853', '#fbbc05', '#ea4335', '#ff6d00', '#9c27b0'];
               const color = avatarColors[c.peer_id % avatarColors.length];
               const isActive = activeChat?.peer_id === c.peer_id;

               return (
                 <div 
                   key={c.peer_id} 
                   className={`contact-item ${isActive ? 'active' : ''}`}
                   onClick={() => setActiveChat(c)}
                 >
                   <div className="contact-avatar" style={{ backgroundColor: color }}>
                     {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                   </div>
                   <div className="contact-info">
                     <div className="contact-name">{c.name || `User ${c.peer_id}`}</div>
                     <div className="contact-role" style={{ textTransform: 'capitalize' }}>{c.role || 'New User'}</div>
                   </div>
                 </div>
               )
             })
          )}
        </div>
      </div>

      {/* RIGHT PANE: CHATBOX */}
      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-header">
               <div className="contact-avatar" style={{ width: '40px', height: '40px', backgroundColor: '#9c27b0' }}>
                 {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : 'U'}
               </div>
               <div className="contact-info">
                 <div className="contact-name" style={{ marginBottom: '0' }}>{activeChat.name || `User ${activeChat.peer_id}`}</div>
               </div>
            </div>
            
            {/* The actual real-time chat window */}
            <ChatBox peerId={activeChat.peer_id} />
          </>
        ) : (
          <div className="empty-chat">
            <h2 style={{ fontWeight: '300', color: '#41525d', marginBottom: '10px' }}>EduSaathi Web Connect</h2>
            <p>Send and receive messages without keeping your phone online.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Select a chat from the left menu to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
