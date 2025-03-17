// src/components/task/TagList.jsx
import React, { useState, useEffect } from 'react';
import API from '../../api/api';

const TagList = ({ taskId, tags, onTagsChange }) => {
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3490dc');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await API.tags.getTags();
      setAllTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId) => {
    try {
      await API.tags.addTagToTask(tagId, taskId);
      if (onTagsChange) onTagsChange();
    } catch (err) {
      console.error('Error adding tag to task:', err);
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await API.tags.removeTagFromTask(tagId, taskId);
      if (onTagsChange) onTagsChange();
    } catch (err) {
      console.error('Error removing tag from task:', err);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    
    if (!newTagName.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await API.tags.createTag({
        name: newTagName,
        color: newTagColor,
      });
      
      setNewTagName('');
      setNewTagColor('#3490dc');
      setShowTagForm(false);
      fetchTags();
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('Failed to create tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTagApplied = (tagId) => {
    return tags.some(tag => tag.id === tagId);
  };

  const availableTags = allTags.filter(tag => !isTagApplied(tag.id));

  const predefinedColors = [
    '#3490dc', // blue
    '#f56565', // red
    '#ed8936', // orange
    '#ecc94b', // yellow
    '#48bb78', // green
    '#9f7aea', // purple
    '#ed64a6', // pink
    '#a0aec0', // gray
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="inline-flex items-center justify-between px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}`
            }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-2 text-current hover:text-red-500"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <button
          onClick={() => setShowTagForm(!showTagForm)}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showTagForm ? 'Cancel' : 'Add Tag'}
        </button>
      </div>
      
      {showTagForm && (
        <div className="bg-gray-50 rounded-md p-4 mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Tags</h3>
          
          {loading ? (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}`
                  }}
                >
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic mb-4">No tags available. Create a new one below.</p>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Tag</h3>
            
            <form onSubmit={handleCreateTag}>
              <div className="mb-3">
                <label htmlFor="newTagName" className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="newTagName"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="newTagColor" className="block text-xs font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full ${
                        newTagColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <input
                  id="newTagColor"
                  type="color"
                  className="h-8 w-full"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                />
              </div>
              
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newTagName.trim()}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagList;