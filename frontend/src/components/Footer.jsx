import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid-compact">
          {/* Logo (circular) */}
          <div className="footer-brand-compact">
            <div className="footer-logo-wide">
              <img src="/sathsikho-logo.png" alt="SathSikho" />
            </div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
          </div>

          {/* Contact & Support */}
          <div className="footer-col" style={{ minWidth: '350px' }}>
            <h4>{t('footer.contact_support')}</h4>
            
            <div className="footer-contact-flex">
              <ul>
              <li>
                <a href="mailto:sathsikho@gmail.com">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#EA4335" />
                    <path d="M22 6L12 13 2 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  sathsikho@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/nikhil-raj-soni?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06s2.06.92 2.06 2.06c0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.56c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.13 1.44-2.13 2.94v5.65H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                  </svg>
                  Nikhil Raj Soni
                </a>
              </li>
              <li>
                <a href="tel:+918873328020">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +91-8873328020
                </a>
              </li>
              <li>
                <a href="https://wa.me/917857026413" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.03 2.5C6.78 2.5 2.5 6.78 2.5 12.03c0 1.63.43 3.19 1.17 4.56L2.5 21l4.47-1.17a9.54 9.54 0 0 0 5.06 1.44h.01c5.25 0 9.53-4.28 9.53-9.53s-4.28-9.53-9.53-9.53zm0 17.5c-1.4 0-2.8-.36-4.04-1.04l-.28-.16-3.01.79.8-2.94-.18-.28A7.95 7.95 0 0 1 4.09 12c0-4.38 3.56-7.94 7.94-7.94 4.38 0 7.94 3.56 7.94 7.94 0 4.38-3.56 7.94-7.94 7.94z" />
                    <path fill="#fff" d="M16.42 14.6c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11s-.57.71-.7.86c-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.66-.59-1.11-1.32-1.24-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.25.33-.38.11-.13.15-.22.22-.38.07-.15.04-.29-.02-.4-.05-.11-.5-1.21-.69-1.66-.18-.43-.36-.38-.5-.38h-.42c-.15 0-.38.05-.59.29-.21.23-.83.81-.83 1.98s.85 2.3 1.01 2.5 1.7 2.6 4.12 3.65c.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.09.46-.07 1.41-.58 1.61-1.13.2-.56.2-.104.14-.113-.06-.11-.22-.18-.44-.29z" />
                  </svg>
                  7857026413
                </a>
              </li>
            </ul>

            <div className="footer-contact-person footer-contact-person-right">
              <div className="person-avatar large-avatar">
                <img src="/admin-avatar.jpg" alt="Nikhil Raj Soni" />
              </div>
              <div className="person-info">
                <span className="person-name">Nikhil Raj Soni</span>
                <span className="person-role">{t('footer.admin_role')}</span>
              </div>
            </div>
            
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights_reserved', { year: new Date().getFullYear() })}</p>
          <p>{t('footer.made_with_love')}</p>
        </div>
      </div>
    </footer>
  );
}
