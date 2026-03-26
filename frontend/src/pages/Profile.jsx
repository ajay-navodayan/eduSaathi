import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [profileForm, setProfileForm] = useState({ name: user?.name, photo: '', field: '', designation: '', city: '', category: '', whatsapp: '', phone: '' });
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
          name: res.data.name || '', photo: res.data.photo || '',
          field: res.data.field || '', designation: res.data.designation || '', 
          city: res.data.city || '', category: res.data.category || '',
          whatsapp: res.data.whatsapp || '', phone: res.data.phone || '' 
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
            {/* Photo display in locked view */}
            {(profileData.role === 'guider' || profileData.role === 'tutor') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <img
                  src={profileData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=1a73e8&color=fff&size=150`}
                  alt={profileData.name}
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1a73e8' }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=1a73e8&color=fff&size=150`; }}
                />
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{profileData.name}</p>
                  <p style={{ margin: '4px 0 0', color: '#555' }}>{profileData.role}</p>
                </div>
              </div>
            )}
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Role:</strong> {profileData.role}</p>
            {profileData.role === 'guider' && (
              <>
                <p><strong>Field:</strong> {profileData.field || 'N/A'}</p>
                <p><strong>Designation:</strong> {profileData.designation || 'N/A'}</p>
                <p><strong>Location:</strong> {profileData.city || 'N/A'}</p>
                <p><strong>Category:</strong> {profileData.category || 'N/A'}</p>
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
              {/* Photo upload — spans full width, centered */}
              {(user.role === 'guider' || user.role === 'tutor') && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <PhotoUpload
                    value={profileForm.photo}
                    onChange={(url) => setProfileForm({ ...profileForm, photo: url })}
                    name={profileForm.name}
                  />
                </div>
              )}
              <input type="text" name="name" placeholder="Name" value={profileForm.name} onChange={handleProfileChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              {user.role === 'guider' && (
                <>
                  <input type="text" name="field" placeholder="Field (e.g. UPSC)" value={profileForm.field} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" name="designation" placeholder="Designation" value={profileForm.designation} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" name="city" placeholder="City" value={profileForm.city} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" name="category" placeholder="Category" value={profileForm.category} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" name="whatsapp" placeholder="WhatsApp Number" value={profileForm.whatsapp} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" name="phone" placeholder="Phone Number" value={profileForm.phone} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </>
              )}
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
