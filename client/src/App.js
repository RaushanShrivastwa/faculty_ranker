import { Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Verify from './components/Verify';
import Admin from './components/Admin';
import AddFaculty from './pages/AddFaculty'
import FacultyList from './pages/FacultyList';
import AdminUserManagement from './components/AdminUserManagement';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/facultyList" element={<FacultyList />} />
      <Route path="/addFaculty" element={<AddFaculty/>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
    </Routes>
  );
}
export default App;
