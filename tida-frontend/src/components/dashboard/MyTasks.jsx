// src/components/dashboard/MyTasks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import { ComponentLoader } from '../common/PageLoader';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [view, setView] = useState('list');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await API.tasks.getMyTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = tasks;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    filtered = filtered.filter(task => {
      if (filter === 'all') return true;
      
      if (!task.due_date) return filter === 'no-date';
      
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      if (filter === 'today') {
        return dueDate.getTime() === today.getTime();
      } else if (filter === 'upcoming') {
        return dueDate.getTime() > today.getTime();
      } else if (filter === 'overdue') {
        return dueDate.getTime() < today.getTime();
      }
      return true;
    });
    
    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const getDueDateClasses = (dueDate) => {
    if (!dueDate) return 'text-gray-500';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() < today.getTime()) {
      return 'text-red-600 font-medium';
    } else if (taskDate.getTime() === today.getTime()) {
      return 'text-orange-600 font-medium';
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (taskDate.getTime() === tomorrow.getTime()) {
        return 'text-yellow-600';
      }
    }
    
    return 'text-gray-500';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (taskDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
            Low
          </span>
        );
    }
  };

  const getStatsForFilter = (filterType) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (filterType === 'all') return true;
      
      if (!task.due_date) return filterType === 'no-date';
      
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      if (filterType === 'today') {
        return dueDate.getTime() === today.getTime();
      } else if (filterType === 'upcoming') {
        return dueDate.getTime() > today.getTime();
      } else if (filterType === 'overdue') {
        return dueDate.getTime() < today.getTime();
      }
      return true;
    }).length;
  };

  const getKanbanData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const columns = {
      overdue: {
        title: "Overdue",
        icon: (
          <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        colorClass: "bg-red-50 border-red-200",
        headerClass: "text-red-700 bg-red-50",
        tasks: []
      },
      today: {
        title: "Today",
        icon: (
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        colorClass: "bg-green-50 border-green-200",
        headerClass: "text-green-700 bg-green-50",
        tasks: []
      },
      upcoming: {
        title: "Upcoming",
        icon: (
          <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        colorClass: "bg-yellow-50 border-yellow-200",
        headerClass: "text-yellow-700 bg-yellow-50",
        tasks: []
      },
      noDate: {
        title: "No Date",
        icon: (
          <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        colorClass: "bg-purple-50 border-purple-200",
        headerClass: "text-purple-700 bg-purple-50",
        tasks: []
      }
    };

    filteredTasks.forEach(task => {
      if (!task.due_date) {
        columns.noDate.tasks.push(task);
        return;
      }
      
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate.getTime() < today.getTime()) {
        columns.overdue.tasks.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        columns.today.tasks.push(task);
      } else {
        columns.upcoming.tasks.push(task);
      }
    });
    
    return columns;
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <ComponentLoader message="Loading your tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button 
              onClick={() => fetchTasks()} 
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-md transition-colors duration-150 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">
            My Tasks
          </h1>
          <p className="mt-1 text-gray-600">
            You have {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-150"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              <div className="hidden md:flex bg-gray-50 rounded-md border border-gray-200 p-0.5">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 text-sm rounded-md focus:outline-none transition-colors duration-150 ${
                    view === 'list'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </div>
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1.5 text-sm rounded-md focus:outline-none transition-colors duration-150 ${
                    view === 'kanban'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Kanban
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors duration-150 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>All Tasks</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {getStatsForFilter('all')}
              </span>
            </button>
            
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors duration-150 ${
                filter === 'today'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Today</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === 'today' 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {getStatsForFilter('today')}
              </span>
            </button>
            
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors duration-150 ${
                filter === 'upcoming'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Upcoming</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === 'upcoming' 
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {getStatsForFilter('upcoming')}
              </span>
            </button>
            
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors duration-150 ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Overdue</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === 'overdue' 
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {getStatsForFilter('overdue')}
              </span>
            </button>
            
            <button
              onClick={() => setFilter('no-date')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors duration-150 ${
                filter === 'no-date'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>No Date</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === 'no-date' 
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {getStatsForFilter('no-date')}
              </span>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-medium text-gray-800 mb-2">No tasks found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery ? (
                  <>
                    No tasks match your search "{searchQuery}". Try adjusting your search or filters.
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                    >
                      Clear search
                    </button>
                  </>
                ) : filter === 'all' ? (
                  <>
                    <span>You don't have any assigned tasks yet.</span>
                  </>
                ) : (
                  `You don't have any ${filter} tasks.`
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {view === 'list' && (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                      <li key={task.id} className="block hover:bg-gray-50 transition-all duration-150 rounded">
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/tasks/${task.id}`}
                                className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors duration-150"
                              >
                                {task.title}
                              </Link>
                              
                              {task.description && (
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {task.due_date && (
                                  <span className={`inline-flex items-center ${getDueDateClasses(task.due_date)} px-2 py-1 bg-gray-50 rounded`}>
                                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDueDate(task.due_date)}
                                  </span>
                                )}
                                
                                {task.column && task.column.board && (
                                  <Link
                                    to={`/boards/${task.column.board.id}`}
                                    className="inline-flex items-center hover:text-blue-600 px-2 py-1 bg-gray-50 rounded transition-colors duration-150"
                                  >
                                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                    {task.column.board.name} &rsaquo; {task.column.name}
                                  </Link>
                                )}
                                
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-50 rounded">
                                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {task.subtasks.filter(st => st.is_completed).length}/{task.subtasks.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                              {getPriorityTag(task.priority)}
                              <Link
                                to={`/tasks/${task.id}`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-150"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {view === 'kanban' && (
                <div className="kanban-board grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(getKanbanData()).map(([columnKey, column]) => (
                    <div 
                      key={columnKey} 
                      className={`kanban-column rounded-lg border ${column.colorClass} overflow-hidden flex flex-col`}
                    >
                      <div className={`p-3 border-b ${column.headerClass} flex items-center justify-between`}>
                        <div className="flex items-center">
                          {column.icon}
                          <h3 className="font-medium ml-2">{column.title}</h3>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-white bg-opacity-50 rounded-full">
                            {column.tasks.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
                        {column.tasks.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            <p>No tasks</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {column.tasks.map(task => (
                              <div 
                                key={task.id} 
                                className="task-card bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                              >
                                <Link 
                                  to={`/tasks/${task.id}`}
                                  className="block"
                                >
                                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                                  
                                  {task.description && (
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      {task.due_date && (
                                        <span className={`text-xs ${getDueDateClasses(task.due_date)} flex items-center`}>
                                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {formatDueDate(task.due_date)}
                                        </span>
                                      )}
                                      
                                      {task.subtasks && task.subtasks.length > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center">
                                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                          {task.subtasks.filter(st => st.is_completed).length}/{task.subtasks.length}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {getPriorityTag(task.priority)}
                                  </div>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;