import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api/api';
import TemplateSelector from '../templates/TemplateSelector';
import { toast } from 'react-toastify';

const BoardFormDrawer = ({ isOpen, onClose, projectId, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project: projectId,
    template_type: 'simple',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true); 
  const isEditMode = !!initialData;
  const maxDescriptionLength = 500;
  const drawerRef = useRef(null);
  const nameInputRef = useRef(null);

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
      
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          project: projectId,
          template_type: initialData.template_type || 'simple',
        });
        setCharCount(initialData.description?.length || 0);
        setShowTemplates(false);
      } else {
        setFormData({
          name: '',
          description: '',
          project: projectId,
          template_type: 'simple',
        });
        setCharCount(0);
        setShowTemplates(true);
      }
      setErrors({});
    }
  }, [isOpen, initialData, projectId]);

  useEffect(() => {
    setCharCount(formData.description.length);
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description' && value.length > maxDescriptionLength) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTemplateChange = (templateId) => {
    setFormData(prev => ({
      ...prev,
      template_type: templateId
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Board name must be less than 50 characters';
    }
    
    if (formData.description && formData.description.length > maxDescriptionLength) {
      newErrors.description = `Description must be less than ${maxDescriptionLength} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let response;
      
      if (isEditMode) {
        const { template_type, ...updateData } = formData;
        response = await API.boards.updateBoard(initialData.id, updateData);
        toast.success('Board updated successfully');
      } else {
        if (formData.template_type === 'simple') {
          response = await API.boards.createBoard(formData);
        } else {
          response = await API.boards.createBoardFromTemplate(projectId, {
            name: formData.name,
            template_type: formData.template_type,
          });
        }
        toast.success('Board created successfully');
      }
      
      if (onSuccess) onSuccess(response);
      onClose();
    } catch (err) {
      console.error('Error saving board:', err);
      
      const responseErrors = err.response?.data || {};
      
      const serverErrors = {};
      
      for (const key in responseErrors) {
        if (Array.isArray(responseErrors[key])) {
          serverErrors[key] = responseErrors[key][0];
        } else if (typeof responseErrors[key] === 'string') {
          serverErrors[key] = responseErrors[key];
        }
      }
      
      if (Object.keys(serverErrors).length === 0) {
        serverErrors.api = 'Error saving board. Please try again later.';
      }
      
      setErrors(serverErrors);
      toast.error('Failed to save board');
    } finally {
      setIsLoading(false);
    }
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
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {isEditMode ? 'Edit Board' : 'Create New Board'}
                      </h2>
                      <p className="mt-1 text-blue-100 text-sm">
                        {isEditMode 
                          ? 'Update your board details below' 
                          : 'Set up a new board to organize your tasks'}
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
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                  {errors.api && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-pulse">
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
                  
                  <div className="space-y-8">
                    <div>
                      <label 
                        htmlFor="name" 
                        className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${
                          errors.name ? 'text-red-600' : nameFocused ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        Board Name <span className="text-red-500">*</span>
                      </label>
                      <div className={`relative rounded-lg transition-all duration-200 ${
                        errors.name 
                          ? 'ring-2 ring-red-200'
                          : nameFocused 
                            ? 'ring-2 ring-blue-100' 
                            : 'hover:ring-1 hover:ring-gray-200'
                      }`}>
                        <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${
                          errors.name 
                            ? 'text-red-400' 
                            : nameFocused 
                              ? 'text-blue-500' 
                              : 'text-gray-400'
                        }`}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <input
                          ref={nameInputRef}
                          id="name"
                          name="name"
                          type="text"
                          required
                          className={`pl-11 pr-4 py-3 block w-full rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none bg-white transition-colors duration-200 ${
                            errors.name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-800' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900'
                          }`}
                          placeholder="Give your board a clear name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setNameFocused(true)}
                          onBlur={() => setNameFocused(false)}
                        />
                        {errors.name && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.name ? (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.name}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">Choose a descriptive name for your board, e.g., "Development Roadmap", "Bug Tracking"</p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label 
                          htmlFor="description" 
                          className={`block text-sm font-medium transition-colors duration-200 ${
                            errors.description 
                              ? 'text-red-600' 
                              : descriptionFocused 
                                ? 'text-blue-600' 
                                : 'text-gray-700'
                          }`}
                        >
                          Description
                        </label>
                        <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                          charCount > maxDescriptionLength * 0.9 
                            ? 'text-red-700 bg-red-50 font-medium' 
                            : charCount > maxDescriptionLength * 0.8 
                              ? 'text-orange-700 bg-orange-50 font-medium' 
                              : 'text-gray-500 bg-gray-50'
                        }`}>
                          {charCount}/{maxDescriptionLength}
                        </span>
                      </div>
                      <div className={`relative rounded-lg transition-all duration-200 ${
                        errors.description 
                          ? 'ring-2 ring-red-200'
                          : descriptionFocused 
                            ? 'ring-2 ring-blue-100' 
                            : 'hover:ring-1 hover:ring-gray-200'
                      }`}>
                        <textarea
                          id="description"
                          name="description"
                          rows="5"
                          className={`block w-full p-3 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none bg-white transition-colors duration-200 ${
                            errors.description 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-800' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900'
                          }`}
                          placeholder="Describe the purpose of this board..."
                          value={formData.description}
                          onChange={handleChange}
                          onFocus={() => setDescriptionFocused(true)}
                          onBlur={() => setDescriptionFocused(false)}
                        />
                        {errors.description && (
                          <div className="absolute top-3 right-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.description ? (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">Explain what this board is for and how it should be used</p>
                      )}
                    </div>

                    {showTemplates && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <TemplateSelector 
                          selected={formData.template_type} 
                          onChange={handleTemplateChange} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200 overflow-hidden group"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-gray-100 rounded-full group-hover:w-full group-hover:h-56"></span>
                      <span className="relative flex items-center">
                        <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </span>
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative inline-flex items-center px-5 py-2.5 border-2 border-blue-600 shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-200 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-blue-700 rounded-full group-hover:w-full group-hover:h-56"></span>
                      {isLoading ? (
                        <span className="relative flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditMode ? 'Saving...' : 'Creating...'}
                        </span>
                      ) : (
                        <span className="relative flex items-center">
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {isEditMode ? 'Save Changes' : 'Create Board'}
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

export default BoardFormDrawer;