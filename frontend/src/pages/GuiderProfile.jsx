import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api';
import ChatBox from '../components/ChatBox';
import './GuiderProfile.css';

export default function GuiderProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [guider, setGuider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuider = async () => {
      try {
        const res = await API.get(`/guiders/${id}`);
        setGuider(res.data);
      } catch (err) {
        setError(t('guider_profile.not_found'));
      } finally {
        setLoading(false);
      }
    };
    fetchGuider();
  }, [id, t]);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (error) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2>😔 {error}</h2>
      <Link to="/guiders" className="btn btn-primary mt-3">{t('guider_profile.back')}</Link>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="page-hero">
        <div className="container page-hero-content">
          <Link to="/guiders" className="back-link">{t('guider_profile.back')}</Link>
          <h1>{t('guider_profile.title')}</h1>
        </div>
      </div>

      <div className="container profile-container">
        <div className="profile-grid">
          {/* Left Panel */}
          <div className="profile-info-card">
            <div className="glass-card">
              <div className="avatar-container">
                <img
                  src={guider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`}
                  alt={guider.name}
                  className="main-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`;
                  }}
                />
              </div>
              <h2 className="display-name">{guider.name}</h2>
              {guider.category && (
                <div className="category-pill">{guider.category}</div>
              )}
              <div className="category-pill" style={{marginTop: '-10px', background: '#fef3c7', color: '#92400e'}}>🎯 {guider.field}</div>

              {guider.designation && <p className="profile-designation">🏛️ {guider.designation}</p>}
              {guider.city && <p className="profile-city">📍 {guider.city}</p>}
              {guider.mentor_type && (
                <p className="profile-city">🧩 {guider.mentor_type === 'tutor_mentor' ? t('guider_profile.mentor_type.tutor_mentor') : t('guider_profile.mentor_type.mentor_only')}</p>
              )}

              {/* Contact Buttons */}
              <div className="contact-buttons">
                {guider.whatsapp && (
                  <a
                    href={`https://wa.me/${guider.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn whatsapp-btn"
                  >
                    {t('guider_profile.contact.whatsapp')}
                  </a>
                )}
                {guider.email && (
                  <a
                    href={`mailto:${guider.email}`}
                    className="contact-btn email-btn"
                  >
                    {t('guider_profile.contact.email')}
                  </a>
                )}
                {guider.phone && (
                  <a
                    href={`tel:${guider.phone}`}
                    className="contact-btn phone-btn"
                  >
                    {t('guider_profile.contact.call')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="profile-content">
            {/* Academic Details */}
            <div className="glass-card">
              <h3 className="section-title">{t('guider_profile.academic.title')}</h3>
              <div className="stats-row">
                {guider.tenth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">{t('guider_profile.academic.tenth')}</span>
                    <span className="stat-value">{guider.tenth_marks}</span>
                  </div>
                )}
                {guider.twelfth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">{t('guider_profile.academic.twelfth')}</span>
                    <span className="stat-value">{guider.twelfth_marks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            {guider.achievements && (
              <div className="glass-card">
                <h3 className="section-title">{t('guider_profile.achievements')}</h3>
                <div className="pills-container">
                  {guider.achievements.split(',').map((ach, i) => (
                    <span key={i} className="achievement-pill">{ach.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Tips */}
            <div className="glass-card highlight-section">
              <h3 className="section-title">{t('guider_profile.tips.title')}</h3>
              <p>
                {t('guider_profile.tips.desc', { name: guider.name, field: guider.field })}
                {' '}{t('guider_profile.tips.desc_sub')}
              </p>
              <div className="inspiration-note">
                <span>🔑</span>
                <span>{t('guider_profile.tips.note')}</span>
              </div>
            </div>

            {/* Live Chat */}
            <div className="glass-card chat-section">
              {guider.user_id ? (
                <ChatBox peerId={guider.user_id} peerName={guider.name} />
              ) : (
                <div className="chat-placeholder">
                  <p>{t('guider_profile.chat_unavailable')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
