import React from 'react';
import { Link } from 'react-router-dom';

const NotAllowed = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-4xl font-bold text-red-700 mb-4">403 - Access Denied</h1>
      <p className="text-gray-700 mb-6">
        Only users with a <strong>@vitapstudent.ac.in</strong> email can sign up or log in.
      </p>
      <Link
        to="/login"
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Go Back to Login
      </Link>
    </div>
  );
};

export default NotAllowed;
