import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-mini">
          <Link to="/" className="footer-logo-mini">
            <span>🎓</span> EduSaathi
          </Link>
          
          <nav className="footer-nav-mini">
            <Link to="/guiders">Guiders</Link>
            <Link to="/tutors">Tutors</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/notifications">Updates</Link>
            <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="top-link">Top ↑</span>
          </nav>

          <div className="footer-meta-mini">
            &copy; {new Date().getFullYear()} EduSaathi. Made for India 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  );
}
