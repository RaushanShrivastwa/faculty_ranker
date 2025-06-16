import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f44336', '#4CAF50']; // Red = banned, Green = active
const COLORS2 = ['#00C49F', '#FF8042']; // Blue = student, Orange = admin

const UserSearch = ({ query, setQuery, darkMode }) => (
  <input
    type="text"
    placeholder="Search by username or email"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    style={{
      padding: '10px',
      width: '100%',
      borderRadius: '8px',
      border: '1px solid #ccc',
      marginBottom: '20px',
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#000',
    }}
  />
);

const UserBanStatusGraph = ({ users }) => {
  const banned = users.filter(u => u.banned).length;
  const active = users.length - banned;
  const data = [
    { name: 'Banned', value: banned },
    { name: 'Active', value: active },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '400px', height: 300 }}>
      <h4 style={{ textAlign: 'center' }}>Ban Status</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, idx) => (
              <Cell key={`ban-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const UserStatsGraph = ({ users }) => {
  const studentCount = users.filter(u => u.role === 'user').length;
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const data = [
    { name: 'Users', value: studentCount },
    { name: 'Admins', value: adminCount },
  ];

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', marginBottom: '20px' }}>
      <h3 style={{ textAlign: 'center' }}>User Roles Overview</h3>
      <PieChart width={300} height={300}>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((_, idx) => (
            <Cell key={`role-${idx}`} fill={COLORS2[idx % COLORS2.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/users', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setUsers)
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const toggleDarkMode = () => setDarkMode(dm => !dm);

  const downloadCSV = () => {
    const headers = ['Username', 'Email', 'Role', 'Banned'];
    const rows = users.map(u => [u.username, u.email, u.role, u.banned ? 'Yes' : 'No'].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleBanStatus = async (_id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/ban/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ banned: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updated = await res.json();
      setUsers(us => us.map(u => u._id === updated._id ? updated : u));
    } catch (err) {
      console.error('Failed to toggle ban status:', err);
    }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial',
      backgroundColor: darkMode ? '#121212' : '#fff',
      color: darkMode ? '#eee' : '#000',
      minHeight: '100vh',
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
        color: darkMode ? '#fff' : '#000',
      }}>
        Admin Panel – Manage Users
      </h2>

      <button
        onClick={toggleDarkMode}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          backgroundColor: darkMode ? '#ccc' : '#333',
          color: darkMode ? '#000' : '#fff',
          border: 'none',
        }}
      >
        {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
      </button>

      <UserSearch query={query} setQuery={setQuery} darkMode={darkMode} />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '40px',
        margin: '20px auto',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '1000px',
      }}>
        <UserStatsGraph users={users} />
        <UserBanStatusGraph users={users} />
      </div>

      <button
        onClick={downloadCSV}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Download CSV
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(user => (
          <div
            key={user._id}
            style={{
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '10px',
              backgroundColor: user.banned
                ? (darkMode ? '#5c1a1a' : '#ffe6e6')
                : (darkMode ? '#1a5c2e' : '#e6ffe6'),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{user.username}</strong><br/>
              <small>{user.email}</small><br/>
              Status:{' '}
              <b style={{ color: user.banned ? 'red' : 'green' }}>
                {user.banned ? 'Banned' : 'Active'}
              </b>
            </div>
            <button
              onClick={() => toggleBanStatus(user._id, user.banned)}
              style={{
                padding: '8px 16px',
                backgroundColor: user.banned ? '#4CAF50' : '#f44336',
                color: 'white',
                border: darkMode ? '1px solid #fff' : 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {user.banned ? 'Unban' : 'Ban'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUserManagement;