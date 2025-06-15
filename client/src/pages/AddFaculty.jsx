import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddFaculty = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    bio: '',
    rating: '',
    image: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/faculties', formData);
      navigate('/');
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Faculty</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields here */}
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