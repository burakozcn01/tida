import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api/api';
import { useAuth } from '../../hooks/useAuth';

const MemberManagementDrawer = ({ project, isOpen, onClose, onMembershipChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); 
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user: currentUser } = useAuth();
  const drawerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setActiveTab('current');
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen && activeTab === 'add') {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);
  
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && isOpen && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await API.users.getUsers();
      const memberIds = project.members.map(member => member.id);
      memberIds.push(project.created_by.id); 
      const availableUsers = data.filter(user => !memberIds.includes(user.id));
      setUsers(availableUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMember = async (userId) => {
    try {
      setActionLoading(true);
      await API.projects.addMember(project.id, userId);
      fetchUsers();
      if (onMembershipChange) onMembershipChange();
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleRemoveMember = async (userId) => {
    try {
      setActionLoading(true);
      await API.projects.removeMember(project.id, userId);
      if (onMembershipChange) onMembershipChange();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getInitials = (user) => {
    if (!user) return '?';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    
    return user.username.charAt(0).toUpperCase();
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div 
              className={`pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
              ref={drawerRef}
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Project Team Management
                      </h2>
                      <p className="mt-1 text-blue-100 text-sm">
                        {project.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 focus:outline-none transition-all duration-200"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                        activeTab === 'current'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('current')}
                    >
                      Current Members ({project.members.length + 1})
                    </button>
                    {currentUser.id === project.created_by.id && (
                      <button
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                          activeTab === 'add'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('add')}
                      >
                        Add Members
                      </button>
                    )}
                  </nav>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-pulse">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                          <button 
                            onClick={fetchUsers} 
                            className="mt-1 text-sm text-red-700 hover:underline focus:outline-none"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'current' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                          {project.created_by.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-blue-200"
                              src={project.created_by.avatar}
                              alt={project.created_by.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-medium">
                              {getInitials(project.created_by)}
                            </div>
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{project.created_by.username}</p>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 inline-flex items-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Owner
                                </span>
                              </span>
                              {project.created_by.email && (
                                <span className="text-xs text-gray-500 ml-2">{project.created_by.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {project.members.length > 0 ? (
                        <div className="space-y-2">
                          {project.members.map(member => (
                            <div 
                              key={member.id} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center">
                                {member.avatar ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    src={member.avatar}
                                    alt={member.username}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                    {getInitials(member)}
                                  </div>
                                )}
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{member.username}</p>
                                  {member.email && (
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                  )}
                                </div>
                              </div>
                              
                              {currentUser.id === project.created_by.id && (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="mr-1 h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-gray-500 mt-2">No additional team members yet.</p>
                          {currentUser.id === project.created_by.id && (
                            <button
                              onClick={() => setActiveTab('add')}
                              className="mt-3 inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="mr-1.5 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add team members
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'add' && currentUser.id === project.created_by.id && (
                    <div>
                      <div className="mb-6">
                        <div className={`relative rounded-lg transition-all duration-200 ${
                          isSearchFocused 
                            ? 'ring-2 ring-blue-100'
                            : 'hover:ring-1 hover:ring-gray-200'
                        }`}>
                          <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${
                            isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by username or email..."
                            className={`pl-11 pr-4 py-3 block w-full rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none bg-white transition-colors duration-200 ${
                              isSearchFocused 
                                ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                                : 'border-gray-300'
                            }`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                          />
                          {searchTerm && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {loading ? (
                        <div className="py-10 text-center">
                          <svg className="h-10 w-10 mx-auto text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-4 text-sm text-gray-500 font-medium">Loading users...</p>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-gray-500 text-sm font-medium">
                            {searchTerm 
                              ? `No users found matching "${searchTerm}"` 
                              : "No users available to add"
                            }
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredUsers.map(user => (
                            <div 
                              key={user.id} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center">
                                {user.avatar ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    src={user.avatar}
                                    alt={user.username}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                    {getInitials(user)}
                                  </div>
                                )}
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                  {user.email && (
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddMember(user.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200 overflow-hidden group"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-gray-100 rounded-full group-hover:w-full group-hover:h-56"></span>
                      <span className="relative flex items-center">
                        <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Done
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MemberManagementDrawer;