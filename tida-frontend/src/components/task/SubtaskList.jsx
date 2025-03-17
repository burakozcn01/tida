import React, { useState } from 'react';
import API from '../../api/api';

const SubtaskList = ({ taskId, subtasks, onSubtasksChange }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    
    if (!newSubtaskTitle.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await API.subtasks.createSubtask({
        title: newSubtaskTitle,
        task: taskId,
      });
      
      setNewSubtaskTitle('');
      if (onSubtasksChange) onSubtasksChange();
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError('Failed to add subtask.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (subtask) => {
    try {
      await API.subtasks.updateSubtask(subtask.id, {
        is_completed: !subtask.is_completed,
        title: subtask.title,
        task: taskId
      });
      
      if (onSubtasksChange) onSubtasksChange();
    } catch (err) {
      console.error('Error updating subtask:', err);
    }
  };

  const handleEditStart = (subtask) => {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditSubmit = async (subtask) => {
    if (!editTitle.trim()) return;
    
    try {
      await API.subtasks.updateSubtask(subtask.id, {
        title: editTitle,
        task: taskId,
        is_completed: subtask.is_completed
      });
      
      setEditingId(null);
      if (onSubtasksChange) onSubtasksChange();
    } catch (err) {
      console.error('Error updating subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      try {
        await API.subtasks.deleteSubtask(subtaskId);
        if (onSubtasksChange) onSubtasksChange();
      } catch (err) {
        console.error('Error deleting subtask:', err);
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Subtasks</h2>
      
      <form onSubmit={handleAddSubtask} className="mb-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Add a new subtask..."
            className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newSubtaskTitle.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </form>
      
      {subtasks.length === 0 ? (
        <p className="text-gray-500 italic">No subtasks yet. Add one above.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="py-3">
              {editingId === subtask.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-1 mr-2 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSubmit(subtask)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={subtask.is_completed}
                      onChange={() => handleToggleComplete(subtask)}
                    />
                    <span className={`ml-3 ${subtask.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditStart(subtask)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubtaskList;