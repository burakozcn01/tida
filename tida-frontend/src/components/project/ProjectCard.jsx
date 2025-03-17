// src/components/project/ProjectCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onArchiveToggle, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleArchiveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onArchiveToggle(project.id, project.is_archived);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div 
      className={`group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 ${
        isHovered ? 'shadow-md transform translate-y-[-2px]' : ''
      } ${project.is_archived ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/projects/${project.id}`} className="block h-full">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {project.name}
            </h3>
            {project.is_archived && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Archived
              </span>
            )}
          </div>
          
          <p className={`mt-2 text-sm text-gray-600 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {project.description || 'No description provided'}
          </p>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Created {formatDate(project.created_at)}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>{project.boards?.length || 0} boards</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {project.created_by && (
              <div className="relative z-30 inline-block h-8 w-8 rounded-full ring-2 ring-white" title={`${project.created_by.username} (Owner)`}>
                {project.created_by.avatar ? (
                  <img
                    className="h-full w-full rounded-full object-cover"
                    src={project.created_by.avatar}
                    alt={project.created_by.username}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-sm font-medium">
                    {getInitials(project.created_by.username)}
                  </div>
                )}
              </div>
            )}
            
            {project.members.slice(0, 3).map((member, index) => (
              <div key={member.id} className={`relative z-${20 - index * 10} inline-block h-8 w-8 rounded-full ring-2 ring-white`} title={member.username}>
                {member.avatar ? (
                  <img
                    className="h-full w-full rounded-full object-cover"
                    src={member.avatar}
                    alt={member.username}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {getInitials(member.username)}
                  </div>
                )}
              </div>
            ))}
            
            {project.members.length > 3 && (
              <div className="z-0 inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleArchiveToggle}
              className="inline-flex items-center py-1 px-2 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {project.is_archived ? 'Unarchive' : 'Archive'}
            </button>
            
            <Link
              to={`/projects/${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center py-1 px-3 text-xs font-medium rounded border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <span className="flex items-center">
                View
                <svg className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;