// src/pages/FacultyList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useWindowSize } from '../hooks/useWindowSize';
import FacultyCard from '../components/FacultyCard';
import Navbar from '../components/Navbar';
import { getFacultyPage } from '../services/facultyService';
import '../styles/FacultyList.css';

const FacultyList = () => {
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const facultiesPerPage = 20;

  useEffect(() => {
    const fetchFaculties = async () => {
      setLoading(true);
      try {
        const data = await getFacultyPage(currentPage, facultiesPerPage, debouncedSearchTerm);
        setFaculties(data.faculty);
        setTotalPages(data.totalPages);
      } catch {
        setError('Failed to load faculty data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestionLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await getFacultyPage(1, 5, searchTerm);
        setSearchSuggestions(data.faculty || []);
        setShowSuggestions(true);
      } catch {} finally {
        setSuggestionLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    setCurrentPage(1);
    searchInputRef.current?.blur();
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div>
      <Navbar />
      <div className="faculty-list-container">
        <div className="search-add-container" ref={searchContainerRef}>
          <div className="search-box">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search faculty by name..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
            />
            {searchTerm && <button onClick={handleClearSearch} className="clear-btn">×</button>}
            <button onClick={handleSearch} className="search-btn" disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {suggestionLoading && <div className="no-suggestions">Loading...</div>}

          {showSuggestions && !suggestionLoading && (
            <div className="suggestions-dropdown">
              {searchSuggestions.length ? (
                searchSuggestions.map(f => (
                  <div key={f._id} className="suggestion-item" onClick={() => handleSuggestionClick(f.name)}>
                    <img src={f.image_url} alt={f.name} className="suggestion-img" />
                    <div>
                      <p className="suggestion-name" style={{ color: 'black' }}>{f.name}</p>
                      <p className="suggestion-dept" style={{ color: 'black' }}>{f.department || 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-suggestions">No faculty found</div>
              )}
            </div>
          )}

          <Link to="/add-faculty" className="add-btn">Add Faculty</Link>
        </div>

        <div className="cards-grid">
          {loading ? (
            <div className="loading-spinner" />
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            faculties.map(f => <FacultyCard key={f._id} faculty={f} isMobile={isMobile} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination flex justify-center items-center gap-2 mt-6">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50">First</button>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(pageNum => pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2))
              .map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pageNum === currentPage ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Next</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Last</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyList;
