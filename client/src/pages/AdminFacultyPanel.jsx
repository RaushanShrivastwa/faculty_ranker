// src/components/AdminFacultyPanel.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminFacultyPanel = () => {
  const [faculties, setFaculties] = useState([]);
  const [search, setSearch]       = useState('');
  const [filtered, setFiltered]   = useState([]);
  const { user }                  = useAuth();

  useEffect(() => {
    axios.get('/api/faculty/unverified', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
      setFaculties(res.data);
      setFiltered(res.data);
    })
    .catch(console.error);
  }, [user]);

  const handleVerify = (id) => {
    axios.put(`/api/faculty/verify/${id}`, {}, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(() => {
      const updated = faculties.filter(f => f._id !== id);
      setFaculties(updated);
      setFiltered(updated);
    });
  };

  const handleDelete = (id) => {
    axios.delete(`/api/faculty/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(() => {
      const updated = faculties.filter(f => f._id !== id);
      setFaculties(updated);
      setFiltered(updated);
    });
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearch(q);
    setFiltered(faculties.filter(f => f.name.toLowerCase().includes(q)));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Unverified Faculty
      </h2>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleSearch}
        className="
          w-full max-w-md mb-6
          px-4 py-2
          bg-gray-800 text-white
          border border-gray-700
          rounded
          focus:outline-none focus:ring-2 focus:ring-purple-500
        "
      />

      <div className="space-y-4">
        {filtered.map(fac => (
          <div
            key={fac._id}
            className="
              p-4
              bg-gray-800
              border border-gray-700
              rounded-lg
              shadow-md
            "
          >
            <div className="flex flex-col md:flex-row md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {fac.name}
                </h3>
                {fac.image_url && (
                  <img
                    src={fac.image_url}
                    alt={fac.name}
                    className="w-24 h-24 mt-2 object-cover rounded"
                  />
                )}
                <p className="mt-2 text-gray-300">
                  Teaching: <span className="font-medium">{fac.teaching_rating}</span>,{' '}
                  Correction: <span className="font-medium">{fac.correction_rating}</span>,{' '}
                  Attendance: <span className="font-medium">{fac.attendance_rating}</span>
                </p>
                {fac.addedBy && (
                  <p className="mt-1 text-gray-400 text-sm">
                    Added by: <span className="font-medium">{fac.addedBy.username}</span>{' '}
                    (<span className="italic">{fac.addedBy.email}</span>)
                  </p>
                )}
              </div>

              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  onClick={() => handleVerify(fac._id)}
                  className="
                    px-4 py-2
                    bg-green-600 hover:bg-green-700
                    text-white font-medium
                    rounded
                    transition
                  "
                >
                  Verify
                </button>
                <button
                  onClick={() => handleDelete(fac._id)}
                  className="
                    px-4 py-2
                    bg-red-600 hover:bg-red-700
                    text-white font-medium
                    rounded
                    transition
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-gray-500">
          No unverified faculty found.
        </p>
      )}
    </div>
  );
};

export default AdminFacultyPanel;
