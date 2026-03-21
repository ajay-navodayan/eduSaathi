import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>🎓</span>
              <span>Edu<span className="logo-accent">Saathi</span></span>
            </div>
            <p>Connecting village students with real mentors. Your success story starts here.</p>
            <div className="footer-socials">
              <a href="#" aria-label="WhatsApp">📱</a>
              <a href="#" aria-label="Email">✉️</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/guiders">Guiders</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/resources">Resources</Link></li>
              <li><Link to="/tutors">Local Tutors</Link></li>
            </ul>
          </div>

          {/* Exams */}
          <div className="footer-col">
            <h4>Exam Categories</h4>
            <ul>
              <li><Link to="/guiders?category=IIT">IIT JEE</Link></li>
              <li><Link to="/guiders?category=NEET">NEET</Link></li>
              <li><Link to="/guiders?category=UPSC">UPSC</Link></li>
              <li><Link to="/guiders?category=Army">Indian Army</Link></li>
              <li><Link to="/guiders?category=Railway">Railway</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact & Support</h4>
            <ul>
              <li>📧 support@edusaathi.in</li>
              <li>📞 +91-9800000000</li>
              <li>💬 WhatsApp Support</li>
            </ul>
            <div className="footer-auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EduSaathi. All rights reserved.</p>
          <p>Made with ❤️ for village students of India</p>
        </div>
      </div>
    </footer>
  );
}
