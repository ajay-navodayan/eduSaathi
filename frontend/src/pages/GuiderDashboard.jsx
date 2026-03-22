import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';

export default function GuiderDashboard() {
  const { user } = useAuth();
  const [studentIdToChat, setStudentIdToChat] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);

  const startChat = (e) => {
    e.preventDefault();
    if (studentIdToChat) {
      setActiveChatId(parseInt(studentIdToChat, 10));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Guider Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        
        <div style={{ flex: 2, backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Messages</h2>
          <form onSubmit={startChat} style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              placeholder="Enter Student ID to chat with..." 
              value={studentIdToChat}
              onChange={(e) => setStudentIdToChat(e.target.value)}
              style={{ padding: '8px', flex: 1 }}
            />
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Start Chat
            </button>
          </form>
          
          {activeChatId ? (
            <ChatBox peerId={activeChatId} peerName={`Student #${activeChatId}`} />
          ) : (
            <p>Select a student to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
}
