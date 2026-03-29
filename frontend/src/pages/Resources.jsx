import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import './Resources.css';

const CATEGORIES = ['All', 'NCERT', 'Matric', 'Intermediate', 'IIT', 'NEET', 'UPSC', 'Railway', 'Army'];

const CATEGORY_ICONS = {
  'NCERT': '📚', 'IIT': '🔬', 'NEET': '🩺', 'UPSC': '🏛️',
  'Army': '⚔️', 'Railway': '🚂', 'Matric': '📖',
  'Intermediate': '📝', 'All': '📦'
};

export default function Resources() {
  const { t } = useTranslation();
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

  // Grouping logic for NCERT table
  const renderNcertTable = () => {
    // Group by class_level
    const classes = [...new Set(resources.map(r => r.class_level))].sort((a, b) => b - a);
    
    return classes.map(cls => {
      const classResources = resources.filter(r => r.class_level === cls);
      // Group by subject (extracted from description or title)
      const subjects = [...new Set(classResources.map(r => r.description))];

      return (
        <div key={cls} className="ncert-class-section fade-in-up">
          <h2 className="ncert-class-title">{t('resources.ncert.class_title', { class: cls })}</h2>
          <div className="ncert-table-wrapper">
            <table className="ncert-table">
              <thead>
                <tr>
                  <th>{t('resources.ncert.subject')}</th>
                  <th>{t('resources.ncert.english_medium')}</th>
                  <th>{t('resources.ncert.hindi_medium')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(sub => {
                  const eng = classResources.find(r => r.description === sub && r.medium === 'english');
                  const hi = classResources.find(r => r.description === sub && r.medium === 'hindi');
                  
                  // Clean subject name (remove "Class X - " prefix)
                  const cleanSubject = sub.replace(/Class \d+ - /, '');

                  return (
                    <tr key={sub}>
                      <td className="subject-name">{cleanSubject}</td>
                      <td>
                        {eng ? (
                          <a href={eng.drive_link} target="_blank" rel="noopener noreferrer" className="ncert-down-btn eng">
                            <span className="down-icon">⬇️</span> English
                          </a>
                        ) : <span className="not-available">-</span>}
                      </td>
                      <td>
                        {hi ? (
                          <a href={hi.drive_link} target="_blank" rel="noopener noreferrer" className="ncert-down-btn hi">
                            <span className="down-icon">⬇️</span> हिन्दी
                          </a>
                        ) : <span className="not-available">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>{t('resources.hero.title')}</h1>
          <p>{t('resources.hero.subtitle')}</p>
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
              <span>{t(`guiders.categories.${cat}`)}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : resources.length > 0 ? (
          activeCategory === 'NCERT' ? (
            <div className="ncert-container">
              {renderNcertTable()}
            </div>
          ) : (
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
                      {t('resources.card.download')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📂</span>
            <h3>{t('resources.empty.title')}</h3>
            <p>{t('resources.empty.subtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
