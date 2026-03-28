import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import GuiderCard from '../components/GuiderCard';
import './Home.css';

const CATEGORIES = ['IIT', 'NEET', 'UPSC', 'Army', 'Railway', 'Matric', 'Intermediate'];

const CATEGORY_ICONS = {
  'IIT': '🔬', 'NEET': '🩺', 'UPSC': '🏛️',
  'Army': '⚔️', 'Railway': '🚂', 'Matric': '📚', 'Intermediate': '📖'
};

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [guiders, setGuiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, guiderRes] = await Promise.all([
          API.get('/notifications'),
          API.get('/guiders'),
        ]);
        setNotifications(notifRes.data.slice(0, 3));
        setGuiders(guiderRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            Learn, Compete, Succeed with<br />
            <span className="hero-title-accent">Experts</span>
          </h1>
          <p className="hero-subtitle fade-in-up">
            Learn directly from achievers in Engineering, MBBS, Defence, and beyond personalized for you. Begin now.
          </p>
          <div className="hero-actions fade-in-up">
            <Link to="/guiders" className="btn btn-accent btn-lg">Find My Mentor</Link>
            <Link to="/resources" className="btn btn-outline-white btn-lg">Resources for Me</Link>
          </div>
          <div className="hero-stats fade-in-up">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Guiders</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">7+</span>
              <span className="stat-label">Exams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <h2>🔍 Meet Your Mentor</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-inputs">
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Search by name, field, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="form-select search-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary btn-lg">Search</button>
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

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <section className="section" style={{ paddingTop: '0' }}>
          <div className="container">
            <div className="section-header">
              <h2>📢 Latest Notifications</h2>
              <p>Stay updated with the latest exam news and opportunities</p>
            </div>
            <div className="notifications-list">
              {notifications.map((notif) => (
                <a
                  key={notif.id}
                  href={notif.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notif-item"
                >
                  <div className="notif-dot"></div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.description}</p>
                  </div>
                  <div className="notif-date">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <span className="notif-arrow">→</span>
                </a>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link to="/notifications" className="btn btn-outline">View All Notifications</Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Guiders */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2>⭐ Featured Guiders</h2>
            <p>Connect with successful alumni who cleared top exams</p>
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
                <Link to="/guiders" className="btn btn-primary btn-lg">View All Guiders →</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">👨‍🏫</span>
              <h3>No guiders yet</h3>
              <p>Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Start Your Journey?</h2>
            <p>One platform, endless opportunities—start your journey with SathSikho</p>
            <div className="flex-center gap-2 mt-3">
              <Link to="/register" className="btn btn-accent btn-lg">Register Now — It's Free!</Link>
              <Link to="/guiders" className="btn btn-outline-white btn-lg">Browse Guiders</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
