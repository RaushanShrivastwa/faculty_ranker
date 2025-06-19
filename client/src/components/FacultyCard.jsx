// src/components/FacultyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/FacultyCard.css'; // you can create this or fold styles into FacultyList.css

const FacultyCard = ({ faculty, isMobile }) => {
  // clamp ratings 0–5
  const normalize = v => Math.min(Math.max(v || 0, 0), 5);
  const widthPct = v => `${normalize(v) * 20}%`;

  return (
    <div className={`faculty-card ${isMobile ? 'mobile' : ''}`}>
      <div className="card-image">
        <img
          src={faculty.image_url || ''}
          alt={faculty.name}
          onError={e => { e.target.src = ''; }}
        />
      </div>

      <div className="card-content">
        <h3 className="card-title">{faculty.name}</h3>
        <p className="card-dept">
          {faculty.department || 'Department not specified'}
        </p>

        <div className="card-ratings">
          {['teaching_rating','attendance_rating','correction_rating'].map(key => {
            let label = key.replace('_rating','').replace(/^\w/,c=>c.toUpperCase());
            return (
              <div key={key} className="rating-bar">
                <span className="rating-label">{label}</span>
                <div className="rating-track">
                  <div
                    className={`rating-fill rating-${label.toLowerCase()}`}
                    style={{ width: widthPct(faculty[key]) }}
                  />
                </div>
                <span className="rating-score">{normalize(faculty[key])}/5</span>
              </div>
            );
          })}
        </div>

        <p className="card-bio">
          {faculty.bio || 'No bio available for this faculty member.'}
        </p>

        <Link to={`/faculty/${faculty._id}`} className="card-button">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default FacultyCard;
