import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api';
import GuiderCard from '../components/GuiderCard';
import './Home.css';

const CATEGORIES = ['IIT', 'NEET', 'UPSC', 'Army', 'Railway', 'Matric', 'Intermediate'];

const CATEGORY_ICONS = {
  'IIT': '🔬', 'NEET': '🩺', 'UPSC': '🏛️',
  'Army': '⚔️', 'Railway': '🚂', 'Matric': '📚', 'Intermediate': '📖'
};

const NOTIF_TABS = [
  { id: 'pinned', label: '📌 Pinned' },
  { id: 'jee', label: '🎯 JEE' },
  { id: 'neet', label: '🩺 NEET' },
  { id: 'govt', label: '🏛️ Govt' },
  { id: 'railway', label: '🚂 Railway' },
  { id: 'ssc', label: '📝 SSC' },
  { id: 'navodaya', label: '🏫 Navodaya' },
  { id: 'neterhat', label: '🏔️ Neterhat' },
  { id: 'scholarship', label: '🎓 Scholarship' }
];

export default function Home() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [activeNotifTab, setActiveNotifTab] = useState('pinned');
  const [notifLoading, setNotifLoading] = useState(false);
  
  const [guiders, setGuiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load Guiders once
  useEffect(() => {
    const fetchGuiders = async () => {
      try {
        const guiderRes = await API.get('/guiders');
        setGuiders(guiderRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuiders();
  }, []);

  // Load Notifications on tab change
  useEffect(() => {
    let isMounted = true;
    setNotifLoading(true);
    const fetchNotifs = async () => {
      try {
        let res;
        if (activeNotifTab === 'pinned') {
          res = await API.get('/notifications');
        } else {
          res = await API.get(`/notifications/ai?category=${activeNotifTab}`);
        }
        if (isMounted) {
          setNotifications(res.data.slice(0, 5)); // Show top 5
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setNotifLoading(false);
      }
    };
    fetchNotifs();
    return () => { isMounted = false; };
  }, [activeNotifTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/guiders?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="container hero-content">

          <h1 className="hero-title fade-in-up">
            {t('home.hero.title_pt1')}<br />
            <span className="hero-title-accent">{t('home.hero.title_pt2')}</span>
          </h1>
          <p className="hero-subtitle fade-in-up">
            {t('home.hero.subtitle')}
          </p>
          <div className="hero-actions fade-in-up">
            <Link to="/guiders" className="btn btn-accent btn-lg">{t('home.hero.find_mentor')}</Link>
            <Link to="/resources" className="btn btn-outline-white btn-lg">{t('home.hero.resources')}</Link>
          </div>
          <div className="hero-stats fade-in-up">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">{t('home.hero.stats.students')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">{t('home.hero.stats.guiders')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">7+</span>
              <span className="stat-label">{t('home.hero.stats.exams')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <h2>{t('home.search.title')}</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-inputs">
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder={t('home.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="form-select search-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t('home.search.all_categories')}</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary btn-lg">{t('home.search.search_btn')}</button>
              </div>
            </form>
            <div className="category-quick-links">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className="category-chip"
                  onClick={() => navigate(`/guiders?category=${cat}`)}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Banner with Tabs */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="section-header">
            <h2>{t('home.notifications.title')}</h2>
            <p>{t('home.notifications.subtitle')}</p>
          </div>
          
          {/* Notifications Tabs */}
          <div className="home-notif-tabs-wrapper">
            <div className="home-notif-tabs">
              {NOTIF_TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`home-notif-tab ${activeNotifTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveNotifTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="notifications-list" style={{ minHeight: '300px' }}>
            {notifLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner"></div><p className="mt-2 text-muted">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <a
                  key={notif.id}
                  href={notif.link || notif.source_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notif-item"
                >
                  <div className="notif-dot" style={{ backgroundColor: activeNotifTab === 'pinned' ? '#dc2626' : '#2563eb' }}></div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    {/* Add published date to description display for non-pinned categories */}
                    <p>
                      {activeNotifTab !== 'pinned' ? `[${notif.published_date || t('home.notifications.new')}] ` : ''}
                      {notif.description}
                    </p>
                  </div>
                  <div className="notif-date">
                    {activeNotifTab === 'pinned' 
                      ? new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : t('home.notifications.link')}
                  </div>
                  <span className="notif-arrow">→</span>
                </a>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <span className="empty-state-icon text-muted">📭</span>
                <h4>{t('home.notifications.empty', { tab: NOTIF_TABS.find(t => t.id === activeNotifTab)?.label })}</h4>
              </div>
            )}
          </div>
          
          <div className="text-center mt-3">
            <Link to="/notifications" className="btn btn-outline">{t('home.notifications.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* Featured Guiders */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.featured.title')}</h2>
            <p>{t('home.featured.subtitle')}</p>
          </div>
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : guiders.length > 0 ? (
            <>
              <div className="grid-3">
                {guiders.map(guider => (
                  <GuiderCard key={guider.id} guider={guider} />
                ))}
              </div>
              <div className="text-center mt-3">
                <Link to="/guiders" className="btn btn-primary btn-lg">{t('home.featured.view_all')}</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">👨‍🏫</span>
              <h3>{t('home.featured.empty_title')}</h3>
              <p>{t('home.featured.empty_subtitle')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.subtitle')}</p>
            <div className="flex-center gap-2 mt-3">
              <Link to="/register" className="btn btn-accent btn-lg">{t('home.cta.register')}</Link>
              <Link to="/guiders" className="btn btn-outline-white btn-lg">{t('home.cta.browse')}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
