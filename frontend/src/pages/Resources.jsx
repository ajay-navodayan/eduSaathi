import { useState, useEffect } from 'react';
import API from '../api';
import './Resources.css';

const CATEGORIES = ['All', 'IIT', 'NEET', 'UPSC', 'Railway', 'Army', 'Matric', 'Intermediate'];

const CATEGORY_ICONS = {
  'IIT': '🔬', 'NEET': '🩺', 'UPSC': '🏛️',
  'Army': '⚔️', 'Railway': '🚂', 'Matric': '📚',
  'Intermediate': '📖', 'All': '📦'
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchResources = (cat) => {
    setLoading(true);
    const params = cat !== 'All' ? { category: cat } : {};
    API.get('/resources', { params })
      .then(res => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources('All');
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchResources(cat);
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>📚 Study Resources</h1>
          <p>Download free study materials for all major competitive exams</p>
        </div>
      </div>

      <div className="container resources-container">
        {/* Category Filters */}
        <div className="resources-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`resource-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : resources.length > 0 ? (
          <div className="resources-grid">
            {resources.map((res, i) => (
              <div
                key={res.id}
                className="resource-card card fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="resource-icon">
                  {CATEGORY_ICONS[res.category] || '📄'}
                </div>
                <div className="resource-body">
                  <span className="badge badge-blue resource-cat-badge">{res.category}</span>
                  <h3 className="resource-title">{res.title}</h3>
                  {res.description && <p className="resource-desc">{res.description}</p>}
                </div>
                <div className="resource-footer">
                  <a
                    href={res.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    📥 Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📂</span>
            <h3>No resources in this category</h3>
            <p>Check back soon or select another category</p>
          </div>
        )}
      </div>
    </div>
  );
}
