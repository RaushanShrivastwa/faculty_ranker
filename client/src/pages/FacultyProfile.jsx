import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileNavbar from '../components/ProfileNavbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function FacultyProfile() {
  const { id: facultyId } = useParams(); // ✅ Matches :id from the route
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL_FACULTY;
  const [faculty, setFaculty] = useState(null);
  const [hasRated, setHasRated] = useState(null);
  const [ratings, setRatings] = useState({
    teaching: 0,
    correction: 0,
    attendance: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      if (!facultyId) {
        setError('Faculty ID not found.');
        return;
      }

      try {
        const { data: fac } = await axios.get(`${API_URL}/${facultyId}`);
        setFaculty(fac);

        if (!isAuthenticated) {
          setHasRated(false);
        } else {
          const token = localStorage.getItem('token');
          const { data: chk } = await axios.get(`${API_URL}/hasRated/${facultyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setHasRated(!!chk.hasRated);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Network error');
      }
    };

    fetchStatus();
  }, [facultyId, isAuthenticated, API_URL]);

  const handleStarClick = (cat, val) => {
    if (!isAuthenticated) return navigate('/login');
    if (hasRated) return;
    setRatings((prev) => ({ ...prev, [cat]: val }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (hasRated) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/rate/${facultyId}`, ratings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasRated(true);
      const { data: fac } = await axios.get(`${API_URL}/${facultyId}`);
      setFaculty(fac);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  const renderStars = (cat) =>
    [1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        onClick={() => handleStarClick(cat, i)}
        className={`text-3xl ${ratings[cat] >= i ? 'text-yellow-400' : 'text-gray-600'} ${
          hasRated ? 'cursor-not-allowed' : 'hover:text-yellow-300'
        }`}
      >
        ★
      </button>
    ));

  if (error) {
    return (
      <div className="pt-20 text-center text-red-400">
        {error}
        <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-700 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (faculty === null || hasRated === null) {
    return (
      <div className="pt-20 flex justify-center text-white text-xl">
        Loading…
      </div>
    );
  }

  const {
    teaching_rating = 0,
    num_teaching_ratings = 0,
    correction_rating = 0,
    num_correction_ratings = 0,
    attendance_rating = 0,
    num_attendance_ratings = 0,
    name,
    department,
    image_url,
  } = faculty;

  return (
    <div className="pt-14 pb-10 min-h-screen bg-gray-900 text-white">
      <ProfileNavbar />
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 mt-6">
        <div className="flex items-center space-x-6 mb-6">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-700"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center text-xs text-gray-400 border-2 border-gray-700 rounded-lg bg-gray-700">
              Image to be added soon
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-gray-400 text-lg">{department}</p>
          </div>
        </div>

        <div className="mb-6 space-y-2 text-gray-300 text-lg">
          <p>
            <strong>Teaching:</strong> {teaching_rating.toFixed(2)} ⭐ ({num_teaching_ratings})
          </p>
          <p>
            <strong>Correction:</strong> {correction_rating.toFixed(2)} ⭐ ({num_correction_ratings})
          </p>
          <p>
            <strong>Attendance:</strong> {attendance_rating.toFixed(2)} ⭐ ({num_attendance_ratings})
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {['teaching', 'correction', 'attendance'].map((cat) => (
            <div key={cat} className="flex items-center space-x-4">
              <span className="w-28 capitalize text-gray-200 text-lg">{cat}:</span>
              <div className="flex space-x-1">{renderStars(cat)}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={hasRated}
          className={`w-full py-2 rounded-md font-semibold text-xl transition ${
            hasRated ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {hasRated ? 'Already Rated' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
}
