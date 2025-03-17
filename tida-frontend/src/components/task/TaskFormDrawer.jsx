import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import API from '../../api/api';

const TaskFormDrawer = ({ isOpen, onClose, columnId, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: null,
    column: columnId,
    position: 0,
  });
  const [members, setMembers] = useState([]);
  const [assignedTo, setAssignedTo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityRef = useRef(null);
  const drawerRef = useRef(null);
  const isEditMode = !!initialData;
  const maxDescriptionLength = 500;
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [priorityRef]);
  
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
  
  const fetchBoardMembers = React.useCallback(async () => {
    try {
      const columnsResponse = await API.columns.getColumns();
      const column = columnsResponse.find(col => col.id === parseInt(columnId));
      
      if (!column) return;
      
      if (column.board) {
        const boardsResponse = await API.boards.getBoards();
        const board = boardsResponse.find(b => b.id === column.board);
        
        if (!board) return;
        
        if (board.project) {
          const projectData = await API.projects.getProject(board.project);
          
          if (projectData) {
            setProject(projectData);
            const allMembers = [
              projectData.created_by, 
              ...(projectData.members || [])
            ].filter(Boolean);
            
            if (initialData?.assigned_to && !allMembers.some(m => m.id === initialData.assigned_to.id)) {
              allMembers.push(initialData.assigned_to);
            }
            
            const uniqueMembers = allMembers.filter((member, index, self) =>
              index === self.findIndex((m) => m.id === member.id)
            );
            
            setMembers(uniqueMembers);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching board members:', error);
    }
  }, [columnId, initialData?.assigned_to]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        due_date: initialData.due_date ? new Date(initialData.due_date) : null,
        column: initialData.column || columnId,
        position: initialData.position ?? 0
      });
      
      setCharCount(initialData.description?.length || 0);
      
      const assignedUserId = initialData.assigned_to?.id ? Number(initialData.assigned_to.id) : null;
      setAssignedTo(assignedUserId);
    } else if (!initialData && isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: null,
        column: columnId,
        position: 0,
      });
      setCharCount(0);
      setAssignedTo(null);
      setErrors({});
    }
  }, [initialData, columnId, isOpen]);

  useEffect(() => {
    if (columnId && isOpen) {
      fetchBoardMembers();
      
      if (!isEditMode) {
        fetchColumnTasks();
      }
    }
  }, [columnId, isEditMode, fetchBoardMembers, isOpen]);

  const fetchColumnTasks = async () => {
    try {
      const tasks = await API.tasks.getColumnTasks(columnId);
      if (tasks && tasks.length > 0) {
        const maxPosition = Math.max(...tasks.map(task => task.position || 0));
        setFormData(prev => ({
          ...prev,
          position: maxPosition + 1
        }));
      }
    } catch (error) {
      console.error('Error fetching column tasks:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      if (value.length > maxDescriptionLength) return;
      setCharCount(value.length);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      due_date: date
    }));
    
    if (errors.due_date) {
      setErrors(prev => ({
        ...prev,
        due_date: null
      }));
    }
  };

  const handleAssigneeChange = (e) => {
    const value = e.target.value === 'null' ? null : Number(e.target.value);
    setAssignedTo(value);
  };

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
    setShowPriorityDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > maxDescriptionLength) {
      newErrors.description = `Description must be less than ${maxDescriptionLength} characters`;
    }

    if (!isEditMode && formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = 'Due date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    const data = {
      ...formData,
      due_date: formData.due_date ? formData.due_date.toISOString() : null,
      position: formData.position >= 0 ? formData.position : 0
    };
    
    try {
      let response;
      
      if (isEditMode) {
        response = await API.tasks.updateTask(initialData.id, data);
        
        if (initialData.assigned_to?.id !== assignedTo) {
          await API.tasks.assignTask(initialData.id, assignedTo);
        }
      } else {
        response = await API.tasks.createTask(data);
        
        if (assignedTo) {
          await API.tasks.assignTask(response.id, assignedTo);
        }
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      
      const responseErrors = err.response?.data || {};
      
      const serverErrors = {};
      
      for (const key in responseErrors) {
        if (Array.isArray(responseErrors[key])) {
          serverErrors[key] = responseErrors[key][0];
        } else if (typeof responseErrors[key] === 'string') {
          serverErrors[key] = responseErrors[key];
        }
      }
      
      setErrors(Object.keys(serverErrors).length > 0 ? serverErrors : { 
        api: 'An error occurred while saving the task. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50';
      case 'medium': return 'bg-yellow-50';
      case 'low': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200';
      case 'medium': return 'border-yellow-200';
      case 'low': return 'border-green-200';
      default: return 'border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <svg className="mr-1.5 h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="mr-1.5 h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="mr-1.5 h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity ease-out duration-300" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div 
              className={`pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
              ref={drawerRef}
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl">
                <div className="bg-blue-600 px-6 py-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 opacity-20">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {isEditMode ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button
                      type="button"
                      className="rounded-md text-white hover:text-blue-200 focus:outline-none transition-colors"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {project && (
                    <div className="mt-2 text-blue-100 text-sm flex items-center relative z-10">
                      <svg className="h-4 w-4 mr-1.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{project.name}</span>
                      {columnId && (
                        <>
                          <svg className="h-3 w-3 mx-1.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{members.find(col => col.id === parseInt(columnId))?.name || 'Column'}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white">
                  {errors.api && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm animate-fadeIn">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-medium">{errors.api}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-7">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-1.5">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          required
                          className={`pl-10 block w-full h-11 border-2 ${
                            errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          } rounded-md shadow-none placeholder-gray-400 text-sm transition-all duration-150 hover:border-gray-400 focus:outline-none`}
                          placeholder="What needs to be done?"
                          value={formData.title}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.title && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.title}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-800">
                          Description
                        </label>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          charCount > maxDescriptionLength * 0.9 
                            ? 'text-red-700 bg-red-50' 
                            : charCount > maxDescriptionLength * 0.8 
                              ? 'text-amber-700 bg-amber-50' 
                              : 'text-gray-500 bg-gray-100'
                        } transition-colors duration-200`}>
                          {charCount}/{maxDescriptionLength}
                        </span>
                      </div>
                      <div className="relative group">
                        <textarea
                          id="description"
                          name="description"
                          rows="4"
                          className={`block w-full border-2 ${
                            errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          } rounded-md shadow-none placeholder-gray-400 text-sm transition-all duration-150 hover:border-gray-400 focus:outline-none p-3`}
                          placeholder="Provide details about this task..."
                          value={formData.description}
                          onChange={handleChange}
                        />
                        <div className="absolute top-2 right-2 pointer-events-none opacity-30 group-hover:opacity-0 transition-opacity duration-200">
                          <svg className="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      {errors.description ? (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.description}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Add notes, requirements, or any other details
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-800 mb-1.5">
                          Priority
                        </label>
                        <div className="relative" ref={priorityRef}>
                          <button
                            type="button"
                            className={`relative w-full ${getPriorityBgColor(formData.priority)} ${getPriorityBorderColor(formData.priority)} 
                              border-2 rounded-md pl-3 pr-10 py-2.5 h-11 text-left cursor-pointer focus:outline-none 
                              focus:border-blue-500 shadow-none hover:border-gray-400 transition-all duration-150 text-sm`}
                            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                            aria-haspopup="listbox"
                            aria-expanded={showPriorityDropdown}
                          >
                            <span className={`flex items-center ${getPriorityTextColor(formData.priority)} font-medium`}>
                              {getPriorityIcon(formData.priority)}
                              <span className="capitalize">{formData.priority}</span>
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showPriorityDropdown ? 'transform rotate-180' : ''}`} 
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </button>

                          {showPriorityDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-gray-200 overflow-auto focus:outline-none sm:text-sm">
                              {['low', 'medium', 'high'].map((priority) => (
                                <div
                                  key={priority}
                                  className={`${
                                    formData.priority === priority ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                  } cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-gray-50 transition-colors duration-150`}
                                  onClick={() => handlePriorityChange(priority)}
                                >
                                  <div className={`flex items-center ${getPriorityTextColor(priority)}`}>
                                    {getPriorityIcon(priority)}
                                    <span className={`block truncate capitalize ${formData.priority === priority ? 'font-medium' : 'font-normal'}`}>
                                      {priority}
                                    </span>
                                  </div>

                                  {formData.priority === priority && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-800 mb-1.5">
                          Assign To
                        </label>
                        <div className="relative rounded-md shadow-sm group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <select
                            id="assigned_to"
                            name="assigned_to"
                            className="pl-10 block w-full border-2 border-gray-300 rounded-md h-11 shadow-none focus:border-blue-500 focus:outline-none text-sm transition-all duration-150 hover:border-gray-400 cursor-pointer appearance-none"
                            value={assignedTo === null ? 'null' : String(assignedTo)}
                            onChange={handleAssigneeChange}
                          >
                            <option value="null">Unassigned</option>
                            
                            {assignedTo !== null && initialData?.assigned_to && 
                              !members.some(m => Number(m.id) === Number(assignedTo)) && (
                              <option key={`assigned-${assignedTo}`} value={String(assignedTo)}>
                                {initialData.assigned_to.username} (Currently Assigned)
                              </option>
                            )}
                            
                            {members.map(member => (
                              <option key={member.id} value={String(member.id)}>
                                {member.username}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        {members.length === 0 && (
                          <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Loading members or no project members available
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-800 mb-1.5">
                        Due Date & Time
                      </label>
                      <div className="relative rounded-md shadow-sm group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <DatePicker
                          id="due_date"
                          selected={formData.due_date}
                          onChange={handleDateChange}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className={`pl-10 block w-full border-2 h-11 ${
                            errors.due_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          } rounded-md shadow-none placeholder-gray-400 text-sm transition-all duration-150 hover:border-gray-400 focus:outline-none cursor-pointer`}
                          placeholderText="Select a deadline"
                          isClearable
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {formData.due_date && (
                            <svg className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                              onClick={() => handleDateChange(null)}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {errors.due_date && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.due_date}
                        </p>
                      )}
                    </div>
                    
                    {errors.position && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm animate-fadeIn">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700 font-medium">Position error: {errors.position}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2 h-11 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:border-gray-400 transition-all duration-200"
                    >
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-5 py-2 h-11 border-2 border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:border-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditMode ? 'Saving...' : 'Creating...'}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {isEditMode ? (
                            <>
                              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </>
                          ) : (
                            <>
                              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Create Task
                            </>
                          )}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-popIn {
    animation: popIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default TaskFormDrawer;