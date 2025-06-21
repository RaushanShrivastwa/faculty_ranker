// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 ${isScrolled ? 'navbar-scrolled' : 'navbar-default'}`}
    >
      <div className="nav-container flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="logo"
        >
          <Link to="/">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
              {/* SVG paths */}
            </svg>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="logo-text"
            >
              Faculty<span className="logo-highlight">Ranker</span>
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop navigation: hidden on small and shown from md up */}
        <div className="desktop-nav hidden md:flex items-center space-x-4">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger: shown on small and hidden from md up */}
        <div className="mobile-menu-btn md:hidden">
          <button onClick={toggleMenu}>
            <span className="sr-only">Toggle menu</span>
            {isMenuOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mobile-menu md:hidden bg-gray-800"
        >
          <Link to="/" className="mobile-link block px-4 py-2">Home</Link>
          <Link to="/about" className="mobile-link block px-4 py-2">About Us</Link>
          <button
            onClick={handleLogout}
            className="mobile-link block px-4 py-2 text-left text-red-400 hover:text-red-600"
          >
            Logout
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
