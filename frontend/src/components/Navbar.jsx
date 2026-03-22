import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <span className="logo-icon">🎓</span>
          <span className="logo-text">
            Edu<span className="logo-accent">Saathi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/guiders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Guiders</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Notifications</NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Resources</NavLink>
          <NavLink to="/tutors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Tutors</NavLink>

          {user ? (
            <div className="nav-user">
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
