import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name, photo: '', field: '', designation: '', city: '', category: '', 
    tenth_marks: '', tenth_board: '', twelfth_marks: '', twelfth_board: '',
    achievements: '', linkedin: '', whatsapp: '', phone: '' 
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  
  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePwdChange = (e) => setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/profile/me/${user.id}`);
      setProfileData(res.data);
      if (!res.data.profile_edited) {
        setProfileForm({ 
          name: res.data.name || '', 
          photo: res.data.photo || '',
          field: res.data.field || '', 
          designation: res.data.designation || '', 
          city: res.data.city || '', 
          category: res.data.category || '', 
          tenth_marks: res.data.tenth_marks || '',
          tenth_board: res.data.tenth_board || '',
          twelfth_marks: res.data.twelfth_marks || '',
          twelfth_board: res.data.twelfth_board || '',
          achievements: res.data.achievements || '',
          linkedin: res.data.linkedin || '',
          whatsapp: res.data.whatsapp || '', 
          phone: res.data.phone || '' 
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user]);

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/profile/update', { userId: user.id, ...profileForm });
      setProfileMsg(res.data.message);
      fetchProfile(); // Refresh to show readonly view
    } catch (err) {
      setProfileMsg(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const submitPwd = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/profile/change-password', { userId: user.id, ...pwdForm });
      setPwdMsg(res.data.message);
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Account Settings</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h2>User Profile</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>View and manage your personal demographics.</p>
        
        {profileData?.profile_edited ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1a73e8' }}>Profile Secured ✅</h3>
              <span style={{ fontSize: '0.8rem', backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '4px 8px', borderRadius: '12px' }}>Locked (Read-Only)</span>
            </div>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Role:</strong> {profileData.role}</p>
            {(profileData.role === 'guider' || profileData.role === 'tutor') && (
              <>
                <p><strong>Field:</strong> {profileData.field || 'N/A'}</p>
                <p><strong>Designation:</strong> {profileData.designation || 'N/A'}</p>
                <p><strong>Location:</strong> {profileData.city || 'N/A'}</p>
                {profileData.role === 'guider' && <p><strong>Category:</strong> {profileData.category || 'N/A'}</p>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <p><strong>10th:</strong> {profileData.tenth_marks || 'N/A'}% {profileData.tenth_board && `(${profileData.tenth_board})`}</p>
                  <p><strong>12th:</strong> {profileData.twelfth_marks || 'N/A'}% {profileData.twelfth_board && `(${profileData.twelfth_board})`}</p>
                </div>
                
                <p><strong>Achievements:</strong> {profileData.achievements || 'N/A'}</p>
                <p><strong>LinkedIn:</strong> {profileData.linkedin || 'N/A'}</p>
                <p><strong>Phone:</strong> {profileData.phone || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> {profileData.whatsapp || 'N/A'}</p>
              </>
            )}
            <p style={{ marginTop: '1rem', fontSize: '0.9em', color: '#666' }}>
              * To change any of your locked demographic data, please contact the Administration.
            </p>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>Notice:</strong> You can only edit your profile details <b>once</b>. Please make sure the data is accurate before saving.
            </div>
            {profileMsg && <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '1rem', borderRadius: '4px' }}>{profileMsg}</div>}
            
            <form onSubmit={submitProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Name" value={profileForm.name} onChange={handleProfileChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>Photo URL</label>
                <input type="text" name="photo" placeholder="Photo URL" value={profileForm.photo} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>Field/Subject</label>
                <input type="text" name="field" placeholder="Field (e.g. UPSC)" value={profileForm.field} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>Designation</label>
                <input type="text" name="designation" placeholder="Designation" value={profileForm.designation} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>City</label>
                <input type="text" name="city" placeholder="City" value={profileForm.city} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                {user.role === 'guider' && (
                  <>
                    <label>Category</label>
                    <select 
                      name="category" 
                      value={profileForm.category} 
                      onChange={handleProfileChange} 
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                    >
                      <option value="">Select Category</option>
                      {['Doctor', 'Engineer', 'Defence', 'SSC', 'Railway', 'Post Office', 'CA', 'Bsc nursing', 'UPSC'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>10th %</label>
                    <input type="text" name="tenth_marks" placeholder="10th %" value={profileForm.tenth_marks} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>10th Board</label>
                    <input type="text" name="tenth_board" placeholder="Board" value={profileForm.tenth_board} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>12th %</label>
                    <input type="text" name="twelfth_marks" placeholder="12th %" value={profileForm.twelfth_marks} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>12th Board</label>
                    <input type="text" name="twelfth_board" placeholder="Board" value={profileForm.twelfth_board} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} />
                  </div>
                </div>
                <label>Achievements</label>
                <textarea name="achievements" placeholder="Achievements (comma separated)" value={profileForm.achievements} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', height: '60px' }} />
                <label>LinkedIn ID</label>
                <input type="text" name="linkedin" placeholder="LinkedIn Profile Link" value={profileForm.linkedin} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>WhatsApp Number</label>
                <input type="text" name="whatsapp" placeholder="WhatsApp Number" value={profileForm.whatsapp} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <label>Phone Number</label>
                <input type="text" name="phone" placeholder="Phone Number" value={profileForm.phone} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Profile Details Permanently</button>
              </div>
            </form>
          </>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2>Security Settings</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Update your password to keep your account secure.</p>
        
        {pwdMsg && <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '1rem', borderRadius: '4px' }}>{pwdMsg}</div>}
        
        <form onSubmit={submitPwd} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <input type="password" name="currentPassword" placeholder="Current Password" value={pwdForm.currentPassword} onChange={handlePwdChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" name="newPassword" placeholder="New Password" value={pwdForm.newPassword} onChange={handlePwdChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change Password</button>
        </form>
      </div>

    </div>
  );
}
