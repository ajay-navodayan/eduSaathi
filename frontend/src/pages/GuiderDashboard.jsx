import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import API from '../api';
import './ChatApp.css';

export default function GuiderDashboard() {
  const { user } = useAuth();
  const myMessagingId = user?.id_auth || user?.id;

  useEffect(() => {
    if (myMessagingId) {
      // Use the UUID/id_auth consistently for all messaging features
      API.get(`/messages/conversations/${myMessagingId}`)
        .then(res => setContacts(res.data))
        .catch(err => console.error("Failed to load contacts", err));
    }
  }, [myMessagingId]);

  const handleStartManualChat = (e) => {
    e.preventDefault();
    if (newChatId.trim()) {
      setActiveChat({ peer_id: newChatId, name: `User ${newChatId.substring(0, 8)}`, role: 'Unknown' });
      setNewChatId('');
    }
  };

  return (
    <div className="chat-layout">
      
      {/* LEFT PANE: CONTACTS */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span>{t('chat.title')}</span>
        </div>
        
        <div className="contact-list">
          {/* Manual New Chat Form */}
          <form style={{ padding: '10px 15px', borderBottom: '1px solid #ddd' }} onSubmit={handleStartManualChat}>
             <input 
               type="text" 
               placeholder={t('chat.search')} 
               value={newChatId}
               onChange={(e) => setNewChatId(e.target.value)}
               style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#f0f2f5', outline: 'none' }}
             />
          </form>

          {contacts.length === 0 ? (
             <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t('chat.no_chats')}</p>
          ) : (
             contacts.map(c => {
               // Generate random appealing color for dummy avatar based on string ID
               const avatarColors = ['#1a73e8', '#34a853', '#fbbc05', '#ea4335', '#ff6d00', '#9c27b0'];
               const idHash = String(c.peer_id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
               const color = avatarColors[idHash % avatarColors.length];
               const isActive = String(activeChat?.peer_id) === String(c.peer_id);

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
                     <div className="contact-name">{c.name || `User ${String(c.peer_id).substring(0, 8)}`}</div>
                     <div className="contact-role" style={{ textTransform: 'capitalize' }}>{c.role || t('chat.new_user')}</div>
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
            <h2 style={{ fontWeight: '300', color: '#41525d', marginBottom: '10px' }}>{t('chat.web_connect')}</h2>
            <p>{t('chat.subtitle')}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>{t('chat.select_chat')}</p>
          </div>
        )}
      </div>

    </div>
  );
}
