import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const COLORS = ['#f44336', '#4CAF50']; // Red = banned, Green = active
const COLORS2 = ['#00C49F', '#FF8042']; // Blue = student, Orange = admin
//this is search bar component
const UserSearch = ({ query, setQuery }) => {
  return (
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
        marginBottom: '20px'
      }}
    />
  );
};

//Ban status graph component
const UserBanStatusGraph = ({ users }) => {
  const banned = users.filter(user => user.banned).length;
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
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

//User vs admin graph component
const UserStatsGraph = ({ users }) => {
  const studentCount = users.filter(u => u.role === 'student').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const data = [
    { name: 'Students', value: studentCount },
    { name: 'Admins', value: adminCount }
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
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

// Main Admin User Management component
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const downloadCSV = () => {
    const headers = ['Username', 'Email', 'Role', 'Banned'];
    const csvRows = [
      headers.join(','),
      ...users.map(user =>
        [user.username, user.email, user.role, user.banned ? 'Yes' : 'No'].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_data.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetch(`/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const toggleBanStatus = async (username, currentStatus) => {
    try {
      const response = await fetch(`/api/users/ban/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.username === updatedUser.username ? updatedUser : user
        )
      );
    } catch (err) {
      console.error('Failed to toggle ban status:', err);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial',
      backgroundColor: darkMode ? '#121212' : '#fff',
      color: darkMode ? '#eee' : '#000',
      minHeight: '100vh'
    }}>
      <h2>Admin Panel - Manage Users</h2>

      <button
        onClick={toggleDarkMode}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          backgroundColor: darkMode ? '#ccc' : '#333',
          color: darkMode ? '#000' : '#fff',
          border: 'none'
        }}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Search Bar */}
      <UserSearch query={query} setQuery={setQuery} />

      {/* Graphs */}
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

      {/* Download CSV Button */}
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
        }}>
        Download CSV
      </button>

      {/* User List with Ban/Unban Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredUsers.map((user, index) => (
          <div key={user.username || index} style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: user.banned
              ? (darkMode ? '#5c1a1a' : '#ffe6e6')
              : (darkMode ? '#1a5c2e' : '#e6ffe6'),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>{user.username}</strong> <br />
              <small>{user.email}</small> <br />
              Status: <b style={{ color: user.banned ? 'red' : 'green' }}>
                {user.banned ? 'Banned' : 'Active'}
              </b>
            </div>
            <button
              onClick={() => toggleBanStatus(user.username, user.banned)}
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
