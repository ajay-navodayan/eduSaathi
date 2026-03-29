import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import PhotoUpload from '../components/PhotoUpload';

const RESOURCE_CATEGORIES = ['NCERT', 'JEE', 'NEET', 'UPSC', 'SSC', 'Railway', 'Navodaya', 'Netarhat', 'Sainik School', 'Army'];
const CLASS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const [tutorForm, setTutorForm] = useState({ 
    name: '', photo: '', field: '', designation: '', city: '', 
    tenth_marks: '', tenth_board: '', twelfth_marks: '', twelfth_board: '', 
    achievements: '', linkedin: '', whatsapp: '', phone: '', email: '' 
  });
  const [tutorMsg, setTutorMsg] = useState('');

  const [aiCategories, setAiCategories] = useState([]);
  const [syncingCat, setSyncingCat] = useState(null);
  const [recentAiNotifs, setRecentAiNotifs] = useState([]);

  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ title: '', category: 'NCERT', drive_link: '', description: '', class_level: '', medium: 'hindi' });
  const [resourceMsg, setResourceMsg] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const [manualNotifs, setManualNotifs] = useState([]);
  const [manualNotifForm, setManualNotifForm] = useState({ title: '', description: '', link: '' });
  const [manualNotifMsg, setManualNotifMsg] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState('');
  
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const pendingRes = await API.get('/admin/pending-users');
      setPendingUsers(pendingRes.data);

      const allRes = await API.get('/admin/users');
      const detailedUsers = await Promise.all(allRes.data.map(async (u) => {
        try {
          const profileRes = await API.get(`/profile/me/${u.id}`);
          return { ...u, ...profileRes.data };
        } catch {
          return u;
        }
      }));
      setAllUsers(detailedUsers);
      
      const aiCatRes = await API.get('/notifications/ai/categories').catch(() => ({ data: [] }));
      setAiCategories(aiCatRes.data);

      const aiNotifRes = await API.get('/notifications/ai').catch(() => ({ data: [] }));
      setRecentAiNotifs(aiNotifRes.data);

      const manualRes = await API.get('/notifications').catch(() => ({ data: [] }));
      setManualNotifs(manualRes.data);

      const resourceRes = await API.get('/resources').catch(() => ({ data: [] }));
      setResources(resourceRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleApprove = async (userId) => {
    try {
      await API.put(`/admin/approve/${userId}`);
      setSelectedPendingUser(null);
      fetchData();
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleReject = async (userId) => {
    if(!rejectReason) return alert("Please provide a rejection reason.");
    try {
      await API.delete(`/admin/reject/${userId}`, { data: { reason: rejectReason } });
      setSelectedPendingUser(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert('Error rejecting user');
    }
  };

  const handleTutorSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-tutor', tutorForm);
      setTutorMsg('Tutor guest account created successfully!');
      setTutorForm({ name: '', photo: '', field: '', designation: '', city: '', tenth_marks: '', tenth_board: '', twelfth_marks: '', twelfth_board: '', achievements: '', linkedin: '', whatsapp: '', phone: '', email: '' });
    } catch (err) {
      setTutorMsg(err.response?.data?.error || 'Failed to create tutor.');
    }
  };

  const handleToggleLock = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await API.put(`/admin/lock-profile/${userId}`, { profile_edited: newStatus });
      fetchData();
    } catch (err) {
      alert('Error updating lock status');
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

  const handleAiSync = async (category) => {
    setSyncingCat(category);
    try {
      await API.post('/notifications/ai/refresh', { category });
      alert(`Successfully synced ${category}`);
      fetchData();
    } catch (err) {
      alert(`Failed to sync ${category}`);
    } finally {
      setSyncingCat(null);
    }
  };

  const deleteAiNotif = async (id) => {
    if(!window.confirm('Delete this AI notification permanently?')) return;
    try {
      await API.delete(`/notifications/ai/${id}`);
      fetchData();
    } catch {
      alert('Error deleting AI notification');
    }
  };

  const handleManualNotifSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/notifications', manualNotifForm);
      setManualNotifMsg('Broadcast successful!');
      setManualNotifForm({ title: '', description: '', link: '' });
      fetchData();
    } catch {
      setManualNotifMsg('Failed to broadcast.');
    }
  };

  const deleteManualNotif = async (id) => {
    if(!window.confirm(t('admin.broadcast.delete_confirm'))) return;
    try {
      await API.delete(`/notifications/${id}`);
      fetchData();
    } catch {
      alert('Error deleting notification');
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setResourceMsg('');
    try {
      if (bulkMode) {
        // Parse bulkText: "Title, Link" per line
        const lines = bulkText.split('\n').filter(line => line.trim().includes(','));
        const batch = lines.map(line => {
          const [title, link] = line.split(',').map(s => s.trim());
          return {
            ...resourceForm,
            title,
            drive_link: link
          };
        });

        if (batch.length === 0) return setResourceMsg('No valid lines found. Use format: Title, Link');
        
        await API.post('/resources/bulk', { resources: batch });
        setResourceMsg(t('admin.resources.bulk_count', { count: batch.length }) + ' added successfully!');
        setBulkText('');
      } else {
        await API.post('/resources', resourceForm);
        setResourceMsg('Resource added successfully!');
        setResourceForm({ ...resourceForm, title: '', drive_link: '' });
      }
      fetchData();
    } catch(err) {
      setResourceMsg('Failed to add resource(s).');
    }
  };

  const deleteResource = async (id) => {
    if(!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      fetchData();
    } catch {
      alert('Error deleting resource');
    }
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  const tabStyle = (tabId) => ({
    padding: '10px 15px',
    cursor: 'pointer',
    backgroundColor: activeTab === tabId ? '#1a73e8' : '#e8eaed',
    color: activeTab === tabId ? 'white' : '#202124',
    border: 'none',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    fontWeight: 'bold',
    flex: '1',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>{t('admin.title')}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{t('admin.welcome', { name: user.name })}</p>

      <div style={{ display: 'flex', gap: '5px', marginTop: '20px', borderBottom: '2px solid #1a73e8', overflowX: 'auto' }}>
        <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>{t('admin.tabs.pending')}</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>{t('admin.tabs.users')}</button>
        <button style={tabStyle('tutor')} onClick={() => setActiveTab('tutor')}>{t('admin.tabs.tutor')}</button>
        <button style={tabStyle('ai')} onClick={() => setActiveTab('ai')}>{t('admin.tabs.ai')}</button>
        <button style={tabStyle('broadcast')} onClick={() => setActiveTab('broadcast')}>{t('admin.tabs.broadcast')}</button>
        <button style={tabStyle('resources')} onClick={() => setActiveTab('resources')}>{t('admin.tabs.resources')}</button>
      </div>

      <div style={{ padding: '20px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderTop: 'none' }}>
        
        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div>
            <h2>{t('admin.pending.title')}</h2>
            {loading ? <p>{t('admin.pending.loading')}</p> : pendingUsers.length === 0 ? <p>{t('admin.pending.empty')}</p> : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {pendingUsers.map(u => (
                  <div key={u.id} style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{u.name}</strong> ({u.email})
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Role: {u.role}</div>
                      <div style={{ marginTop: '5px' }}>
                        <button onClick={() => setSelectedPendingUser(u)} style={{ padding: '4px 8px', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', color: '#1a73e8', borderRadius: '4px' }}>
                          {t('admin.pending.view_profile')}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleApprove(u.id)} style={{ padding: '8px 16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.pending.approve')}</button>
                      <button onClick={() => { setSelectedPendingUser(u); setRejectReason(''); }} style={{ padding: '8px 16px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.pending.reject')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FULL PROFILE MODAL FOR PENDING USER */}
            {selectedPendingUser && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h2 style={{marginTop: 0, borderBottom: '1px solid currentColor', paddingBottom: '10px'}}>{t('admin.pending.profile_review')}</h2>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    {selectedPendingUser.photo && (
                      <img src={selectedPendingUser.photo} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div>
                      <h3>{selectedPendingUser.name}</h3>
                      <p><strong>Email:</strong> {selectedPendingUser.email}</p>
                      <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedPendingUser.role}</span></p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: 'var(--gray-50)', padding: '15px', borderRadius: '8px' }}>
                    <p><strong>{t('admin.pending.field')}</strong> {selectedPendingUser.field || 'N/A'}</p>
                    <p><strong>{t('admin.pending.designation')}</strong> {selectedPendingUser.designation || 'N/A'}</p>
                    <p><strong>{t('admin.pending.city')}</strong> {selectedPendingUser.city || 'N/A'}</p>
                    <p><strong>{t('admin.pending.category')}</strong> {selectedPendingUser.category || 'N/A'}</p>
                    <p><strong>{t('admin.pending.mentor_type')}</strong> {selectedPendingUser.mentor_type || 'N/A'}</p>
                    <p><strong>{t('admin.pending.phone')}</strong> {selectedPendingUser.phone || 'N/A'}</p>
                    <p><strong>{t('admin.pending.whatsapp')}</strong> {selectedPendingUser.whatsapp || 'N/A'}</p>
                    <p><strong>{t('admin.pending.linkedin')}</strong> <a href={selectedPendingUser.linkedin} target="_blank" rel="noreferrer">Link</a></p>
                    <p><strong>{t('admin.pending.tenth_marks')}</strong> {selectedPendingUser.tenth_marks || 'N/A'} ({selectedPendingUser.tenth_board})</p>
                    <p><strong>{t('admin.pending.twelfth_marks')}</strong> {selectedPendingUser.twelfth_marks || 'N/A'} ({selectedPendingUser.twelfth_board})</p>
                  </div>
                  
                  {selectedPendingUser.achievements && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>{t('admin.pending.achievements')}</strong>
                      <p style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--gray-100)', padding: '10px', borderRadius: '4px' }}>{selectedPendingUser.achievements}</p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #fbbc05', backgroundColor: '#fff8e1', borderRadius: '8px' }}>
                    <label style={{ fontWeight: 'bold' }}>{t('admin.pending.rejection_reason')}</label>
                    <textarea 
                      value={rejectReason} 
                      onChange={(e) => setRejectReason(e.target.value)} 
                      placeholder={t('admin.pending.rejection_placeholder')}
                      style={{ width: '100%', padding: '10px', marginTop: '10px', minHeight: '80px' }}
                    />
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={() => setSelectedPendingUser(null)} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff' }}>{t('admin.pending.close')}</button>
                    <button onClick={() => handleApprove(selectedPendingUser.id)} style={{ padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.pending.approve_user')}</button>
                    <button onClick={() => handleReject(selectedPendingUser.id)} style={{ padding: '10px 20px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.pending.reject_user')}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANAGE USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2>{t('admin.users.title')}</h2>
            
            {/* Inline Editing Form */}
            {editingUserId && (
              <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #1a73e8', borderRadius: '8px', backgroundColor: '#e8f0fe' }}>
                <h3 style={{ marginTop: 0 }}>{t('admin.users.force_edit')} (ID: {editingUserId})</h3>
                {editMsg && <div style={{ color: editMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px' }}>{editMsg}</div>}
                <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>{t('admin.users.full_name')}</label>
                    <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                  </div>
                  <div>
                    <label>{t('admin.users.photo')}</label>
                    <input type="text" value={editForm.photo || ''} onChange={(e) => setEditForm({...editForm, photo: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                  </div>
                  {editForm.role !== 'student' && (
                    <>
                      <div>
                        <label>Field</label>
                        <input type="text" value={editForm.field || ''} onChange={(e) => setEditForm({...editForm, field: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                      </div>
                      <div>
                        <label>City</label>
                        <input type="text" value={editForm.city || ''} onChange={(e) => setEditForm({...editForm, city: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                      </div>
                      <div>
                        <label>Phone</label>
                        <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                      </div>
                      <div>
                        <label>WhatsApp</label>
                        <input type="text" value={editForm.whatsapp || ''} onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                      </div>
                    </>
                  )}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="profile_edited" checked={editForm.profile_edited || false} onChange={(e) => setEditForm({...editForm, profile_edited: e.target.checked})} />
                    <label htmlFor="profile_edited">{t('admin.users.unlock_profile')} (Checked = Locked, Unchecked = Open)</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.users.force_update')}</button>
                    <button type="button" onClick={() => setEditingUserId(null)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.users.cancel')}</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>ID</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.user')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.role')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.field_city')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.contact_info')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.lock')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.users.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{u.id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textTransform: 'capitalize' }}>
                         <span style={{ padding: '2px 8px', backgroundColor: u.role === 'admin' ? '#fce8e6' : u.role === 'guider' ? '#e8f0fe' : u.role === 'tutor' ? '#e6f4ea' : '#f1f3f4', borderRadius: '12px', fontSize: '0.8rem' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {u.field ? <div>{u.field}</div> : <span style={{color:'#ccc'}}>-</span>}
                        {u.city ? <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.city}</div> : null}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        {u.phone ? <div>📞 {u.phone}</div> : null}
                        {u.whatsapp ? <div>💬 {u.whatsapp}</div> : null}
                        {!u.phone && !u.whatsapp && <span style={{color:'#ccc'}}>-</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button 
                          onClick={() => handleToggleLock(u.id, u.profile_edited)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: u.profile_edited ? '#fff3cd' : '#d4edda', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {u.profile_edited ? t('admin.users.table.locked') : t('admin.users.table.open')}
                        </button>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button 
                          onClick={() => { setEditingUserId(u.id); setEditForm(u); setEditMsg(''); }}
                          style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: '#e8eaed', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {t('admin.users.table.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD TUTOR TAB */}
        {activeTab === 'tutor' && (
          <div>
            <h2>{t('admin.tutor.title')}</h2>
            <p>{t('admin.tutor.subtitle')}</p>
            {tutorMsg && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{tutorMsg}</div>}
            
            <form onSubmit={handleTutorSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Basic Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>{t('admin.users.full_name')}</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={tutorForm.name} onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})} required style={{ padding: '8px' }} />
                <label>{t('admin.tutor.email')}</label>
                <input type="email" placeholder="e.g. rahul@example.com" value={tutorForm.email} onChange={(e) => setTutorForm({...tutorForm, email: e.target.value})} required style={{ padding: '8px' }} />
                <label>{t('admin.users.photo')}</label>
                <PhotoUpload
                  value={tutorForm.photo}
                  onChange={(url) => setTutorForm({ ...tutorForm, photo: url })}
                  name={tutorForm.name}
                />
                <label>{t('admin.tutor.subject')}</label>
                <input type="text" placeholder="e.g. Mathematics / IIT JEE" value={tutorForm.field} onChange={(e) => setTutorForm({...tutorForm, field: e.target.value})} style={{ padding: '8px' }} />
                <label>{t('admin.pending.designation')}</label>
                <input type="text" placeholder="e.g. MSc Mathematics / B.Tech" value={tutorForm.designation} onChange={(e) => setTutorForm({...tutorForm, designation: e.target.value})} style={{ padding: '8px' }} />
                <label>{t('admin.pending.city')}</label>
                <input type="text" placeholder="e.g. Ranchi" value={tutorForm.city} onChange={(e) => setTutorForm({...tutorForm, city: e.target.value})} style={{ padding: '8px' }} />
              </div>

              {/* Academic & Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.tenth_marks')}</label>
                    <input type="text" placeholder="95" value={tutorForm.tenth_marks} onChange={(e) => setTutorForm({...tutorForm, tenth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.tenth_board')}</label>
                    <input type="text" placeholder="CBSE" value={tutorForm.tenth_board} onChange={(e) => setTutorForm({...tutorForm, tenth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.twelfth_marks')}</label>
                    <input type="text" placeholder="92" value={tutorForm.twelfth_marks} onChange={(e) => setTutorForm({...tutorForm, twelfth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.twelfth_board')}</label>
                    <input type="text" placeholder="CBSE" value={tutorForm.twelfth_board} onChange={(e) => setTutorForm({...tutorForm, twelfth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
                <label>{t('admin.pending.linkedin')}</label>
                <input type="text" placeholder="linkedin.com/in/..." value={tutorForm.linkedin} onChange={(e) => setTutorForm({...tutorForm, linkedin: e.target.value})} style={{ padding: '8px' }} />
                <label>{t('admin.pending.achievements')}</label>
                <textarea placeholder="Scholarships, Ranks, etc." value={tutorForm.achievements} onChange={(e) => setTutorForm({...tutorForm, achievements: e.target.value})} style={{ padding: '8px', height: '60px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.phone')}</label>
                    <input type="text" value={tutorForm.phone} onChange={(e) => setTutorForm({...tutorForm, phone: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>{t('admin.pending.whatsapp')}</label>
                    <input type="text" value={tutorForm.whatsapp} onChange={(e) => setTutorForm({...tutorForm, whatsapp: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>{t('admin.tutor.create')}</button>
              </div>
            </form>
          </div>
        )}

        {/* AI NOTIFICATIONS TAB */}
        {activeTab === 'ai' && (
          <div>
            <h2>{t('admin.ai.title')}</h2>
            <p>{t('admin.ai.subtitle')}</p>
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.category')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.timestamp')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {aiCategories.map(cat => (
                    <tr key={cat.category}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {cat.category}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: 'var(--text-secondary)' }}>
                        {cat.last_fetched_at ? new Date(cat.last_fetched_at).toLocaleString('en-IN') : t('admin.ai.never')}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button 
                          onClick={() => handleAiSync(cat.category)}
                          disabled={syncingCat === cat.category}
                          style={{ padding: '8px 16px', backgroundColor: '#34a853', color: '#fff', border: 'none', borderRadius: '4px', cursor: syncingCat === cat.category ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: syncingCat === cat.category ? 0.7 : 1 }}
                        >
                          {syncingCat === cat.category ? t('admin.ai.syncing') : t('admin.ai.force_sync')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {aiCategories.length === 0 && (
                    <tr><td colSpan="3" style={{ padding: '12px', textAlign: 'center' }}>{t('admin.ai.empty')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h3>{t('admin.ai.review_title')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('admin.ai.review_desc')}</p>
              <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.category')}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.title')}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.date')}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{t('admin.ai.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAiNotifs.map(notif => (
                      <tr key={notif.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee', textTransform: 'uppercase' }}>{notif.category}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 500 }}>{notif.title}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{notif.published_date}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <button onClick={() => deleteAiNotif(notif.id)} style={{ padding: '4px 8px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>{t('admin.resources.delete')}</button>
                        </td>
                      </tr>
                    ))}
                    {recentAiNotifs.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>{t('admin.ai.no_recent')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BROADCAST TAB */}
        {activeTab === 'broadcast' && (
          <div>
            <h2>{t('admin.broadcast.title')}</h2>
            <p>{t('admin.broadcast.subtitle')}</p>
            {manualNotifMsg && <div style={{ padding: '10px', backgroundColor: manualNotifMsg.includes('Failed') ? '#fce8e6' : '#d4edda', color: manualNotifMsg.includes('Failed') ? '#d93025' : '#155724', borderRadius: '4px', marginBottom: '15px' }}>{manualNotifMsg}</div>}
            
            <form onSubmit={handleManualNotifSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '30px' }}>
              <div style={{ flex: '1 1 100%' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.broadcast.form_title')}</label>
                <input type="text" placeholder="E.g. Website Maintenance on Sunday" value={manualNotifForm.title} onChange={(e) => setManualNotifForm({...manualNotifForm, title: e.target.value})} required style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.broadcast.form_desc')}</label>
                <textarea placeholder="Write detailed announcement..." value={manualNotifForm.description} onChange={(e) => setManualNotifForm({...manualNotifForm, description: e.target.value})} required style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)', minHeight: '80px' }} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.broadcast.form_link')}</label>
                <input type="url" placeholder="https://..." value={manualNotifForm.link} onChange={(e) => setManualNotifForm({...manualNotifForm, link: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ flex: '1 1 100%', textAlign: 'right' }}>
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.broadcast.btn_save')}</button>
              </div>
            </form>

            <h3 style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>{t('admin.broadcast.active_title')}</h3>
            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.broadcast.table.title')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.broadcast.table.date')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.broadcast.table.link')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.broadcast.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {manualNotifs.map(notif => (
                    <tr key={notif.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold' }}>{notif.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{notif.description}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{new Date(notif.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {notif.link ? <a href={notif.link} target="_blank" rel="noreferrer" style={{color:'#1a73e8'}}>{t('admin.broadcast.table.link')}</a> : '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button onClick={() => deleteManualNotif(notif.id)} style={{ padding: '6px 12px', backgroundColor: '#ea4335', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.resources.delete')}</button>
                      </td>
                    </tr>
                  ))}
                  {manualNotifs.length === 0 && (
                     <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>{t('admin.pending.empty')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDY MATERIALS UPLOAD TAB */}
        {activeTab === 'resources' && (
          <div>
            <h2>{t('admin.resources.title')}</h2>
            <p>{t('admin.resources.subtitle')}</p>
            {resourceMsg && <div style={{ padding: '10px', backgroundColor: resourceMsg.includes('Failed') ? '#fce8e6' : '#d4edda', color: resourceMsg.includes('Failed') ? '#d93025' : '#155724', borderRadius: '4px', marginBottom: '15px' }}>{resourceMsg}</div>}
            
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="bulkMode" 
                checked={bulkMode} 
                onChange={(e) => setBulkMode(e.target.checked)} 
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="bulkMode" style={{ fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                🚀 {t('admin.resources.bulk_mode')}
              </label>
            </div>

            <form onSubmit={handleResourceSubmit} style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.category')}</label>
                  <select 
                    value={resourceForm.category} 
                    onChange={(e) => setResourceForm({...resourceForm, category: e.target.value})} 
                    style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }}
                  >
                    {RESOURCE_CATEGORIES.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.class_level')}</label>
                  <select 
                    value={resourceForm.class_level} 
                    onChange={(e) => setResourceForm({...resourceForm, class_level: e.target.value})} 
                    style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }}
                  >
                    <option value="">N/A</option>
                    {CLASS_LEVELS.map(num => (
                       <option key={num} value={num}>Class {num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.medium_label')}</label>
                  <select 
                    value={resourceForm.medium} 
                    onChange={(e) => setResourceForm({...resourceForm, medium: e.target.value})} 
                    style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }}
                  >
                    <option value="hindi">{t('admin.resources.medium_hi')}</option>
                    <option value="english">{t('admin.resources.medium_en')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.description')}</label>
                  <input type="text" placeholder="e.g. NCERT Textbooks / Solutions" value={resourceForm.description} onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              {bulkMode ? (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.bulk_mode')}</label>
                  <textarea 
                    placeholder={t('admin.resources.bulk_placeholder')}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    style={{ width: '100%', minHeight: '150px', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'monospace' }}
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    {t('admin.resources.bulk_count', { count: bulkText.split('\n').filter(l => l.trim().includes(',')).length })}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.material_title')}</label>
                    <input type="text" placeholder="e.g. Physics Ch 1" value={resourceForm.title} onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})} required style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>{t('admin.resources.drive_link')}</label>
                    <input type="url" placeholder="https://drive.google.com/..." value={resourceForm.drive_link} onChange={(e) => setResourceForm({...resourceForm, drive_link: e.target.value})} required style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                  {bulkMode ? t('admin.broadcast.btn_save') : t('admin.resources.save')}
                </button>
              </div>
            </form>

            <h3 style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>{t('admin.resources.active_materials')}</h3>
            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.title')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.category')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.class')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.medium')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.link')}</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>{t('admin.resources.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(res => (
                    <tr key={res.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold' }}>{res.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{res.description}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                         <span style={{ padding: '2px 8px', backgroundColor: '#e8f0fe', borderRadius: '12px' }}>{res.category}</span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                         {res.class_level ? `Class ${res.class_level}` : '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textTransform: 'capitalize' }}>
                         {res.medium || '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <a href={res.drive_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', textDecoration: 'none' }}>{t('admin.resources.view_file')}</a>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button 
                          onClick={() => deleteResource(res.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#ea4335', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('admin.resources.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {resources.length === 0 && (
                     <tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>{t('admin.resources.empty')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
