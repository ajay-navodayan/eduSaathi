import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import API from '../api';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name, photo: '', field: '', designation: '', city: '', 
    category: '', whatsapp: '', phone: '', mentor_type: 'mentor_only',
    class_level: '', school: '', bio: ''
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
      // Initialize form with existing data
      setProfileForm({ 
        name: res.data.name || '', 
        photo: res.data.photo || '',
        field: res.data.field || '', 
        designation: res.data.designation || '', 
        city: res.data.city || '', 
        category: res.data.category || '',
        whatsapp: res.data.whatsapp || '', 
        phone: res.data.phone || '',
        mentor_type: res.data.mentor_type || 'mentor_only',
        class_level: res.data.class_level || '',
        school: res.data.school || '',
        bio: res.data.bio || ''
      });
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
    if (!pwdForm.newPassword) return;
    try {
      const { error } = await supabase.auth.updateUser({
        password: pwdForm.newPassword
      });
      if (error) throw error;
      setPwdMsg('Password updated successfully!');
      setPwdForm({ newPassword: '' });
    } catch (err) {
      setPwdMsg(err.message || 'Failed to change password');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('profile.loading')}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>{t('profile.title')}</h1>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <h2>{t('profile.user_profile')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('profile.user_desc')}</p>
        
        {/* Students can edit ANYTIME. Others are locked if profile_edited is true */}
        {(profileData?.role !== 'student' && profileData?.profile_edited) ? (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1a73e8' }}>{t('profile.secured')}</h3>
              <span style={{ fontSize: '0.8rem', backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '4px 8px', borderRadius: '12px' }}>{t('profile.locked_badge')}</span>
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
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{profileData.role}</p>
                </div>
              </div>
            )}
            <p><strong>{t('profile.name_label')}</strong> {profileData.name}</p>
            <p><strong>{t('profile.email_label')}</strong> {profileData.email}</p>
            <p><strong>{t('profile.role_label')}</strong> {profileData.role}</p>
            {profileData.role === 'guider' && (
              <>
                <p><strong>{t('profile.field_label')}</strong> {profileData.field || 'N/A'}</p>
                <p><strong>{t('profile.designation_label')}</strong> {profileData.designation || 'N/A'}</p>
                <p><strong>{t('profile.location_label')}</strong> {profileData.city || 'N/A'}</p>
                <p><strong>{t('profile.category_label')}</strong> {profileData.category || 'N/A'}</p>
                <p><strong>{t('profile.mentor_type_label')}</strong> {profileData.mentor_type === 'tutor_mentor' ? t('profile.type_tutor_mentor') : t('profile.type_mentor_only')}</p>
                <p><strong>{t('profile.phone_label')}</strong> {profileData.phone || 'N/A'}</p>
                <p><strong>{t('profile.whatsapp_label')}</strong> {profileData.whatsapp || 'N/A'}</p>
              </>
            )}
            {profileData.role === 'student' && (
              <>
                <p><strong>{t('profile.class_label')}</strong> {profileData.class_level || 'N/A'}</p>
                <p><strong>{t('profile.school_label')}</strong> {profileData.school || 'N/A'}</p>
                <p><strong>{t('profile.phone_label')}</strong> {profileData.phone || 'N/A'}</p>
                <p><strong>{t('profile.bio_label')}</strong> {profileData.bio || 'N/A'}</p>
              </>
            )}
            <p style={{ marginTop: '1rem', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
              {t('profile.locked_notice')}
            </p>
          </div>
        ) : (
          <>
            {user.role !== 'student' && (
              <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '1rem' }}>
                {t('profile.edit_warning')}
              </div>
            )}
            {profileMsg && <div style={{ padding: '10px', backgroundColor: 'var(--gray-100)', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>{profileMsg}</div>}
            
            <form onSubmit={submitProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* Photo upload — spans full width, centered */}
              {(user.role === 'guider' || user.role === 'tutor' || user.role === 'student') && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <PhotoUpload
                    value={profileForm.photo}
                    onChange={(url) => setProfileForm({ ...profileForm, photo: url })}
                    name={profileForm.name}
                  />
                </div>
              )}
              
              <input type="text" name="name" placeholder={t('profile.placeholders.name')} value={profileForm.name} onChange={handleProfileChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              
              {user.role === 'guider' && (
                <>
                  <input type="text" name="field" placeholder={t('profile.placeholders.field')} value={profileForm.field} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="designation" placeholder={t('profile.placeholders.designation')} value={profileForm.designation} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="city" placeholder={t('profile.placeholders.city')} value={profileForm.city} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="category" placeholder={t('profile.placeholders.category')} value={profileForm.category} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <select name="mentor_type" value={profileForm.mentor_type} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <option value="mentor_only">{t('profile.type_mentor_only')}</option>
                    <option value="tutor_mentor">{t('profile.type_tutor_mentor')}</option>
                  </select>
                  <input type="text" name="whatsapp" placeholder={t('profile.placeholders.whatsapp')} value={profileForm.whatsapp} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="phone" placeholder={t('profile.placeholders.phone')} value={profileForm.phone} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                </>
              )}

              {user.role === 'student' && (
                <>
                  <input type="text" name="class_level" placeholder={t('profile.placeholders.class_level')} value={profileForm.class_level} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="school" placeholder={t('profile.placeholders.school')} value={profileForm.school} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <input type="text" name="phone" placeholder={t('profile.placeholders.phone')} value={profileForm.phone} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <textarea name="bio" placeholder={t('profile.placeholders.bio')} value={profileForm.bio} onChange={handleProfileChange} style={{ gridColumn: '1 / -1', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', minHeight: '80px' }} />
                </>
              )}
              
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('profile.save_btn')}</button>
              </div>
            </form>
          </>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
        <h2>{t('profile.security.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('profile.security.desc')}</p>
        
        {pwdMsg && <div style={{ padding: '10px', backgroundColor: 'var(--gray-100)', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>{pwdMsg}</div>}
        
        <form onSubmit={submitPwd} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <input type="password" name="currentPassword" placeholder={t('profile.security.current_pwd')} value={pwdForm.currentPassword} onChange={handlePwdChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
          <input type="password" name="newPassword" placeholder={t('profile.security.new_pwd')} value={pwdForm.newPassword} onChange={handlePwdChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('profile.security.change_btn')}</button>
        </form>
      </div>

    </div>
  );
}
