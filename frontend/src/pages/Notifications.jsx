import { useState, useEffect } from 'react';
import API from '../api';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>📢 Notifications</h1>
          <p>Stay updated with the latest exam notifications and opportunities</p>
        </div>
      </div>

      <div className="container notif-page-container">
        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : notifications.length > 0 ? (
          <div className="notif-page-list">
            {notifications.map((notif, i) => (
              <div
                key={notif.id}
                className="notif-page-item fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="notif-number">#{String(i + 1).padStart(2, '0')}</div>
                <div className="notif-page-content">
                  <div className="notif-page-header">
                    <h3>{notif.title}</h3>
                    <span className="notif-page-date">
                      {new Date(notif.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {notif.description && (
                    <p className="notif-page-desc">{notif.description}</p>
                  )}
                  {notif.link && notif.link !== '#' && (
                    <a
                      href={notif.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notif-page-link btn btn-sm btn-outline"
                    >
                      Visit Official Site →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🔔</span>
            <h3>No notifications yet</h3>
            <p>Check back soon for the latest updates!</p>
          </div>
        )}
      </div>
    </div>
  );
}
