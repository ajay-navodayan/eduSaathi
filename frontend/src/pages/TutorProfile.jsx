import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import ChatBox from '../components/ChatBox';
import './GuiderProfile.css'; // Reuse the same styles

export default function TutorProfile() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await API.get(`/tutors/${id}`);
        setTutor(res.data);
      } catch (err) {
        setError('Tutor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (error) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2>😔 {error}</h2>
      <Link to="/tutors" className="btn btn-primary mt-3">Back to Tutors</Link>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="page-hero">
        <div className="container page-hero-content">
          <Link to="/tutors" className="back-link">← Back to Tutors</Link>
          <h1>Tutor Profile</h1>
        </div>
      </div>

      <div className="container profile-container">
        <div className="profile-grid">
          {/* Left Panel */}
          <div className="profile-info-card">
            <div className="glass-card">
              <div className="avatar-container">
                <img
                  src={tutor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=1a73e8&color=fff&size=300`}
                  alt={tutor.name}
                  className="main-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=1a73e8&color=fff&size=300`;
                  }}
                />
              </div>
              <h2 className="display-name">{tutor.name}</h2>
              <div className="category-pill">🎯 {tutor.field || tutor.subject}</div>

              {tutor.designation && <p className="profile-designation">🏛️ {tutor.designation}</p>}
              {tutor.city && <p className="profile-city">📍 {tutor.city}</p>}

              {/* Contact Buttons */}
              <div className="contact-buttons">
                {tutor.whatsapp && (
                  <a
                    href={`https://wa.me/${tutor.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn whatsapp-btn"
                  >
                    💬 WhatsApp
                  </a>
                )}
                {tutor.email && (
                  <a
                    href={`mailto:${tutor.email}`}
                    className="contact-btn email-btn"
                  >
                    ✉️ Email
                  </a>
                )}
                {tutor.phone && (
                  <a
                    href={`tel:${tutor.phone}`}
                    className="contact-btn phone-btn"
                  >
                    📞 Call
                  </a>
                )}
                {tutor.linkedin && (
                  <a
                    href={tutor.linkedin.startsWith('http') ? tutor.linkedin : `https://${tutor.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn linkedin-btn"
                  >
                    🔗 LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="profile-content">
            {/* Academic Details */}
            <div className="glass-card">
              <h3 className="section-title">📚 Academic Details</h3>
              <div className="stats-row">
                {tutor.tenth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">10th Marks {tutor.tenth_board && `(${tutor.tenth_board})`}</span>
                    <span className="stat-value">{tutor.tenth_marks}</span>
                  </div>
                )}
                {tutor.twelfth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">12th Marks {tutor.twelfth_board && `(${tutor.twelfth_board})`}</span>
                    <span className="stat-value">{tutor.twelfth_marks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            {tutor.achievements && (
              <div className="glass-card">
                <h3 className="section-title">🏆 Achievements</h3>
                <div className="pills-container">
                  {tutor.achievements.split(',').map((ach, i) => (
                    <span key={i} className="achievement-pill">{ach.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Tips */}
            <div className="glass-card highlight-section">
              <h3 className="section-title">💡 For Students</h3>
              <p>
                Reach out to <strong>{tutor.name}</strong> for coaching on {tutor.field || tutor.subject}.
                They have the experience and knowledge to help you excel in your studies.
              </p>
              <div className="inspiration-note">
                <span>🔑</span>
                <span>Contact them via WhatsApp or Email for the fastest response.</span>
              </div>
            </div>

            {/* Live Chat */}
            <div className="glass-card chat-section">
              {tutor.user_id ? (
                <ChatBox peerId={tutor.user_id} peerName={tutor.name} />
              ) : (
                <div className="chat-placeholder">
                  <p>💬 Chat is unavailable because this Tutor hasn't registered a user account yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
