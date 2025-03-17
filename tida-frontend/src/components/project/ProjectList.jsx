// src/components/project/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import ProjectCard from './ProjectCard';
import { ComponentLoader } from '../common/PageLoader';
import ProjectFormDrawer from './ProjectFormDrawer';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  const [view, setView] = useState('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    archived: 0,
    total: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await API.projects.getProjects();
      setProjects(data);
      
      const active = data.filter(project => !project.is_archived).length;
      const archived = data.filter(project => project.is_archived).length;
      
      setStats({
        active,
        archived,
        total: data.length
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveToggle = async (projectId, isArchived) => {
    try {
      if (isArchived) {
        await API.projects.unarchiveProject(projectId);
      } else {
        await API.projects.archiveProject(projectId);
      }
      fetchProjects();
    } catch (err) {
      console.error('Error archiving/unarchiving project:', err);
      setError('Failed to archive/unarchive project.');
    }
  };
  
  const getFilteredAndSortedProjects = () => {
    let filtered = projects.filter(project => showArchived ? project.is_archived : !project.is_archived);
    
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(search) || 
        (project.description && project.description.toLowerCase().includes(search))
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };
  
  const handleCreateProjectSuccess = (newProject) => {
    fetchProjects();
  };
  
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const filteredProjects = getFilteredAndSortedProjects();

  return (
    <div className="space-y-6">
      <ProjectFormDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={handleCreateProjectSuccess}
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and organize your work
          </p>
        </div>
        <div>
          <button
            onClick={toggleDrawer}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</h2>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Archived Projects</h2>
          <p className="mt-1 text-2xl font-semibold text-gray-600">{stats.archived}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Projects</h2>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">{stats.total}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className={`h-5 w-5 ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className={`pl-10 block w-full border ${
                isSearchFocused ? 'border-blue-300 ring-1 ring-blue-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <label className="inline-flex items-center cursor-pointer">
              <span className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </span>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {showArchived ? 'Showing archived' : 'Show archived'}
              </span>
            </label>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            
            <div className="border border-gray-300 rounded-md overflow-hidden hidden sm:flex">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1 ${
                  view === 'grid'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
                title="Grid view"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 ${
                  view === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
                title="List view"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <ComponentLoader message="Loading projects..." />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchProjects} 
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          {searchTerm ? (
            <>
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-700">No matching projects found</h2>
              <p className="text-gray-500 mt-2">Try changing your search or filter criteria.</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear search
              </button>
            </>
          ) : showArchived ? (
            <>
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h2 className="text-xl font-medium text-gray-700">No archived projects</h2>
              <p className="text-gray-500 mt-2">You don't have any archived projects yet.</p>
              <button 
                onClick={() => setShowArchived(false)} 
                className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Show active projects
              </button>
            </>
          ) : (
            <>
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="text-xl font-medium text-gray-700">No projects yet</h2>
              <p className="text-gray-500 mt-2">Get started by creating your first project.</p>
              <button
                onClick={toggleDrawer}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create your first project
              </button>
            </>
          )}
        </div>
      ) : (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onArchiveToggle={handleArchiveToggle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <li key={project.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center ${project.is_archived ? 'opacity-50' : ''}`}>
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <Link to={`/projects/${project.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {project.name}
                            {project.is_archived && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Archived
                              </span>
                            )}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {project.description || 'No description provided'}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span className="mr-3">
                              Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <span className="mr-3">
                              {project.boards?.length || 0} {project.boards?.length === 1 ? 'board' : 'boards'}
                            </span>
                            <span>
                              {project.members.length + 1} {project.members.length + 1 === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleArchiveToggle(project.id, project.is_archived)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition-colors"
                        >
                          {project.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 active:bg-blue-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectList;