import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

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

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src="/sathsikho-logo.png" alt="SathSikho" className="navbar-logo-img" />
        </Link>

        {/* Desktop Nav */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/guiders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Guiders</NavLink>
          <NavLink to="/tutors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Tutors</NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Resources</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Notifications</NavLink>

          {user ? (
            <div className="nav-user">
              <button
                type="button"
                className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="theme-toggle-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
              <NavLink to="/profile" className="nav-username" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: 'bold', marginRight: '10px' }}>
                👤 {user.name}
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin-dashboard" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Admin</NavLink>
              )}
              {user.role === 'guider' && (
                <NavLink to="/guider-dashboard" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)} style={{ marginRight: '10px' }}>Chat Dashboard</NavLink>
              )}
              <button className="btn btn-sm btn-accent" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth">
              <button
                type="button"
                className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="theme-toggle-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
              <NavLink to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Register</NavLink>
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
