import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/api';

const ColumnDrawer = ({ isOpen, onClose, boardId, initialData, onSuccess }) => {
  const drawerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const formDataRef = useRef({
    name: initialData?.name || '',
    position: initialData?.position ?? 0,
    color: initialData?.color || '#e2e8f0',
    wip_limit: initialData?.wip_limit || '',
    board: boardId,
  });
  
  const [nameValue, setNameValue] = useState(formDataRef.current.name);
  const [colorValue, setColorValue] = useState(formDataRef.current.color);
  const [wipLimitValue, setWipLimitValue] = useState(formDataRef.current.wip_limit);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef(null);
  const isEditMode = !!initialData;
  
  const focusStateRef = useRef({
    activeElement: null,
    activeElementId: null
  });

  useEffect(() => {
    if (initialData) {
      formDataRef.current = {
        name: initialData.name || '',
        position: initialData.position ?? 0,
        color: initialData.color || '#e2e8f0',
        wip_limit: initialData.wip_limit || '',
        board: boardId,
      };
      
      setNameValue(formDataRef.current.name);
      setColorValue(formDataRef.current.color);
      setWipLimitValue(formDataRef.current.wip_limit);
    } else {
      formDataRef.current = {
        name: '',
        position: 0,
        color: '#e2e8f0',
        wip_limit: '',
        board: boardId,
      };
      
      setNameValue('');
      setColorValue('#e2e8f0');
      setWipLimitValue('');
    }
    
    setErrors({});
  }, [initialData, boardId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (isOpen && !isEditMode) {
      const fetchColumnPosition = async () => {
        try {
          const columns = await API.columns.getBoardColumns(boardId);
          const highestPosition = columns.length > 0
            ? Math.max(...columns.map(col => col.position))
            : -1;
            
          formDataRef.current = {
            ...formDataRef.current,
            position: highestPosition + 1
          };
        } catch (err) {
          console.error('Error fetching columns for position:', err);
        }
      };
      
      fetchColumnPosition();
    }
  }, [boardId, isEditMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const focusInput = () => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        
        focusStateRef.current = {
          activeElement: nameInputRef.current,
          activeElementId: 'name'
        };
      }
    };
    
    const timeoutId1 = setTimeout(focusInput, 100);
    const timeoutId2 = setTimeout(focusInput, 300);
    
    const restoreFocus = () => {
      if (focusStateRef.current.activeElement && 
          document.activeElement !== focusStateRef.current.activeElement) {
        focusStateRef.current.activeElement.focus();
      }
    };
    
    const intervalId = setInterval(restoreFocus, 100);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearInterval(intervalId);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (isOpen && event.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNameValue(value);
    formDataRef.current.name = value;
    
    focusStateRef.current = {
      activeElement: e.target,
      activeElementId: 'name'
    };
  };
  
  const handleWipLimitChange = (e) => {
    const value = e.target.value;
    setWipLimitValue(value);
    formDataRef.current.wip_limit = value;
    
    focusStateRef.current = {
      activeElement: e.target,
      activeElementId: 'wip_limit'
    };
  };
  
  const handleColorChange = (e) => {
    const value = e.target.value;
    setColorValue(value);
    formDataRef.current.color = value;
    
    focusStateRef.current = {
      activeElement: e.target,
      activeElementId: 'color'
    };
  };
  
  const handleColorSelect = (color) => {
    setColorValue(color);
    formDataRef.current.color = color;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formDataRef.current.name.trim()) {
      newErrors.name = 'Column name is required';
    }
    
    if (formDataRef.current.wip_limit && parseInt(formDataRef.current.wip_limit) < 1) {
      newErrors.wip_limit = 'WIP limit must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validateForm()) {
      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    
    const data = {
      ...formDataRef.current,
      wip_limit: formDataRef.current.wip_limit ? parseInt(formDataRef.current.wip_limit) : null
    };
    
    setIsLoading(true);
    
    try {
      if (isEditMode) {
        await API.columns.updateColumn(initialData.id, data);
      } else {
        await API.columns.createColumn(data);
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error submitting column form:', err);
      const responseErrors = err.response?.data || {};
      
      const serverErrors = {};
      
      for (const key in responseErrors) {
        if (Array.isArray(responseErrors[key])) {
          serverErrors[key] = responseErrors[key][0];
        } else if (typeof responseErrors[key] === 'string') {
          serverErrors[key] = responseErrors[key];
        }
      }
      
      setErrors(serverErrors);
      
      if (serverErrors.name && nameInputRef.current) {
        nameInputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedColors = [
    '#e2e8f0', // gray
    '#feb2b2', // red
    '#fbd38d', // orange
    '#faf089', // yellow
    '#9ae6b4', // green
    '#90cdf4', // blue
    '#d6bcfa', // purple
    '#fbb6ce', // pink
  ];

  const handleCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  if (!isOpen && !isRendered) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      aria-modal="true"
      role="dialog"
      aria-labelledby="column-drawer-title"
    >
      <div 
        className={`absolute inset-0 bg-gray-500 transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-75' : 'bg-opacity-0'
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      ></div>
      
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div 
          ref={drawerRef}
          className={`relative w-screen max-w-md transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
              <h2 
                id="column-drawer-title" 
                className="text-lg font-medium text-white"
              >
                {isEditMode ? 'Edit Column' : 'Create New Column'}
              </h2>
              <button
                type="button"
                className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel(e);
                }}
                aria-label="Close panel"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div 
                onClick={(e) => e.stopPropagation()} 
                onMouseDown={(e) => e.stopPropagation()}
                className="p-6"
              >
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1.5">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          ref={nameInputRef}
                          required
                          className={`block w-full px-3 py-2 h-11 border-2 ${
                            errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          } rounded-md shadow-none placeholder-gray-400 focus:outline-none text-sm transition-all duration-150 hover:border-gray-400`}
                          value={nameValue}
                          onChange={handleNameChange}
                          placeholder="Enter column name"
                          onFocus={() => {
                            focusStateRef.current = {
                              activeElement: nameInputRef.current,
                              activeElementId: 'name'
                            };
                          }}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-800 mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-md border ${
                              colorValue === color ? 'border-2 border-blue-500' : 'border-gray-300'
                            } hover:opacity-90 transition-all`}
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleColorSelect(color);
                            }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center">
                        <div className="w-11 h-11 rounded-md mr-3 border border-gray-300" style={{ backgroundColor: colorValue }}></div>
                        <input
                          id="color"
                          name="color"
                          type="color"
                          className="h-11 flex-1 rounded-md border-2 border-gray-300 cursor-pointer"
                          value={colorValue}
                          onChange={handleColorChange}
                          onFocus={(e) => {
                            focusStateRef.current = {
                              activeElement: e.target,
                              activeElementId: 'color'
                            };
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="wip_limit" className="block text-sm font-medium text-gray-800 mb-1.5">
                        WIP Limit <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <div className="relative rounded-md">
                        <input
                          id="wip_limit"
                          name="wip_limit"
                          type="number"
                          min="1"
                          className={`block w-full px-3 py-2 h-11 border-2 ${
                            errors.wip_limit ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          } rounded-md shadow-none placeholder-gray-400 focus:outline-none text-sm transition-all duration-150 hover:border-gray-400`}
                          value={wipLimitValue}
                          onChange={handleWipLimitChange}
                          placeholder="Leave empty for no limit"
                          onFocus={(e) => {
                            focusStateRef.current = {
                              activeElement: e.target,
                              activeElementId: 'wip_limit'
                            };
                          }}
                        />
                      </div>
                      {errors.wip_limit ? (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.wip_limit}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Set a limit to restrict the number of tasks in this column
                        </p>
                      )}
                    </div>
                    
                    {errors.position && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
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
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 h-11 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:border-gray-400 transition-all duration-200"
                    >
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
                        isEditMode ? 'Save Changes' : 'Create Column'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnDrawer;