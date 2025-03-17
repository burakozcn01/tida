import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import API from '../../api/api';
import TaskFormDrawer from './TaskFormDrawer'; 
import SubtaskList from './SubtaskList';
import CommentList from './CommentList';
import AttachmentList from './AttachmentList';
import TagList from './TagList';
import { ComponentLoader } from '../common/PageLoader';
import { Link } from 'react-router-dom';

const TaskDrawer = ({ taskId, isOpen, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false); 
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask();
    }
  }, [taskId, isOpen]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await API.tasks.getTask(taskId);
      setTask(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await API.tasks.deleteTask(task.id);
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    }
  };

  const handleTaskUpdate = () => {
    fetchTask();
    if (onTaskUpdated) onTaskUpdated();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <svg className="mr-1.5 h-2 w-2 text-red-600" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <svg className="mr-1.5 h-2 w-2 text-yellow-600" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <svg className="mr-1.5 h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <svg className="mr-1.5 h-2 w-2 text-gray-500" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'None'}
          </span>
        );
    }
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleEditFormClose = () => {
    setIsEditFormOpen(false);
  };

  const handleEditFormSuccess = () => {
    setIsEditFormOpen(false);
    handleTaskUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
              <button
                onClick={onClose}
                className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-auto">
              {loading ? (
                <div className="flex-1 px-4 sm:px-6">
                  <ComponentLoader message="Loading task details..." />
                </div>
              ) : error ? (
                <div className="flex-1 px-4 sm:px-6">
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
                          onClick={fetchTask} 
                          className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !task ? (
                <div className="flex-1 px-4 sm:px-6">
                  <div className="text-center p-6">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="text-xl font-medium text-gray-700">Task not found</h2>
                    <p className="text-gray-500 mt-2">The task you're looking for doesn't exist or has been deleted.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-4 sm:px-6 border-b border-gray-200 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          {task.priority && getPriorityBadge(task.priority)}
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mt-2">{task.title}</h2>
                        
                        <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                          {task.column && task.column.board && (
                            <Link 
                              to={`/boards/${task.column.board}`}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                              onClick={onClose}
                            >
                              <svg className="mr-1.5 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {task.column.name || 'Column'}
                            </Link>
                          )}
                          
                          {task.due_date && (
                            <span className={`flex items-center ${isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}`}>
                              <svg className={`mr-1.5 h-4 w-4 ${isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Due: {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex">
                        <button
                          onClick={handleEditClick}
                          className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          title="Edit task"
                        >
                          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="ml-2 inline-flex items-center p-1.5 border border-transparent shadow-sm text-sm rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          title="Delete task"
                        >
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {task.assigned_to && (
                      <div className="mt-3 flex items-center">
                        <span className="text-xs font-medium text-gray-500 mr-2">Assigned to:</span>
                        <div className="flex items-center">
                          {task.assigned_to.avatar ? (
                            <img
                              className="h-6 w-6 rounded-full mr-1.5 border border-gray-200"
                              src={task.assigned_to.avatar}
                              alt={task.assigned_to.username}
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-medium mr-1.5">
                              {task.assigned_to.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{task.assigned_to.username}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 sm:px-6 border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                          activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('details')}
                      >
                        Details
                      </button>
                      
                      <button
                        className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                          activeTab === 'subtasks'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('subtasks')}
                      >
                        Subtasks
                        <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {task.subtasks?.length || 0}
                        </span>
                      </button>
                      
                      <button
                        className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                          activeTab === 'comments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('comments')}
                      >
                        Comments
                        <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {task.comments?.length || 0}
                        </span>
                      </button>
                      
                      <button
                        className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 focus:outline-none ${
                          activeTab === 'attachments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('attachments')}
                      >
                        Files
                        <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {task.attachments?.length || 0}
                        </span>
                      </button>
                    </nav>
                  </div>
                  
                  <div className="flex-1 px-4 sm:px-6 py-4 overflow-auto">
                    {activeTab === 'details' && (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                            {task.description ? (
                              <p className="text-sm text-gray-700 whitespace-pre-line">{task.description}</p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No description provided</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                          <TagList 
                            taskId={task.id} 
                            tags={task.tags || []} 
                            onTagsChange={handleTaskUpdate}
                          />
                        </div>
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Subtasks Progress</h3>
                            <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>
                                  {task.subtasks.filter(st => st.is_completed).length} of {task.subtasks.length} completed
                                </span>
                                <span>
                                  {Math.round((task.subtasks.filter(st => st.is_completed).length / task.subtasks.length) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(task.subtasks.filter(st => st.is_completed).length / task.subtasks.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                          <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                            <dl className="divide-y divide-gray-200">
                              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {task.column?.name || 'Unknown'}
                                  </span>
                                </dd>
                              </div>
                              
                              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Created by</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  <div className="flex items-center">
                                    {task.created_by?.avatar ? (
                                      <img
                                        className="h-5 w-5 rounded-full mr-1.5 border border-gray-200"
                                        src={task.created_by.avatar}
                                        alt={task.created_by.username}
                                      />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 text-xs font-medium mr-1.5">
                                        {task.created_by?.username?.charAt(0).toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span>{task.created_by?.username || 'Unknown'}</span>
                                  </div>
                                </dd>
                              </div>
                              
                              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Created on</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {formatDate(task.created_at)}
                                </dd>
                              </div>
                              
                              {task.due_date && (
                                <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                  <dt className="text-sm font-medium text-gray-500">Due date</dt>
                                  <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                    {formatDateWithTime(task.due_date)}
                                    {isOverdue(task.due_date) && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Overdue
                                      </span>
                                    )}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'subtasks' && (
                      <SubtaskList 
                        taskId={task.id} 
                        subtasks={task.subtasks || []} 
                        onSubtasksChange={handleTaskUpdate}
                      />
                    )}
                    
                    {activeTab === 'comments' && (
                      <CommentList 
                        taskId={task.id} 
                        comments={task.comments || []} 
                        onCommentsChange={handleTaskUpdate}
                      />
                    )}
                    
                    {activeTab === 'attachments' && (
                      <AttachmentList 
                        taskId={task.id} 
                        attachments={task.attachments || []} 
                        onAttachmentsChange={handleTaskUpdate}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
      
      <TaskFormDrawer
        isOpen={isEditFormOpen}
        onClose={handleEditFormClose}
        columnId={task?.column?.id}
        initialData={task}
        onSuccess={handleEditFormSuccess}
      />
      
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Task
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this task? This action cannot be undone and all associated subtasks, comments, and attachments will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDrawer;