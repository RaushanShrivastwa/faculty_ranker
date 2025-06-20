// src/components/FacultyCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FacultyCard.css';

const FacultyCard = ({ faculty, isMobile }) => {
  const [imageError, setImageError] = useState(false);

  const normalize = v => Math.min(Math.max(v || 0, 0), 5);
  const widthPct = v => `${normalize(v) * 20}%`;

  return (
    <div className={`faculty-card ${isMobile ? 'mobile' : ''}`}>
      <div className="card-image">
        {faculty.image_url && !imageError ? (
          <img
            src={faculty.image_url}
            alt={faculty.name || 'Faculty'}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            Image to be added soon
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title">{faculty.name}</h3>
        <p className="card-dept">
          {faculty.department || 'Department not specified'}
        </p>

        <div className="card-ratings">
          {['teaching_rating', 'attendance_rating', 'correction_rating'].map(key => {
            const label = key.replace('_rating', '').replace(/^\w/, c => c.toUpperCase());
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
