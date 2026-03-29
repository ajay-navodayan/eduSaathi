import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import './Tutors.css';

export default function Tutors() {
  const { t } = useTranslation();
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
          <h1>{t('tutors.hero.title')}</h1>
          <p>{t('tutors.hero.subtitle')}</p>
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
                      <span>⏱️</span> {t('tutors.card.experience', { exp: tutor.experience })}
                    </div>
                  )}
                </div>
                {tutor.contact && (
                  <div className="tutor-footer">
                    <a href={`tel:${tutor.contact}`} className="btn btn-primary btn-sm">
                      {t('tutors.card.contact')}
                    </a>
                    <a
                      href={`https://wa.me/${tutor.contact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm whatsapp-green"
                    >
                      {t('tutors.card.whatsapp')}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">👩‍🏫</span>
            <h3>{t('tutors.empty.title')}</h3>
            <p>{t('tutors.empty.subtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
