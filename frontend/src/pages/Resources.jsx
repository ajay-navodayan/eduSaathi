import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import './Resources.css';

const CATEGORIES = ['All', 'Class 10', 'Class 12', 'NCERT', 'JEE', 'NEET', 'UPSC', 'SSC', 'Railway', 'Navodaya', 'Netarhat', 'Sainik School', 'Army'];

const CATEGORY_ICONS = {
  'Class 10': '📖', 'Class 12': '📝', 'NCERT': '📚', 'JEE': '🚀', 'NEET': '🩺', 
  'UPSC': '🏛️', 'SSC': '💼', 'Railway': '🚂', 'Navodaya': '🏫', 
  'Netarhat': '🏔️', 'Sainik School': '🛡️', 'Army': '⚔️', 'All': '📦'
};

export default function Resources() {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [classLevel, setClassLevel] = useState('All');

  const fetchResources = () => {
    setLoading(true);
    let params = {};
    
    if (activeCategory !== 'All') params.category = activeCategory;
    if (classLevel !== 'All') params.class_level = classLevel;
    if (searchTerm) params.q = searchTerm;
    
    API.get('/resources', { params })
      .then(res => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, 500); // 500ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, classLevel, searchTerm]);

  // Split resources into NCERT and non-NCERT
  const ncertResources = resources.filter(r => r.category === 'NCERT');
  const otherResources = resources.filter(r => r.category !== 'NCERT');

  // Grouping logic for NCERT table
  const renderNcertTable = (ncertList) => {
    // Group by class_level
    const classes = [...new Set(ncertList.map(r => r.class_level))].filter(Boolean).sort((a, b) => b - a);

    if (classes.length === 0) return null;

    return classes.map(cls => {
      const classResources = ncertList.filter(r => r.class_level === cls);
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
                  const cleanSubject = sub ? sub.replace(/Class \d+ - /, '') : 'Resource';

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

  const hasResults = resources.length > 0;
  const hasNcert = ncertResources.length > 0;
  const hasOther = otherResources.length > 0;

  return (
    <div className="resources-page">
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>{t('resources.hero.title')}</h1>
          <p>{t('resources.hero.subtitle')}</p>
        </div>
      </div>

      <div className="container resources-container">
        {/* Search & Filters */}
        <div className="resources-filter-box card">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder={t('resources.filters.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="resource-search-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>{t('resources.filters.select_category')}</label>
              <select 
                value={activeCategory} 
                onChange={(e) => setActiveCategory(e.target.value)}
                className="resource-select"
              >
                <option value="All">{t('resources.filters.all_categories')}</option>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{t(`guiders.categories.${cat}`)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('resources.filters.select_class')}</label>
              <select 
                value={classLevel} 
                onChange={(e) => setClassLevel(e.target.value)}
                className="resource-select"
              >
                <option value="All">{t('resources.filters.all_classes')}</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : !hasResults ? (
          <div className="empty-state">
            <span className="empty-state-icon">📂</span>
            <h3>{t('resources.empty.title')}</h3>
            <p>{t('resources.empty.subtitle')}</p>
          </div>
        ) : (
          <>
            {/* NCERT Section — always shown as grouped table when NCERT books are present */}
            {hasNcert && (
              <div className="ncert-container">
                {activeCategory === 'All' && (
                  <h2 className="section-heading">
                    <span>📚</span> NCERT Textbooks
                  </h2>
                )}
                {renderNcertTable(ncertResources) || (
                  <div className="empty-state">
                    <span className="empty-state-icon">📂</span>
                    <h3>{t('resources.empty.title')}</h3>
                    <p>{t('resources.empty.subtitle')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Other Categories — shown as cards */}
            {hasOther && (
              <div style={{ marginTop: hasNcert ? '4rem' : '0' }}>
                {activeCategory === 'All' && (
                  <h2 className="section-heading">
                    <span>📋</span> Other Study Materials
                  </h2>
                )}
                <div className="resources-grid">
                  {otherResources.map((res, i) => (
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
                        {res.class_level && <span className="resource-class-tag">Class {res.class_level}</span>}
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
