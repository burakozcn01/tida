// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/api';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
    
    const fetchProjects = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const data = await API.projects.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  if (!isAuthenticated) return null;

  return (
    <aside 
      className={`fixed left-0 top-0 z-20 h-full pt-16 flex flex-col flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`} 
      aria-label="Sidebar"
    >
      <div className="relative flex-1 flex flex-col min-h-0 border-r border-gray-800 bg-gray-900 pt-0">
        <div className="absolute right-0 -mr-3 top-1/2 transform -translate-y-1/2">
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-blue-400 hover:border-blue-600 focus:outline-none shadow-sm"
          >
            <svg 
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <nav className="flex-1 px-2 space-y-1 bg-gray-900">
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-gray-800 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                }`}
              >
                <svg className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {!isCollapsed && <span>Dashboard</span>}
              </Link>
              
              <Link
                to="/my-tasks"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/my-tasks'
                    ? 'bg-gray-800 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                }`}
              >
                <svg className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {!isCollapsed && <span>My Tasks</span>}
              </Link>
              
              <Link
                to="/projects"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/projects'
                    ? 'bg-gray-800 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                }`}
              >
                <svg className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {!isCollapsed && <span>All Projects</span>}
              </Link>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-800">
              {!isCollapsed && (
                <div className="px-3 pb-2 flex items-center justify-between">
                  <h3 
                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  >
                    <div className="flex items-center">
                      <svg 
                        className={`h-3.5 w-3.5 mr-1 transition-transform ${isProjectsOpen ? '' : 'transform -rotate-90'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Projects
                    </div>
                  </h3>
                  <Link 
                    to="/projects" 
                    className="text-xs text-blue-400 hover:text-blue-300"
                    title="View all projects"
                  >
                    View all
                  </Link>
                </div>
              )}
              {loading ? (
                !isCollapsed && (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )
              ) : error ? (
                !isCollapsed && (
                  <div className="text-center text-xs text-red-400 py-3">
                    <div className="flex items-center justify-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-1 text-blue-400 hover:text-blue-300"
                    >
                      Try again
                    </button>
                  </div>
                )
              ) : (
                <>
                  {isProjectsOpen && (
                    <div className="space-y-1">
                      {isCollapsed ? (
                        <div className="px-2 space-y-1">
                          {projects.slice(0, 5).map(project => (
                            <Link
                              key={project.id}
                              to={`/projects/${project.id}`}
                              className={`group flex items-center justify-center p-2 rounded-md ${
                                location.pathname === `/projects/${project.id}`
                                  ? 'bg-gray-800 text-blue-400'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-blue-400'
                              }`}
                              title={project.name}
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                            </Link>
                          ))}
                          
                          {projects.length > 5 && (
                            <Link
                              to="/projects"
                              className="flex items-center justify-center p-2 text-xs text-gray-400 hover:text-blue-400"
                              title="View All Projects"
                            >
                              <span className="text-sm">...</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="px-1 space-y-1">
                          {projects.slice(0, 8).map(project => (
                            <Link
                              key={project.id}
                              to={`/projects/${project.id}`}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                location.pathname === `/projects/${project.id}`
                                  ? 'bg-gray-800 text-blue-400'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                              }`}
                            >
                              <span className="flex-shrink-0 w-2 h-2 mr-3 rounded-full bg-blue-500"></span>
                              <span className="truncate">{project.name}</span>
                            </Link>
                          ))}
                          
                          {projects.length > 8 && (
                            <Link
                              to="/projects"
                              className="flex items-center px-3 py-2 text-xs text-gray-400 hover:text-blue-400"
                            >
                              View all projects ({projects.length})
                            </Link>
                          )}
                        </div>
                      )}
                      
                      {projects.length === 0 && !isCollapsed && (
                        <div className="px-3 py-2 text-sm text-gray-400">
                          No projects yet
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
        
        {!isCollapsed && (
          <div className="px-2 py-4 bg-gray-800 border-t border-gray-700">
            <Link
              to="/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-blue-400"
            >
              <svg className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;