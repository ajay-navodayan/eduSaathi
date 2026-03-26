import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import './Tutors.css';

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tutors')
      .then(res => setTutors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>🏫 Local Tutors</h1>
          <p>Find experienced local tutors near you for personalized coaching</p>
        </div>
      </div>

      <div className="container tutors-container">
        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : tutors.length > 0 ? (
          <div className="tutors-grid">
            {tutors.map((tutor, i) => (
              <div
                key={tutor.id}
                className="tutor-card card fade-in-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="tutor-avatar-area">
                  <div className="tutor-avatar">
                    {tutor.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="tutor-info">
                  <h3 className="tutor-name">{tutor.name}</h3>
                  <div className="tutor-subject">
                    <span>📖</span> {tutor.subject}
                  </div>
                  {tutor.location && (
                    <div className="tutor-location">
                      <span>📍</span> {tutor.location}
                    </div>
                  )}
                  {tutor.experience && (
                    <div className="tutor-exp">
                      <span>⏱️</span> {tutor.experience} experience
                    </div>
                  )}
                </div>
                {tutor.contact && (
                  <div className="tutor-footer" style={{ flexDirection: 'column', gap: '8px' }}>
                    <Link to={`/tutors/${tutor.id}`} className="btn btn-primary btn-sm w-full" style={{ textAlign: 'center' }}>
                      View Profile →
                    </Link>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <a href={`tel:${tutor.contact}`} className="btn btn-outline btn-sm" style={{ flex: 1, padding: '5px' }}>
                        📞 Call
                      </a>
                      <a
                        href={`https://wa.me/${tutor.contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm whatsapp-green"
                        style={{ flex: 1, padding: '5px' }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">👩‍🏫</span>
            <h3>No tutors listed yet</h3>
            <p>Contact us to get listed as a tutor on EduSaathi</p>
          </div>
        )}
      </div>
    </div>
  );
}
