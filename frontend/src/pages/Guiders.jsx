import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api';
import GuiderCard from '../components/GuiderCard';
import './Guiders.css';

const CATEGORIES = ['All', 'Matric', 'Intermediate', 'NEET', 'IIT', 'Railway', 'Army', 'UPSC'];

export default function Guiders() {
  const { t } = useTranslation();
  const [guiders, setGuiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');

  const fetchGuiders = async (category, search) => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await API.get('/guiders', { params });
      setGuiders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuiders(activeCategory, searchTerm);
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const newParams = {};
    if (cat !== 'All') newParams.category = cat;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
    fetchGuiders(cat, searchTerm);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = {};
    if (activeCategory !== 'All') newParams.category = activeCategory;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
    fetchGuiders(activeCategory, searchTerm);
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <h1>{t('guiders.hero.title')}</h1>
          <p>{t('guiders.hero.subtitle')}</p>
        </div>
      </div>

      <div className="container guiders-container">
        {/* Search Bar */}
        <form className="guiders-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input"
            placeholder={t('guiders.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">{t('guiders.search.button')}</button>
        </form>

        {/* Category Filters */}
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {t(`guiders.categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="guiders-results-header">
          <span>{loading ? t('guiders.results.loading') : (guiders.length === 1 ? t('guiders.results.found_singular', { count: 1 }) : t('guiders.results.found_plural', { count: guiders.length }))}</span>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : guiders.length > 0 ? (
          <div className="grid-3">
            {guiders.map(guider => (
              <GuiderCard key={guider.id} guider={guider} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <h3>{t('guiders.empty.title')}</h3>
            <p>{t('guiders.empty.subtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
