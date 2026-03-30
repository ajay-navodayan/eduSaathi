import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      if (!data || !data.user || !data.user.id) {
        throw new Error('No user data returned from authentication. Please verify your email.');
      }

      // Manually fetch the user's role here so we don't depend on Context timing
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id_auth', data.user.id)
        .maybeSingle();

      const redirectRole = profileError || !profile ? 'student' : profile.role;

      // Perform a hard redirect to forcefully load the dashboard.
      // This wipes out any React state "hanging" bugs and initializes the session securely.
      if (redirectRole === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (redirectRole === 'guider') {
        window.location.href = '/guider-dashboard';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || t('login.form.error_default') || String(err);
      setError(msg);
      alert('LOGIN HALTED: ' + msg); // Aggressive user-facing debug
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

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Forgot Password?
            </Link>
          </div>

          <div className="auth-divider"><span>{t('login.form.or')}</span></div>

          <p className="auth-switch">
            {t('login.form.no_account')} <Link to="/register">{t('login.form.register_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
