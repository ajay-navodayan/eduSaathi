import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import ChatBox from '../components/ChatBox';
import './GuiderProfile.css';

export default function GuiderProfile() {
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
        setError('Guider not found');
      } finally {
        setLoading(false);
      }
    };
    fetchGuider();
  }, [id]);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (error) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2>😔 {error}</h2>
      <Link to="/guiders" className="btn btn-primary mt-3">Back to Guiders</Link>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="page-hero">
        <div className="container page-hero-content">
          <Link to="/guiders" className="back-link">← Back to Guiders</Link>
          <h1>Guider Profile</h1>
        </div>
      </div>

      <div className="container profile-container">
        <div className="profile-layout">
          {/* Left Panel */}
          <div className="profile-left">
            <div className="profile-card card">
              <div className="profile-avatar-wrapper">
                <img
                  src={guider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`}
                  alt={guider.name}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`;
                  }}
                />
              </div>
              <h2 className="profile-name">{guider.name}</h2>
              {guider.category && (
                <span className="badge badge-blue profile-category">{guider.category}</span>
              )}
              <p className="profile-field">🎯 {guider.field}</p>
              {guider.designation && <p className="profile-designation">🏛️ {guider.designation}</p>}
              {guider.city && <p className="profile-city">📍 {guider.city}</p>}
              {guider.mentor_type && (
                <p className="profile-city">🧩 {guider.mentor_type === 'tutor_mentor' ? 'Tutor + Mentor' : 'Mentor Only'}</p>
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
                    💬 WhatsApp
                  </a>
                )}
                {guider.email && (
                  <a
                    href={`mailto:${guider.email}`}
                    className="contact-btn email-btn"
                  >
                    ✉️ Email
                  </a>
                )}
                {guider.phone && (
                  <a
                    href={`tel:${guider.phone}`}
                    className="contact-btn phone-btn"
                  >
                    📞 Call
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="profile-right">
            {/* Academic Details */}
            <div className="profile-section card">
              <h3>📚 Academic Details</h3>
              <div className="academic-grid">
                {guider.tenth_marks && (
                  <div className="academic-item">
                    <span className="academic-label">10th Marks</span>
                    <span className="academic-value">{guider.tenth_marks}</span>
                  </div>
                )}
                {guider.twelfth_marks && (
                  <div className="academic-item">
                    <span className="academic-label">12th Marks</span>
                    <span className="academic-value">{guider.twelfth_marks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            {guider.achievements && (
              <div className="profile-section card">
                <h3>🏆 Achievements</h3>
                <div className="achievements-list">
                  {guider.achievements.split(',').map((ach, i) => (
                    <div key={i} className="achievement-item">
                      <span className="achievement-bullet">★</span>
                      <span>{ach.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Tips */}
            <div className="profile-section card inspiration-card">
              <h3>💡 For Students</h3>
              <p>
                Reach out to <strong>{guider.name}</strong> for guidance on {guider.field}.
                They have first-hand experience and can help you plan your preparation strategy.
              </p>
              <div className="inspiration-note">
                <span>🔑</span>
                <span>Contact them via WhatsApp or Email for the fastest response.</span>
              </div>
            </div>

            {/* Live Chat */}
            <div className="profile-section card" style={{ marginTop: '20px' }}>
              {guider.user_id ? (
                <ChatBox peerId={guider.user_id} peerName={guider.name} />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  <p>💬 Chat is unavailable because this Guider hasn't registered a user account yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
