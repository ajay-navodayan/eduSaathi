import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (res.data.user.role === 'guider') {
        navigate('/guider-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || t('login.form.error_default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-bg">
          <div className="auth-hero-shape s1"></div>
          <div className="auth-hero-shape s2"></div>
        </div>
        <div className="auth-hero-content">
          <div className="auth-logo"><img src="/sathsikho-logo.png" alt="SathSikho" className="auth-logo-img" /></div>
          <h2>{t('login.hero.title')}</h2>
          <p>{t('login.hero.subtitle')}</p>
          <div className="auth-features">
            <div className="auth-feature">{t('login.hero.feature1')}</div>
            <div className="auth-feature">{t('login.hero.feature2')}</div>
            <div className="auth-feature">{t('login.hero.feature3')}</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h1 className="auth-title">{t('login.form.title')}</h1>
          <p className="auth-subtitle">{t('login.form.subtitle')}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t('login.form.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('login.form.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? t('login.form.btn_loading') : t('login.form.btn_default')}
            </button>
          </form>

          <div className="auth-divider"><span>{t('login.form.or')}</span></div>

          <div className="auth-hint">
            <p>Try admin: <strong>admin@edusaathi.com</strong> / <strong>admin123</strong></p>
          </div>

          <p className="auth-switch">
            {t('login.form.no_account')} <Link to="/register">{t('login.form.register_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
