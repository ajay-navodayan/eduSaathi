import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './Auth.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { session, loading: authLoading } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If AuthContext is already done loading and has a session, we're good
    if (!authLoading && session) {
      setIsValidSession(true);
      setChecking(false);
    } else if (!authLoading && !session) {
      // If we're done loading and still no session, maybe wait a bit for hash parsing
      const timer = setTimeout(() => {
        setChecking(false);
      }, 5000); // 5s safety timeout
      return () => clearTimeout(timer);
    }
  }, [authLoading, session]);

  useEffect(() => {
    // Also listen for PASSWORD_RECOVERY to be fast
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Reset Recovery Event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError(t('reset_password.error_length'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('reset_password.error_match'));
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting password update...");
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      console.log("Password update successful:", data);

      setMessage(t('reset_password.success'));
      setNewPassword('');
      setConfirmPassword('');

      // Sign out is optional but good for security. Wrapping in try/catch to avoid blocking navigate.
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn("Sign out error after reset:", e);
        }
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }

  };

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-form-panel" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
          <div className="auth-form-card" style={{ textAlign: 'center' }}>
            <div className="spinner-container"><div className="spinner"></div></div>
            <p>{t('reset_password.verifying')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="auth-page">
        <div className="auth-form-panel" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
          <div className="auth-form-card" style={{ textAlign: 'center' }}>
            <h1 className="auth-title">{t('reset_password.invalid_title')}</h1>
            <p className="auth-subtitle">{t('reset_password.invalid_subtitle')}</p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {t('reset_password.request_new')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
        <div className="auth-form-card">
          <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img src="/sathsikho-logo.png" alt="SathSikho" className="auth-logo-img" style={{ width: '80px' }} />
          </div>
          <h1 className="auth-title">{t('reset_password.title')}</h1>
          <p className="auth-subtitle">{t('reset_password.subtitle')}</p>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('reset_password.new_pwd')}</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('reset_password.confirm_pwd')}</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? t('reset_password.updating_btn') : t('reset_password.update_btn')}
            </button>
          </form>

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">{t('reset_password.back_login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

