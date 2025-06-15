import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Navbar.css';
import { getFacultyPage } from '../services/facultyService';
import { useDebounce } from '../hooks/useDebounce';
import { useWindowSize } from '../hooks/useWindowSize';

const FacultyList = () => {
  // ... (Navbar State and Logic - no changes needed here) ...
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  // --- End Navbar State and Logic ---

  // --- FacultyList State and Logic ---
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

  const facultiesPerPage = 20;

  // Enhanced search states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getFacultyPage(
          currentPage,
          facultiesPerPage,
          debouncedSearchTerm
        );
        setFaculties(data.faculty || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching faculties:', err);
        setError('Failed to load faculty data. Please try again later.');
        setFaculties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [currentPage, debouncedSearchTerm, facultiesPerPage]);

  // Enhanced search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionLoading(true);
      try {
        // Using the same getFacultyPage service for consistency
        const data = await getFacultyPage(1, 5, searchTerm);
        setSearchSuggestions(data.faculty || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSearchSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Effect for handling clicks outside the search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (facultyName) => {
    setSearchTerm(facultyName);
    setShowSuggestions(false);
    setCurrentPage(1);
    searchInputRef.current?.blur();
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    setCurrentPage(1);
    searchInputRef.current?.blur();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  // --- End FacultyList State and Logic ---

  return (
    <div className="FacultyListWithNavbar">
      {/* ... Navbar JSX (no changes) ... */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full z-50 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-900/90 backdrop-blur-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{
                scale: 1.05,
                textShadow: "0 0 8px rgba(168, 85, 247, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex items-center"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L8 11H16L12 15Z" fill="currentColor" />
                  <path d="M12 8L16 12H8L12 8Z" fill="currentColor" />
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C2 6.47715 6.47715 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                </svg>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="ml-2 text-xl font-bold text-white"
                >
                  <a href="/">Faculty<span className="text-purple-400">Ranker</span></a>
                </motion.span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <motion.a
                  whileHover={{
                    scale: 1.05,
                    textShadow: "0 0 8px rgba(168, 85, 247, 0.8)"
                  }}
                  href="#"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  About Us
                </motion.a>

                {/* Profile Dropdown */}
                <div className="relative ml-3">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center text-sm rounded-full focus:outline-none"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        U
                      </div>
                    </button>
                  </motion.div>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-gray-700 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <motion.a
                        whileHover={{ scale: 1.02, x: 5 }}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Your Profile
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.02, x: 5 }}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Settings
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.02, x: 5 }}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Logout
                      </motion.a>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                href="#"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                About Us
              </motion.a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">User</div>
                  <div className="text-sm font-medium text-gray-400">user@example.com</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Your Profile
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Settings
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Logout
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>
      {/* --- End Navbar JSX --- */}

      {/* --- FacultyList Content --- */}
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '4rem' }}>
        {/* Enhanced Search and Add Faculty Section */}
        <div className="max-w-7xl mx-auto mb-8 md:mb-12">
          <div ref={searchContainerRef} className="flex flex-col md:flex-row gap-4 mt-12 md:mt-20 items-center justify-between">
            <div className="relative w-full">
              <div className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search faculty by name..."
                  className="w-full px-6 py-4 text-base rounded-lg bg-white border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 focus:shadow-purple-500/30"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    if (searchTerm && searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-md transition-all duration-300 min-w-[80px] font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              {/* Loading indicator for suggestions */}
              {suggestionLoading && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading suggestions...
                  </div>
                </div>
              )}

              {/* Enhanced suggestions dropdown */}
              {showSuggestions && searchTerm && searchSuggestions.length > 0 && !suggestionLoading && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-auto">
                  {searchSuggestions.map(faculty => (
                    <div
                      key={faculty._id}
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(faculty.name);
                      }}
                    >
                      <img 
                        src={faculty.image_url || ''} 
                        alt={faculty.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mr-3 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMVY5QTIgMiAwIDAgMCAxOCA3SDZBMiAyIDAgMCAwIDQgOVYyMUwyIDIzTDIyIDIzTDIwIDIxWiIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iMTAiIHI9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="flex-grow min-w-0">
                        <p className="text-gray-900 font-medium text-sm truncate">{faculty.name}</p>
                        <p className="text-gray-500 text-xs truncate">{faculty.department || 'Department not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSuggestions && !suggestionLoading && searchSuggestions.length === 0 && searchTerm.trim() && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="text-center text-gray-600 text-sm">
                    🔍 No faculty found matching "{searchTerm}"
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/add-faculty"
              className="w-full mt-4 md:mt-0 md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Add Faculty</span>
            </Link>
          </div>
        </div>

        {/* Faculty Cards Section */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-red-400">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          ) : faculties.length > 0 ? (
            <>
              {/* This is where the 4-column layout is defined for larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {faculties.map((faculty) => (
                  <FacultyCard key={faculty._id} faculty={faculty} isMobile={isMobile} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 md:mt-12">
                  <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                      Prev
                    </button>

                    {/* Adjusted pagination buttons based on total pages and current page */}
                    {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= (isMobile ? 3 : 5)) {
                        pageNum = i + 1;
                      } else if (currentPage <= (isMobile ? 2 : 3)) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - (isMobile ? 1 : 2)) {
                        pageNum = totalPages - (isMobile ? 2 : 4) + i;
                      } else {
                        pageNum = currentPage - (isMobile ? 1 : 2) + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-300">No faculties found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or add a new faculty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// FacultyCard component
const FacultyCard = ({ faculty, isMobile }) => { // isMobile is correctly received here
  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${isMobile ? 'mx-1' : ''}`}>
      <div className="relative h-40 md:h-48 bg-gradient-to-r from-purple-900 to-indigo-800 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <img
            src={faculty.image_url || ''}
            alt={faculty.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = '';
              e.target.className = "w-full h-full object-contain";
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">{faculty.name}</h3>
          <p className="text-purple-300 text-xs md:text-sm line-clamp-1">{faculty.department || 'Department not specified'}</p>
        </div>
      </div>
      <div className="p-3 md:p-4 flex-grow flex flex-col">
        <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
          <RatingBar
            label="Teaching"
            value={faculty.teaching_rating || 0}
            isMobile={isMobile} // isMobile is correctly passed
          />
          <RatingBar
            label="Attendance"
            value={faculty.attendance_rating || 0}
            isMobile={isMobile} // isMobile is correctly passed
          />
          <RatingBar
            label="Correction"
            value={faculty.correction_rating || 0}
            isMobile={isMobile} // isMobile is correctly passed
          />
        </div>

        <p className="text-gray-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-3 md:mb-4 flex-grow">
          {faculty.bio || 'No bio available for this faculty member.'}
        </p>

        <Link
          to={`/faculty/${faculty._id}`}
          className="mt-auto w-full py-1 md:py-2 text-xs md:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-md transition-colors text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

// RatingBar component
const RatingBar = ({ label, value, isMobile }) => { // isMobile is correctly received here
  const normalizedValue = Math.min(Math.max(value || 0, 0), 5);
  const widthPercent = normalizedValue * 20;
  const color = label === 'Teaching' ? 'bg-yellow-400' :
    label === 'Attendance' ? 'bg-green-400' : 'bg-blue-400';

  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs md:text-sm text-gray-400 ${isMobile ? 'truncate' : ''}`}>
        {label}
      </span>
      <div className="flex items-center">
        <div className={`${isMobile ? 'w-16' : 'w-20 md:w-24'} bg-gray-700 rounded-full h-2 md:h-2.5`}>
          <div
            className={`${color} h-2 md:h-2.5 rounded-full`}
            style={{ width: `${widthPercent}%` }}
          ></div>
        </div>
        <span className={`ml-1 md:ml-2 text-white text-xs md:text-sm ${isMobile ? 'hidden sm:inline' : ''}`}>
          {normalizedValue}/5
        </span>
      </div>
    </div>
  );
};

export default FacultyList;