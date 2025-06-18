import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 import context

const AddFaculty = () => {
  const [formData, setFormData] = useState({
    name: '',
    rating: '',
    image: '',
    correction_rating: '',
    attendance_rating: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // 👈 get user and auth flag

  // 🔐 Redirect to login if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/faculty', formData, {
        headers: {
          Authorization: `Bearer ${user.token}` // 👈 send token here
        }
      });
      console.log("Submitting form with token:", user?.token);
      navigate('/');
    } catch (error) {
      console.error('Error adding faculty:', error.response || error);
  if (error.response?.status === 409) {
    setError('Faculty already exists.');
  } else if (error.response?.status === 401) {
    setError('Unauthorized. Please log in again.');
  } else {
    setError(error.response?.data?.error || 'Something went wrong. Please try again.');
  }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Faculty</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-white">Name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="rating" className="block text-sm text-white">Initial Teaching Rating</label>
            <input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          <div>
  <label htmlFor="correction_rating" className="block text-sm text-white">Correction Rating</label>
  <input
    id="correction_rating"
    name="correction_rating"
    type="number"
    step="0.1"
    value={formData.correction_rating}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
  />
</div>

<div>
  <label htmlFor="attendance_rating" className="block text-sm text-white">Attendance Rating</label>
  <input
    id="attendance_rating"
    name="attendance_rating"
    type="number"
    step="0.1"
    value={formData.attendance_rating}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
  />
</div>

          <div>
            <label htmlFor="image" className="block text-sm text-white">Image URL</label>
            <input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Add Faculty
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFaculty;
