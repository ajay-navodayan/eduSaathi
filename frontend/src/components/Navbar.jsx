import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Provide i18n hooks
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const preferredDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (preferredDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };
  
  // Toggle Language Handler
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('sathsikho_language', nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Helper Labels
  const langLabel = i18n.language === 'en' ? 'हिन्दी' : 'Eng';
  const langTitle = i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src="/sathsikho-logo.png" alt="SathSikho" className="navbar-logo-img" />
        </Link>

        {/* Desktop Nav */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{t('nav.home')}</NavLink>
          <NavLink to="/guiders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{t('nav.guiders')}</NavLink>
          <NavLink to="/tutors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{t('nav.tutors')}</NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{t('nav.resources')}</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{t('nav.notifications')}</NavLink>

          <div className="nav-actions-group">
            {/* Language Toggle (Styled to match Theme Toggle) */}
            <button 
              className={`lang-toggle-pill ${i18n.language === 'en' ? 'en-active' : 'hi-active'}`} 
              onClick={toggleLanguage} 
              title={langTitle}
              aria-label={langTitle}
            >
              <span className="lang-icon">🌐</span>
              <span className="lang-text">{langLabel}</span>
            </button>

            {/* Theme Toggle */}
             <button
                type="button"
                className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="theme-toggle-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? t('nav.dark_mode') : t('nav.light_mode')}</span>
              </button>
          </div>

          {user ? (
            <div className="nav-user">
              <NavLink to="/profile" className="nav-username" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: 'bold' }}>
                👤 {user.name}
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin-dashboard" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>{t('nav.admin')}</NavLink>
              )}
              {user.role === 'guider' && (
                <NavLink to="/guider-dashboard" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>{t('nav.chat_dashboard')}</NavLink>
              )}
              <button className="btn btn-sm btn-accent" onClick={handleLogout}>{t('nav.logout')}</button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>{t('nav.login')}</NavLink>
              <NavLink to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>{t('nav.register')}</NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
