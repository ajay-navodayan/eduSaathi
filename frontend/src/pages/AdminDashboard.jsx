import { useState } from 'react';
import API from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Forms states
  const [tutorForm, setTutorForm] = useState({ name: '', subject: '', location: '', contact: '', experience: '' });
  const [guiderForm, setGuiderForm] = useState({ name: '', photo: '', field: '', designation: '', city: '', category: '', tenth_marks: '', twelfth_marks: '', achievements: '', whatsapp: '', email: '', phone: '', contact: '' });
  const [notifForm, setNotifForm] = useState({ title: '', description: '', link: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', category: '', drive_link: '', description: '' });

  const handleMsg = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e, endpoint, formData, setFormState, emptyFormState) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(endpoint, formData);
      handleMsg('success', 'Successfully added to database!');
      setFormState(emptyFormState);
    } catch (err) {
      handleMsg('error', err.response?.data?.error || 'Failed to add. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-hero">
        <div className="container text-center">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Add new Tutors, Guiders, Resources, and Notifications</p>
        </div>
      </div>

      <div className="container admin-container">
        {statusMsg.text && (
          <div className={`alert alert-${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="admin-tabs">
          <button className={activeTab === 'tutor' ? 'active' : ''} onClick={() => setActiveTab('tutor')}>👨‍🏫 Add Tutor</button>
          <button className={activeTab === 'guider' ? 'active' : ''} onClick={() => setActiveTab('guider')}>🎓 Add Guider</button>
          <button className={activeTab === 'resource' ? 'active' : ''} onClick={() => setActiveTab('resource')}>📚 Add Resource</button>
          <button className={activeTab === 'notification' ? 'active' : ''} onClick={() => setActiveTab('notification')}>📢 Add Notif</button>
        </div>

        <div className="admin-content card">
          
          {/* Add Tutor */}
          {activeTab === 'tutor' && (
            <form onSubmit={(e) => handleSubmit(e, '/tutors', tutorForm, setTutorForm, { name: '', subject: '', location: '', contact: '', experience: '' })}>
              <h3>Add Local Tutor</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Tutor Name" value={tutorForm.name} onChange={e => setTutorForm({...tutorForm, name: e.target.value})} />
                <input className="form-input" placeholder="Subject" value={tutorForm.subject} onChange={e => setTutorForm({...tutorForm, subject: e.target.value})} />
                <input className="form-input" placeholder="Location/City" value={tutorForm.location} onChange={e => setTutorForm({...tutorForm, location: e.target.value})} />
                <input className="form-input" placeholder="Phone/WhatsApp" value={tutorForm.contact} onChange={e => setTutorForm({...tutorForm, contact: e.target.value})} />
                <input className="form-input" placeholder="Experience (e.g. 5 Years)" value={tutorForm.experience} onChange={e => setTutorForm({...tutorForm, experience: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Tutor</button>
            </form>
          )}

          {/* Add Notification */}
          {activeTab === 'notification' && (
            <form onSubmit={(e) => handleSubmit(e, '/notifications', notifForm, setNotifForm, { title: '', description: '', link: '' })}>
              <h3>Add Notification</h3>
              <div className="flex-col gap-2">
                <input required className="form-input" placeholder="Notification Title" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} />
                <textarea className="form-textarea" placeholder="Description/Message" value={notifForm.description} onChange={e => setNotifForm({...notifForm, description: e.target.value})}></textarea>
                <input className="form-input" placeholder="Link (Optional, e.g. https://nta.ac.in)" value={notifForm.link} onChange={e => setNotifForm({...notifForm, link: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Notification</button>
            </form>
          )}

          {/* Add Resource */}
          {activeTab === 'resource' && (
            <form onSubmit={(e) => handleSubmit(e, '/resources', resourceForm, setResourceForm, { title: '', category: '', drive_link: '', description: '' })}>
              <h3>Add Study Resource</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Resource Title" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
                <select className="form-select" value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="IIT">IIT</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Railway">Railway</option>
                  <option value="Army">Army</option>
                  <option value="Matric">Matric</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
                <input required className="form-input" placeholder="Google Drive Link" value={resourceForm.drive_link} onChange={e => setResourceForm({...resourceForm, drive_link: e.target.value})} />
              </div>
              <textarea className="form-textarea mt-1" placeholder="Description" value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})}></textarea>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Resource</button>
            </form>
          )}

          {/* Add Guider */}
          {activeTab === 'guider' && (
            <form onSubmit={(e) => handleSubmit(e, '/guiders', guiderForm, setGuiderForm, { name: '', photo: '', field: '', designation: '', city: '', category: '', tenth_marks: '', twelfth_marks: '', achievements: '', whatsapp: '', email: '', phone: '', contact: '' })}>
              <h3>Add Guider (Mentor)</h3>
              <div className="grid-2">
                <input required className="form-input" placeholder="Full Name" value={guiderForm.name} onChange={e => setGuiderForm({...guiderForm, name: e.target.value})} />
                <select className="form-select" value={guiderForm.category} onChange={e => setGuiderForm({...guiderForm, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="IIT">IIT</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Railway">Railway</option>
                  <option value="Army">Army</option>
                </select>
                <input className="form-input" placeholder="Field (e.g. UPSC CSE)" value={guiderForm.field} onChange={e => setGuiderForm({...guiderForm, field: e.target.value})} />
                <input className="form-input" placeholder="Designation (e.g. IAS Officer)" value={guiderForm.designation} onChange={e => setGuiderForm({...guiderForm, designation: e.target.value})} />
                <input className="form-input" placeholder="City" value={guiderForm.city} onChange={e => setGuiderForm({...guiderForm, city: e.target.value})} />
                <input className="form-input" type="email" placeholder="Email" value={guiderForm.email} onChange={e => setGuiderForm({...guiderForm, email: e.target.value})} />
                <input className="form-input" placeholder="WhatsApp Number" value={guiderForm.whatsapp} onChange={e => setGuiderForm({...guiderForm, whatsapp: e.target.value})} />
                <input className="form-input" placeholder="Profile Photo URL (Optional)" value={guiderForm.photo} onChange={e => setGuiderForm({...guiderForm, photo: e.target.value})} />
                <input className="form-input" placeholder="10th Marks" value={guiderForm.tenth_marks} onChange={e => setGuiderForm({...guiderForm, tenth_marks: e.target.value})} />
                <input className="form-input" placeholder="12th Marks" value={guiderForm.twelfth_marks} onChange={e => setGuiderForm({...guiderForm, twelfth_marks: e.target.value})} />
              </div>
              <textarea className="form-textarea mt-1" placeholder="Achievements (comma separated)" value={guiderForm.achievements} onChange={e => setGuiderForm({...guiderForm, achievements: e.target.value})}></textarea>
              <button disabled={loading} type="submit" className="btn btn-primary mt-2">Submit Guider</button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
