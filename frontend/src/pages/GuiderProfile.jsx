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
      <div className="profile-hero">
        <div className="container">
          <Link to="/guiders" className="back-link">
            <span>←</span> Back to all Guiders
          </Link>
          <div className="hero-content">
            <h1 className="hero-title">Mentor Profile</h1>
            <p className="hero-subtitle">Get specialized guidance from an expert in {guider.field}</p>
          </div>
        </div>
      </div>

      <div className="container profile-main">
        <div className="profile-grid">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="glass-card profile-info-card">
              <div className="avatar-container">
                <img
                  src={guider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`}
                  alt={guider.name}
                  className="main-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=300`;
                  }}
                />
                {guider.status === 'online' && <span className="online-indicator"></span>}
              </div>
              <h2 className="display-name">{guider.name}</h2>
              <div className="category-pill">{guider.category || 'Expert'}</div>
              
              <div className="quick-meta">
                <div className="meta-item">🎯 {guider.field}</div>
                {guider.designation && <div className="meta-item">🏛️ {guider.designation}</div>}
                {guider.city && <div className="meta-item">📍 {guider.city}</div>}
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

              <div className="action-buttons">
                {guider.whatsapp && (
                  <a href={`https://wa.me/${guider.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="action-btn wa-btn">
                    WhatsApp
                  </a>
                )}
                {guider.email && (
                  <a href={`mailto:${guider.email}`} className="action-btn email-btn">
                    Send Email
                  </a>
                )}
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="profile-content">
            {/* Academic Section */}
            <section className="glass-card content-section">
              <h3 className="section-title">📚 Academic Background</h3>
              <div className="stats-row">
                {guider.tenth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">10th Grade {guider.tenth_board && `(${guider.tenth_board})`}</span>
                    <span className="stat-value">{guider.tenth_marks}</span>
                  </div>
                )}
                {guider.twelfth_marks && (
                  <div className="stat-card">
                    <span className="stat-label">12th Grade {guider.twelfth_board && `(${guider.twelfth_board})`}</span>
                    <span className="stat-value">{guider.twelfth_marks}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Achievements Section */}
            {guider.achievements && (
              <section className="glass-card content-section">
                <h3 className="section-title">🏆 Key Achievements</h3>
                <div className="pills-container">
                  {guider.achievements.split(',').map((ach, i) => (
                    <div key={i} className="achievement-pill">
                      {ach.trim()}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Motivation Section */}
            <section className="glass-card content-section highlight-section">
              <h3 className="section-title">💡 Guidance Focus</h3>
              <p>
                Connect with {guider.name} to accelerate your journey in <strong>{guider.field}</strong>. 
                Benefit from real-world insights and proven strategies.
              </p>
            </section>

            {/* Chat Section */}
            <section className="glass-card chat-section">
              <h3 className="section-title">💬 Live Consultation</h3>
              <div className="chat-wrapper">
                {guider.user_id ? (
                  <ChatBox peerId={guider.user_id} peerName={guider.name} />
                ) : (
                  <div className="chat-placeholder">
                    <p>Direct chat is currently unavailable for this profile.</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
