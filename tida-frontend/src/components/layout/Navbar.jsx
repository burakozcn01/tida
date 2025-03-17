// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length === 1) return name.charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 fixed z-30 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center">
                <div className="bg-blue-600 h-8 w-8 rounded-md flex items-center justify-center shadow-sm overflow-hidden">
                  <img 
                    src="/tidalight.png" 
                    alt="Tida Logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="ml-2 text-xl font-bold text-white hidden sm:block">Tida Management</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard' 
                        ? 'text-blue-300 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/projects" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname.startsWith('/projects') 
                        ? 'text-blue-300 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    Projects
                  </Link>
                  <Link 
                    to="/my-tasks" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/my-tasks' 
                        ? 'text-blue-300 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    My Tasks
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="ml-4 relative flex-shrink-0" ref={userMenuRef}>
                <div>
                  <button
                    type="button"
                    className="bg-gray-800 flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 rounded-full"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full border border-gray-700 object-cover"
                        src={user.avatar}
                        alt="User Avatar"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-medium">
                        {getInitials(user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username)}
                      </div>
                    )}
                    <div className="ml-2 flex items-center">
                      <span className="text-sm font-medium text-white mr-1">{user.first_name || user.username}</span>
                      <svg className={`h-5 w-5 text-gray-400 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-700">
                    <div className="py-1">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name || ''}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Profile Settings
                      </Link>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-gray-900 bg-blue-400 hover:bg-blue-300 rounded-md px-4 py-2 shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-lg" id="mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="flex items-center p-4 border-b border-gray-800">
                {user.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full border border-gray-700 object-cover"
                    src={user.avatar}
                    alt="User Avatar"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-medium">
                    {getInitials(user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username)}
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.first_name} {user.last_name || ''}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/dashboard'
                      ? 'text-blue-300 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname.startsWith('/projects')
                      ? 'text-blue-300 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/my-tasks"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/my-tasks'
                      ? 'text-blue-300 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  My Tasks
                </Link>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/profile'
                      ? 'text-blue-300 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 flex flex-col space-y-3">
              <Link
                to="/login"
                className="block text-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 border border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block text-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-blue-400 hover:bg-blue-300 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;