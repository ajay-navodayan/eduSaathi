import { Link } from 'react-router-dom';
import './GuiderCard.css';

const CATEGORY_COLORS = {
  'IIT': '#1a73e8',
  'NEET': '#e53935',
  'UPSC': '#7b1fa2',
  'Army': '#2e7d32',
  'Railway': '#e65100',
  'Matric': '#00838f',
  'Intermediate': '#5c6bc0',
  'default': '#546e7a',
};

export default function GuiderCard({ guider }) {
  const color = CATEGORY_COLORS[guider.category] || CATEGORY_COLORS.default;

  return (
    <div className="guider-card card">
      <div className="guider-card-header" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)` }}>
        <img
          src={guider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=${color.replace('#', '')}&color=fff&size=200`}
          alt={guider.name}
          className="guider-avatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guider.name)}&background=1a73e8&color=fff&size=200`;
          }}
        />
        <span 
          className="guider-category-badge" 
          style={{ 
            background: guider.category ? `${color}20` : 'transparent', 
            color: guider.category ? color : 'transparent', 
            borderColor: guider.category ? `${color}40` : 'transparent',
            visibility: guider.category ? 'visible' : 'hidden'
          }}
        >
          {guider.category || '\u00A0'}
        </span>
      </div>

      <div className="guider-card-body">
        <h3 className="guider-name">{guider.name}</h3>
        <p className="guider-field">🎯 {guider.field}</p>
        {guider.designation && <p className="guider-designation">🏛️ {guider.designation}</p>}
        {guider.city && <p className="guider-city">📍 {guider.city}</p>}
      </div>

      <div className="guider-card-footer">
        <Link to={`/guiders/${guider.id}`} className="btn btn-primary btn-sm w-full">
          View Profile →
        </Link>
      </div>
    </div>
  );
}
