import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
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
  const { t } = useTranslation();
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
      setError(t('register.form.error_basic_details'));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('register.form.error_passwords_match'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('register.form.error_password_length'));
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError(t('register.form.error_passwords_match'));
    }
    if (form.password.length < 6) {
      return setError(t('register.form.error_password_length'));
    }
    setLoading(true);

    try {
      // 1. Create User in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            role: form.role,
          }
        }
      });

      if (signUpError) throw signUpError;

      const userId = data.user.id;

      // 2. If Guider, insert into guiders table as well
      if (form.role === 'guider') {
        const { error: guiderError } = await supabase
          .from('guiders')
          .insert({
            ...mentorForm,
            name: form.name,
            email: form.email,
          });
        
        if (guiderError) throw guiderError;
      }

      setSuccess(form.role === 'guider' ? t('register.form.success_mentor') : t('register.form.success_student'));
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || t('register.form.error_default'));
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
          <div className="auth-logo"><img src="/sathsikho-logo.png" alt="SathSikho" className="auth-logo-img" /></div>
          <h2>{t('register.hero.title')}</h2>
          <p>{t('register.hero.subtitle')}</p>
          <div className="auth-features">
            <div className="auth-feature">{t('register.hero.feature1')}</div>
            <div className="auth-feature">{t('register.hero.feature2')}</div>
            <div className="auth-feature">{t('register.hero.feature3')}</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h1 className="auth-title">{t('register.form.title')}</h1>
          <p className="auth-subtitle">{t('register.form.subtitle')}</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">{t('register.form.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder={t('register.form.name_ph')}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">{t('register.form.email')}</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                className="form-input"
                placeholder={t('register.form.email_ph')}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">{t('register.form.password')}</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                className="form-input"
                placeholder={t('register.form.password_ph')}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">{t('register.form.confirm')}</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                className="form-input"
                placeholder={t('register.form.confirm_ph')}
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group register-role-group">
              <label className="form-label">{t('register.form.register_as')}</label>
              <div className="register-role-options">
                <label className="register-role-option">
                  <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={handleChange} />
                  {t('register.form.role_student')}
                </label>
                <label className="register-role-option">
                  <input type="radio" name="role" value="guider" checked={form.role === 'guider'} onChange={handleChange} />
                  {t('register.form.role_guider')}
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
                  {t('register.form.continue_btn')}
                </button>
              ) : (
                <>
                  <div className="mentor-step-header">
                    <h3>{t('register.form.mentor_title')}</h3>
                    <p>{t('register.form.mentor_subtitle')}</p>
                  </div>

                  <div className="mentor-register-grid">
                    <div className="mentor-photo-wrap">
                      <PhotoUpload
                        value={mentorForm.photo}
                        onChange={(url) => setMentorForm({ ...mentorForm, photo: url })}
                        name={form.name}
                      />
                    </div>

                    <input type="text" name="field" className="form-input" placeholder={t('register.form.field_ph')} value={mentorForm.field} onChange={handleMentorChange} required />
                    <input type="text" name="designation" className="form-input" placeholder={t('register.form.designation_ph')} value={mentorForm.designation} onChange={handleMentorChange} />
                    <input type="text" name="city" className="form-input" placeholder={t('register.form.city_ph')} value={mentorForm.city} onChange={handleMentorChange} />
                    <input type="text" name="category" className="form-input" placeholder={t('register.form.category_ph')} value={mentorForm.category} onChange={handleMentorChange} />
                    <input type="text" name="tenth_marks" className="form-input" placeholder={t('register.form.tenth_marks_ph')} value={mentorForm.tenth_marks} onChange={handleMentorChange} />
                    <input type="text" name="tenth_board" className="form-input" placeholder={t('register.form.tenth_board_ph')} value={mentorForm.tenth_board} onChange={handleMentorChange} />
                    <input type="text" name="twelfth_marks" className="form-input" placeholder={t('register.form.twelfth_marks_ph')} value={mentorForm.twelfth_marks} onChange={handleMentorChange} />
                    <input type="text" name="twelfth_board" className="form-input" placeholder={t('register.form.twelfth_board_ph')} value={mentorForm.twelfth_board} onChange={handleMentorChange} />
                    <input type="text" name="linkedin" className="form-input" placeholder={t('register.form.linkedin_ph')} value={mentorForm.linkedin} onChange={handleMentorChange} />
                    <input type="text" name="phone" className="form-input" placeholder={t('register.form.phone_ph')} value={mentorForm.phone} onChange={handleMentorChange} />
                    <input type="text" name="whatsapp" className="form-input" placeholder={t('register.form.whatsapp_ph')} value={mentorForm.whatsapp} onChange={handleMentorChange} />
                    <textarea name="achievements" className="form-input mentor-achievements" placeholder={t('register.form.achievements_ph')} value={mentorForm.achievements} onChange={handleMentorChange} />

                    <div className="mentor-type-group">
                      <label className="form-label">{t('register.form.mentor_type')}</label>
                      <div className="register-role-options">
                        <label className="register-role-option">
                          <input type="radio" name="mentor_type" value="mentor_only" checked={mentorForm.mentor_type === 'mentor_only'} onChange={handleMentorChange} />
                          {t('register.form.mentor_only')}
                        </label>
                        <label className="register-role-option">
                          <input type="radio" name="mentor_type" value="tutor_mentor" checked={mentorForm.mentor_type === 'tutor_mentor'} onChange={handleMentorChange} />
                          {t('register.form.tutor_mentor')}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mentor-register-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={loading}>{t('register.form.back_btn')}</button>
                    <button
                      type="submit"
                      className="btn btn-accent btn-lg"
                      disabled={loading}
                    >
                      {loading ? t('register.form.submit_mentor_loading') : t('register.form.submit_mentor_btn')}
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
                {loading ? t('register.form.register_loading') : t('register.form.register_btn')}
              </button>
            )}
          </form>

          <p className="auth-switch mt-2">
            {t('register.form.already_have_account')} <Link to="/login">{t('register.form.login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
