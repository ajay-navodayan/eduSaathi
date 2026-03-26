import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import PhotoUpload from '../components/PhotoUpload';
import './Auth.css';

const initialMentorForm = {
  photo: '',
  field: '',
  designation: '',
  city: '',
  category: '',
  tenth_marks: '',
  tenth_board: '',
  twelfth_marks: '',
  twelfth_board: '',
  achievements: '',
  linkedin: '',
  whatsapp: '',
  phone: '',
  mentor_type: 'mentor_only'
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [mentorForm, setMentorForm] = useState(initialMentorForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'role' && value !== 'guider') {
      setStep(1);
      setMentorForm(initialMentorForm);
    }
  };
  const handleMentorChange = (e) => setMentorForm({ ...mentorForm, [e.target.name]: e.target.value });

  const goToStepTwo = () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError('Please fill all basic details before continuing.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

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
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'guider' ? mentorForm : {})
      });
      setSuccess(form.role === 'guider' ? 'Mentor profile submitted! Redirecting to login...' : 'Account created! Redirecting to login...');
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

            <div className="form-group register-role-group">
              <label className="form-label">I am registering as a:</label>
              <div className="register-role-options">
                <label className="register-role-option">
                  <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={handleChange} />
                  Student
                </label>
                <label className="register-role-option">
                  <input type="radio" name="role" value="guider" checked={form.role === 'guider'} onChange={handleChange} />
                  Guider/Mentor
                </label>
              </div>
            </div>

            {form.role === 'guider' ? (
              step === 1 ? (
                <button
                  type="button"
                  className="btn btn-accent btn-lg w-full"
                  onClick={goToStepTwo}
                >
                  Continue to Mentor Form →
                </button>
              ) : (
                <>
                  <div className="mentor-step-header">
                    <h3>Mentor Profile Details</h3>
                    <p>Add your professional details exactly as they should appear publicly.</p>
                  </div>

                  <div className="mentor-register-grid">
                    <div className="mentor-photo-wrap">
                      <PhotoUpload
                        value={mentorForm.photo}
                        onChange={(url) => setMentorForm({ ...mentorForm, photo: url })}
                        name={form.name}
                      />
                    </div>

                    <input type="text" name="field" className="form-input" placeholder="Field (e.g. UPSC, JEE)" value={mentorForm.field} onChange={handleMentorChange} required />
                    <input type="text" name="designation" className="form-input" placeholder="Designation" value={mentorForm.designation} onChange={handleMentorChange} />
                    <input type="text" name="city" className="form-input" placeholder="Current City" value={mentorForm.city} onChange={handleMentorChange} />
                    <input type="text" name="category" className="form-input" placeholder="Category (e.g. UPSC/NEET)" value={mentorForm.category} onChange={handleMentorChange} />
                    <input type="text" name="tenth_marks" className="form-input" placeholder="10th Percentage" value={mentorForm.tenth_marks} onChange={handleMentorChange} />
                    <input type="text" name="tenth_board" className="form-input" placeholder="10th Board" value={mentorForm.tenth_board} onChange={handleMentorChange} />
                    <input type="text" name="twelfth_marks" className="form-input" placeholder="12th Percentage" value={mentorForm.twelfth_marks} onChange={handleMentorChange} />
                    <input type="text" name="twelfth_board" className="form-input" placeholder="12th Board" value={mentorForm.twelfth_board} onChange={handleMentorChange} />
                    <input type="text" name="linkedin" className="form-input" placeholder="LinkedIn URL" value={mentorForm.linkedin} onChange={handleMentorChange} />
                    <input type="text" name="phone" className="form-input" placeholder="Phone Number" value={mentorForm.phone} onChange={handleMentorChange} />
                    <input type="text" name="whatsapp" className="form-input" placeholder="WhatsApp Number" value={mentorForm.whatsapp} onChange={handleMentorChange} />
                    <textarea name="achievements" className="form-input mentor-achievements" placeholder="Achievements (comma separated)" value={mentorForm.achievements} onChange={handleMentorChange} />

                    <div className="mentor-type-group">
                      <label className="form-label">Mentor Type</label>
                      <div className="register-role-options">
                        <label className="register-role-option">
                          <input type="radio" name="mentor_type" value="mentor_only" checked={mentorForm.mentor_type === 'mentor_only'} onChange={handleMentorChange} />
                          Mentor Only
                        </label>
                        <label className="register-role-option">
                          <input type="radio" name="mentor_type" value="tutor_mentor" checked={mentorForm.mentor_type === 'tutor_mentor'} onChange={handleMentorChange} />
                          Tutor + Mentor
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mentor-register-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={loading}>← Back</button>
                    <button
                      type="submit"
                      className="btn btn-accent btn-lg"
                      disabled={loading}
                    >
                      {loading ? 'Submitting Mentor Profile...' : 'Submit Mentor Registration →'}
                    </button>
                  </div>
                </>
              )
            ) : (
              <button
                type="submit"
                className="btn btn-accent btn-lg w-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register Free →'}
              </button>
            )}
          </form>

          <p className="auth-switch mt-2">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
