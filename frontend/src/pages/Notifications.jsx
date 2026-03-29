import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import './Notifications.css';

const TABS_KEYS = [
  'pinned', 'govt', 'jee', 'neet', 'railway', 'ssc', 'navodaya', 'neterhat', 'scholarship'
];

export default function Notifications() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pinned');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchNotifs = async () => {
      try {
        let res;
        if (activeTab === 'pinned') {
          res = await API.get('/notifications');
          if (isMounted) {
            setNotifications(res.data);
            setLastFetched(null);
          }
        } else {
          res = await API.get(`/notifications/ai?category=${activeTab}`);
          if (isMounted) {
            setNotifications(res.data);
            if (res.data.length > 0) {
              setLastFetched(res.data[0].fetched_at);
            } else {
              setLastFetched(null);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifs();
    return () => { isMounted = false; };
  }, [activeTab]);

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>{t('notifications.hero.title')}</h1>
          <p>{t('notifications.hero.subtitle')}</p>
        </div>
      </div>

      <div className="container notif-page-container">
        
        {/* Scrollable Tab Bar */}
        <div className="notif-tabs-wrapper">
          <div className="notif-tabs">
            {TABS_KEYS.map(tabId => (
              <button
                key={tabId}
                className={`notif-tab ${activeTab === tabId ? 'active' : ''}`}
                data-cat={tabId}
                onClick={() => setActiveTab(tabId)}
              >
                {t(`notifications.tabs.${tabId}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Header */}
        <div className="notif-meta-bar">
          <h3>
            {t('notifications.meta.updates', { tab: t(`notifications.tabs.${activeTab}`).replace(/📌|🏛️|🎯|🩺|🚂|📝|🏫|🏔️|🎓/g, '').trim() })}
          </h3>
          {lastFetched && (
            <div className="notif-meta-info">
              <span className="notif-meta-dot"></span>
              {t('notifications.meta.auto_updated')} {new Date(lastFetched).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>

        <div className="notif-tab-content">
          {loading ? (
            <div className="notif-skeleton">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="notif-skeleton-item">
                  <div className="notif-skeleton-line w60"></div>
                  <div className="notif-skeleton-line w90"></div>
                  <div className="notif-skeleton-line w40"></div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="notif-page-list">
              {notifications.map((notif, i) => (
                <div key={notif.id} className="notif-page-item">
                  <div className="notif-number">#{String(i + 1).padStart(2, '0')}</div>
                  <div className="notif-page-content">
                    <div className="notif-page-header">
                      <div>
                        {activeTab === 'pinned' && (
                          <span className="notif-pinned-badge">{t('notifications.card.handpicked')}</span>
                        )}
                        {activeTab !== 'pinned' && (
                          <span className={`notif-category-badge cat-${activeTab}`}>
                            {activeTab}
                          </span>
                        )}
                        <h3>{notif.title}</h3>
                      </div>
                      <span className="notif-page-date">
                        {activeTab === 'pinned' 
                          ? new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : notif.published_date}
                      </span>
                    </div>
                    {notif.description && (
                      <p className="notif-page-desc">{notif.description}</p>
                    )}
                    {((notif.link && notif.link !== '#') || (notif.source_url && notif.source_url !== '#')) && (
                      <a
                        href={notif.link || notif.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="notif-page-link"
                      >
                        {t('notifications.card.official_site')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notif-empty-state fade-in-up">
              <span className="notif-empty-icon">📂</span>
              <h3>{t('notifications.empty.title', { tab: t(`notifications.tabs.${activeTab}`).replace(/📌|🏛️|🎯|🩺|🚂|📝|🏫|🏔️|🎓/g, '').trim() })}</h3>
              <p>{t('notifications.empty.subtitle')}</p>
            </div>
          )}
        </div>

        {/* Final Spacer to prevent footer touching */}
        <div className="notif-page-bottom-spacer"></div>
      </div>
    </div>
  );
}
