import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../api';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [tutorForm, setTutorForm] = useState({ name: '', subject: '', location: '', contact: '', experience: '' });
  const [tutorMsg, setTutorMsg] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', field: '', designation: '', city: '', overrideLock: false });
  const [editMsg, setEditMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pendingRes = await API.get('/admin/pending-users');
      setPendingUsers(pendingRes.data);
      
      const allRes = await API.get('/admin/users');
      setAllUsers(allRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const approveUser = async (id) => {
    try {
      await API.put(`/admin/approve-user/${id}`);
      fetchData(); // Refresh both lists
      alert(`User approved!`);
    } catch (err) {
      alert('Failed to approve user');
      console.error(err);
    }
  };

  const handleTutorSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-tutor', tutorForm);
      setTutorMsg('Tutor added successfully!');
      setTutorForm({ name: '', subject: '', location: '', contact: '', experience: '' });
    } catch (err) {
      setTutorMsg('Error adding tutor.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/edit-user/${editingUserId}`, editForm);
      setEditMsg('User successfully updated!');
      fetchData();
      setEditingUserId(null); // Close editing form
    } catch (err) {
      setEditMsg('Error updating user.');
    }
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  const tabStyle = (tabId) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: activeTab === tabId ? '#1a73e8' : '#f0f0f0',
    color: activeTab === tabId ? '#fff' : '#333',
    border: 'none',
    fontWeight: 'bold',
    borderRadius: '4px 4px 0 0'
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin {user?.name}!</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '2px solid #1a73e8' }}>
        <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>Pending Approvals</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>Manage Users</button>
        <button style={tabStyle('tutor')} onClick={() => setActiveTab('tutor')}>Add Tutor</button>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderTop: 'none' }}>
        
        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div>
            <h2>Pending Approvals</h2>
            {loading ? <p>Loading...</p> : pendingUsers.length === 0 ? <p>No users waiting for approval.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Name</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Email</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Role</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.name}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.email}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <span style={{ padding: '4px 8px', backgroundColor: '#fce8e6', borderRadius: '12px', fontSize: '0.9em' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <button onClick={() => approveUser(u.id)} style={{ padding: '6px 12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MANAGE USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2>Manage All Users & Edit Profiles</h2>
            {editMsg && <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '10px' }}>{editMsg}</div>}
            
            {editingUserId ? (
              <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3>Force Edit User #{editingUserId}</h3>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ padding: '8px' }} required />
                  <input type="text" placeholder="Field (e.g. UPSC)" value={editForm.field} onChange={(e) => setEditForm({...editForm, field: e.target.value})} style={{ padding: '8px' }} />
                  <input type="text" placeholder="Designation" value={editForm.designation} onChange={(e) => setEditForm({...editForm, designation: e.target.value})} style={{ padding: '8px' }} />
                  <input type="text" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} style={{ padding: '8px' }} />
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input type="checkbox" checked={editForm.overrideLock} onChange={(e) => setEditForm({...editForm, overrideLock: e.target.checked})} />
                    Unlock profile to let user edit it again
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#ea4335', color: 'white', border: 'none', cursor: 'pointer' }}>Force Update</button>
                    <button type="button" onClick={() => setEditingUserId(null)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>ID</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Name</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Email</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Status</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Lock</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.id}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.name}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.email}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.status}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.profile_edited ? 'Locked' : 'Open'}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <button 
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditForm({ name: u.name, field: '', designation: '', city: '', overrideLock: false });
                            setEditMsg('');
                          }}
                          style={{ padding: '6px 12px', backgroundColor: '#fbbc05', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Edit Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ADD TUTOR TAB */}
        {activeTab === 'tutor' && (
          <div style={{ maxWidth: '600px' }}>
            <h2>Add Dummy Tutor Data</h2>
            <p>Fill in details to manually create a tutor listing.</p>
            {tutorMsg && <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '10px' }}>{tutorMsg}</div>}
            <form onSubmit={handleTutorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Tutor Name" value={tutorForm.name} onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Subject (e.g. Mathematics)" value={tutorForm.subject} onChange={(e) => setTutorForm({...tutorForm, subject: e.target.value})} style={{ padding: '8px' }} />
              <input type="text" placeholder="Location (e.g. Patna, Bihar)" value={tutorForm.location} onChange={(e) => setTutorForm({...tutorForm, location: e.target.value})} style={{ padding: '8px' }} />
              <input type="text" placeholder="Contact (+91-XXXXX)" value={tutorForm.contact} onChange={(e) => setTutorForm({...tutorForm, contact: e.target.value})} style={{ padding: '8px' }} />
              <input type="text" placeholder="Experience (e.g. 8 years)" value={tutorForm.experience} onChange={(e) => setTutorForm({...tutorForm, experience: e.target.value})} style={{ padding: '8px' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#1a73e8', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Create Tutor</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
