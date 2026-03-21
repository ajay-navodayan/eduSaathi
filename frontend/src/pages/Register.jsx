import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero register-hero">
        <div className="auth-hero-bg">
          <div className="auth-hero-shape s1"></div>
          <div className="auth-hero-shape s2"></div>
        </div>
        <div className="auth-hero-content">
          <div className="auth-logo">🚀</div>
          <h2>Join EduSaathi</h2>
          <p>Start your success journey today</p>
          <div className="auth-features">
            <div className="auth-feature">🎓 Connect with Mentors</div>
            <div className="auth-feature">📚 Access Free Resources</div>
            <div className="auth-feature">🏫 Find Local Tutors</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of students on EduSaathi</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Free →'}
            </button>
          </form>

          <p className="auth-switch mt-2">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
