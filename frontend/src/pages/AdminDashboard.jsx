<<<<<<< HEAD
import { useState } from 'react';
import API from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Forms states
  const [tutorForm, setTutorForm] = useState({ name: '', subject: '', location: '', contact: '', experience: '' });
  const [guiderForm, setGuiderForm] = useState({ name: '', photo: '', field: '', designation: '', city: '', category: '', tenth_marks: '', twelfth_marks: '', achievements: '', whatsapp: '', email: '', phone: '', contact: '' });
  const [notifForm, setNotifForm] = useState({ title: '', description: '', link: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', category: '', drive_link: '', description: '' });

  const handleMsg = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e, endpoint, formData, setFormState, emptyFormState) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(endpoint, formData);
      handleMsg('success', 'Successfully added to database!');
      setFormState(emptyFormState);
    } catch (err) {
      handleMsg('error', err.response?.data?.error || 'Failed to add. Please try again.');
=======
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API from '../api';
import PhotoUpload from '../components/PhotoUpload';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [tutorForm, setTutorForm] = useState({ 
    name: '', photo: '', field: '', designation: '', city: '', 
    tenth_marks: '', tenth_board: '', twelfth_marks: '', twelfth_board: '', 
    achievements: '', linkedin: '', whatsapp: '', phone: '', email: '' 
  });
  const [tutorMsg, setTutorMsg] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', photo: '', field: '', designation: '', city: '', 
    tenth_marks: '', tenth_board: '', twelfth_marks: '', twelfth_board: '',
    achievements: '', linkedin: '', whatsapp: '', phone: '',
    overrideLock: false 
  });
  const [editMsg, setEditMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pendingRes = await API.get('/admin/pending-users');
      setPendingUsers(pendingRes.data);
      
      const allRes = await API.get('/admin/users');
      // Fetch extra profile data for users to show "all fields"
      const detailedUsers = await Promise.all(allRes.data.map(async (u) => {
        try {
          const profileRes = await API.get(`/profile/me/${u.id}`);
          return { ...u, ...profileRes.data };
        } catch {
          return u;
        }
      }));
      setAllUsers(detailedUsers);
    } catch (err) {
      console.error('Failed to fetch data:', err);
>>>>>>> origin/image
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <div className="admin-page">
      <div className="page-hero">
        <div className="container text-center">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Add new Tutors, Guiders, Resources, and Notifications</p>
        </div>
      </div>

      <div className="container admin-container">
        {statusMsg.text && (
          <div className={`alert alert-${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="admin-tabs">
          <button className={activeTab === 'tutor' ? 'active' : ''} onClick={() => setActiveTab('tutor')}>👨‍🏫 Add Tutor</button>
          <button className={activeTab === 'guider' ? 'active' : ''} onClick={() => setActiveTab('guider')}>🎓 Add Guider</button>
          <button className={activeTab === 'resource' ? 'active' : ''} onClick={() => setActiveTab('resource')}>📚 Add Resource</button>
          <button className={activeTab === 'notification' ? 'active' : ''} onClick={() => setActiveTab('notification')}>📢 Add Notif</button>
        </div>

        <div className="admin-content card">
          
          {/* Add Tutor */}
          {activeTab === 'tutor' && (
            <form onSubmit={(e) => handleSubmit(e, '/tutors', tutorForm, setTutorForm, { name: '', subject: '', location: '', contact: '', experience: '' })}>
              <h3>Add Local Tutor</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Tutor Name" value={tutorForm.name} onChange={e => setTutorForm({...tutorForm, name: e.target.value})} />
                <input className="form-input" placeholder="Subject" value={tutorForm.subject} onChange={e => setTutorForm({...tutorForm, subject: e.target.value})} />
                <input className="form-input" placeholder="Location/City" value={tutorForm.location} onChange={e => setTutorForm({...tutorForm, location: e.target.value})} />
                <input className="form-input" placeholder="Phone/WhatsApp" value={tutorForm.contact} onChange={e => setTutorForm({...tutorForm, contact: e.target.value})} />
                <input className="form-input" placeholder="Experience (e.g. 5 Years)" value={tutorForm.experience} onChange={e => setTutorForm({...tutorForm, experience: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Tutor</button>
            </form>
          )}

          {/* Add Notification */}
          {activeTab === 'notification' && (
            <form onSubmit={(e) => handleSubmit(e, '/notifications', notifForm, setNotifForm, { title: '', description: '', link: '' })}>
              <h3>Add Notification</h3>
              <div className="flex-col gap-2">
                <input required className="form-input" placeholder="Notification Title" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} />
                <textarea className="form-textarea" placeholder="Description/Message" value={notifForm.description} onChange={e => setNotifForm({...notifForm, description: e.target.value})}></textarea>
                <input className="form-input" placeholder="Link (Optional, e.g. https://nta.ac.in)" value={notifForm.link} onChange={e => setNotifForm({...notifForm, link: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Notification</button>
            </form>
          )}

          {/* Add Resource */}
          {activeTab === 'resource' && (
            <form onSubmit={(e) => handleSubmit(e, '/resources', resourceForm, setResourceForm, { title: '', category: '', drive_link: '', description: '' })}>
              <h3>Add Study Resource</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Resource Title" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
                <select className="form-select" value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="IIT">IIT</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Railway">Railway</option>
                  <option value="Army">Army</option>
                  <option value="Matric">Matric</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
                <input required className="form-input" placeholder="Google Drive Link" value={resourceForm.drive_link} onChange={e => setResourceForm({...resourceForm, drive_link: e.target.value})} />
              </div>
              <textarea className="form-textarea mt-1" placeholder="Description" value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})}></textarea>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Resource</button>
            </form>
          )}

          {/* Add Guider */}
          {activeTab === 'guider' && (
            <form onSubmit={(e) => handleSubmit(e, '/guiders', guiderForm, setGuiderForm, { name: '', photo: '', field: '', designation: '', city: '', category: '', tenth_marks: '', twelfth_marks: '', achievements: '', whatsapp: '', email: '', phone: '', contact: '' })}>
              <h3>Add Guider (Mentor)</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Full Name" value={guiderForm.name} onChange={e => setGuiderForm({...guiderForm, name: e.target.value})} />
                <select className="form-select" value={guiderForm.category} onChange={e => setGuiderForm({...guiderForm, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="IIT">IIT</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Railway">Railway</option>
                  <option value="Army">Army</option>
                </select>
                <input className="form-input" placeholder="Field (e.g. UPSC CSE)" value={guiderForm.field} onChange={e => setGuiderForm({...guiderForm, field: e.target.value})} />
                <input className="form-input" placeholder="Designation (e.g. IAS Officer)" value={guiderForm.designation} onChange={e => setGuiderForm({...guiderForm, designation: e.target.value})} />
                <input className="form-input" placeholder="City" value={guiderForm.city} onChange={e => setGuiderForm({...guiderForm, city: e.target.value})} />
                <input className="form-input" type="email" placeholder="Email" value={guiderForm.email} onChange={e => setGuiderForm({...guiderForm, email: e.target.value})} />
                <input className="form-input" placeholder="WhatsApp Number" value={guiderForm.whatsapp} onChange={e => setGuiderForm({...guiderForm, whatsapp: e.target.value})} />
                <input className="form-input" placeholder="Profile Photo URL (Optional)" value={guiderForm.photo} onChange={e => setGuiderForm({...guiderForm, photo: e.target.value})} />
                <input className="form-input" placeholder="10th Marks" value={guiderForm.tenth_marks} onChange={e => setGuiderForm({...guiderForm, tenth_marks: e.target.value})} />
                <input className="form-input" placeholder="12th Marks" value={guiderForm.twelfth_marks} onChange={e => setGuiderForm({...guiderForm, twelfth_marks: e.target.value})} />
              </div>
              <textarea className="form-textarea mt-1" placeholder="Achievements (comma separated)" value={guiderForm.achievements} onChange={e => setGuiderForm({...guiderForm, achievements: e.target.value})}></textarea>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Guider</button>
            </form>
          )}

        </div>
=======
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
            <h2>Manage All Users & Detailed Profiles</h2>
            {editMsg && <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '10px' }}>{editMsg}</div>}
            
            {editingUserId ? (
              <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3>Force Edit User Profile</h3>
                <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>Full Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ padding: '8px' }} required />
                    <label>Profile Photo</label>
                    <PhotoUpload
                      value={editForm.photo}
                      onChange={(url) => setEditForm({ ...editForm, photo: url })}
                      name={editForm.name}
                    />
                    <label>Field/Subject</label>
                    <input type="text" value={editForm.field} onChange={(e) => setEditForm({...editForm, field: e.target.value})} style={{ padding: '8px' }} />
                    <label>Designation</label>
                    <input type="text" value={editForm.designation} onChange={(e) => setEditForm({...editForm, designation: e.target.value})} style={{ padding: '8px' }} />
                    <label>City</label>
                    <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} style={{ padding: '8px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label>10th %</label>
                        <input type="text" value={editForm.tenth_marks} onChange={(e) => setEditForm({...editForm, tenth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>10th Board</label>
                        <input type="text" value={editForm.tenth_board} onChange={(e) => setEditForm({...editForm, tenth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label>12th %</label>
                        <input type="text" value={editForm.twelfth_marks} onChange={(e) => setEditForm({...editForm, twelfth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>12th Board</label>
                        <input type="text" value={editForm.twelfth_board} onChange={(e) => setEditForm({...editForm, twelfth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                      </div>
                    </div>
                    <label>Achievements</label>
                    <textarea value={editForm.achievements} onChange={(e) => setEditForm({...editForm, achievements: e.target.value})} style={{ padding: '8px', height: '60px' }} />
                    <label>LinkedIn ID</label>
                    <input type="text" value={editForm.linkedin} onChange={(e) => setEditForm({...editForm, linkedin: e.target.value})} style={{ padding: '8px' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <input type="text" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ padding: '8px', flex: 1 }} />
                       <input type="text" placeholder="WhatsApp" value={editForm.whatsapp} onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})} style={{ padding: '8px', flex: 1 }} />
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={editForm.overrideLock} onChange={(e) => setEditForm({...editForm, overrideLock: e.target.checked})} />
                      Unlock profile to let user edit it again
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Force Update Profile</button>
                      <button type="button" onClick={() => setEditingUserId(null)} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>User</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Role</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Field/City</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Contact Info</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Lock</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <span style={{ padding: '2px 8px', backgroundColor: u.role === 'guider' ? '#e8f0fe' : u.role === 'admin' ? '#feefe3' : '#e6fffa', borderRadius: '12px', fontSize: '0.8rem' }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <div>{u.field || '-'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.city || '-'}</div>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <div style={{ fontSize: '0.8rem' }}>📞 {u.phone || '-'}</div>
                          <div style={{ fontSize: '0.8rem' }}>💬 {u.whatsapp || '-'}</div>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{u.profile_edited ? '🔒 Locked' : '🔓 Open'}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                          <button 
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditForm({ 
                                name: u.name, photo: u.photo || '', field: u.field || '', designation: u.designation || '', city: u.city || '', 
                                tenth_marks: u.tenth_marks || '', tenth_board: u.tenth_board || '', 
                                twelfth_marks: u.twelfth_marks || '', twelfth_board: u.twelfth_board || '',
                                achievements: u.achievements || '', linkedin: u.linkedin || '', 
                                whatsapp: u.whatsapp || '', phone: u.phone || '',
                                overrideLock: false 
                              });
                              setEditMsg('');
                            }}
                            style={{ padding: '6px 12px', backgroundColor: '#fbbc05', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD TUTOR TAB */}
        {activeTab === 'tutor' && (
          <div>
            <h2>Add New Tutor</h2>
            <p>Fill in the professional details to create a tutor profile and guest user account.</p>
            {tutorMsg && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{tutorMsg}</div>}
            
            <form onSubmit={handleTutorSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Basic Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={tutorForm.name} onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})} required style={{ padding: '8px' }} />
                <label>Email Address</label>
                <input type="email" placeholder="e.g. rahul@example.com" value={tutorForm.email} onChange={(e) => setTutorForm({...tutorForm, email: e.target.value})} required style={{ padding: '8px' }} />
                <label>Profile Photo</label>
                <PhotoUpload
                  value={tutorForm.photo}
                  onChange={(url) => setTutorForm({ ...tutorForm, photo: url })}
                  name={tutorForm.name}
                />
                <label>Subject/Field</label>
                <input type="text" placeholder="e.g. Mathematics / IIT JEE" value={tutorForm.field} onChange={(e) => setTutorForm({...tutorForm, field: e.target.value})} style={{ padding: '8px' }} />
                <label>Designation/Education</label>
                <input type="text" placeholder="e.g. MSc Mathematics / B.Tech" value={tutorForm.designation} onChange={(e) => setTutorForm({...tutorForm, designation: e.target.value})} style={{ padding: '8px' }} />
                <label>Current City</label>
                <input type="text" placeholder="e.g. Ranchi" value={tutorForm.city} onChange={(e) => setTutorForm({...tutorForm, city: e.target.value})} style={{ padding: '8px' }} />
              </div>

              {/* Academic & Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>10th %</label>
                    <input type="text" placeholder="95" value={tutorForm.tenth_marks} onChange={(e) => setTutorForm({...tutorForm, tenth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>10th Board</label>
                    <input type="text" placeholder="CBSE" value={tutorForm.tenth_board} onChange={(e) => setTutorForm({...tutorForm, tenth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>12th %</label>
                    <input type="text" placeholder="92" value={tutorForm.twelfth_marks} onChange={(e) => setTutorForm({...tutorForm, twelfth_marks: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>12th Board</label>
                    <input type="text" placeholder="CBSE" value={tutorForm.twelfth_board} onChange={(e) => setTutorForm({...tutorForm, twelfth_board: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
                <label>LinkedIn ID</label>
                <input type="text" placeholder="linkedin.com/in/..." value={tutorForm.linkedin} onChange={(e) => setTutorForm({...tutorForm, linkedin: e.target.value})} style={{ padding: '8px' }} />
                <label>Achievements</label>
                <textarea placeholder="Scholarships, Ranks, etc." value={tutorForm.achievements} onChange={(e) => setTutorForm({...tutorForm, achievements: e.target.value})} style={{ padding: '8px', height: '60px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Phone</label>
                    <input type="text" value={tutorForm.phone} onChange={(e) => setTutorForm({...tutorForm, phone: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>WhatsApp</label>
                    <input type="text" value={tutorForm.whatsapp} onChange={(e) => setTutorForm({...tutorForm, whatsapp: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Create tutor Profile</button>
              </div>
            </form>
          </div>
        )}

>>>>>>> origin/image
      </div>
    </div>
  );
}
