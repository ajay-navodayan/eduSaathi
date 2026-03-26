import { useState, useRef } from 'react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * PhotoUpload — uploads a photo to Cloudinary (unsigned) and returns the URL.
 * Props:
 *   value    {string}   current photo URL (to show preview)
 *   onChange {function} called with new Cloudinary URL after successful upload
 *   name     {string}   person's name (used for fallback avatar)
 */
export default function PhotoUpload({ value, onChange, name = '' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validations
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'edusaathi/mentors');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody?.error?.message || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.secure_url);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // reset file input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1a73e8&color=fff&size=150`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* Preview */}
      <div style={{
        width: '120px', height: '120px', borderRadius: '50%',
        overflow: 'hidden', border: '3px solid #1a73e8',
        backgroundColor: '#f0f0f0', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {uploading ? (
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#555' }}>
            <div style={{
              width: '36px', height: '36px', border: '4px solid #e0e0e0',
              borderTop: '4px solid #1a73e8', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 6px'
            }} />
            Uploading…
          </div>
        ) : (
          <img
            src={value || avatarFallback}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = avatarFallback; }}
          />
        )}
      </div>

      {/* Upload button */}
      <label style={{
        display: 'inline-block', padding: '8px 18px',
        backgroundColor: uploading ? '#ccc' : '#1a73e8',
        color: 'white', borderRadius: '6px', cursor: uploading ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem', fontWeight: '600', transition: 'background 0.2s'
      }}>
        {uploading ? 'Uploading…' : value ? '📷 Change Photo' : '📷 Upload Photo'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>

      {value && !uploading && (
        <p style={{ fontSize: '0.75rem', color: '#34a853', margin: 0 }}>✅ Photo uploaded</p>
      )}

      {error && (
        <p style={{ fontSize: '0.8rem', color: '#ea4335', margin: 0, textAlign: 'center' }}>{error}</p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
