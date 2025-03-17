// src/components/task/CommentList.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/api';
import { format } from 'date-fns';

const CommentList = ({ taskId, comments, onCommentsChange }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await API.comments.createComment({
        content: newComment,
        task: taskId,
      });
      
      setNewComment('');
      if (onCommentsChange) onCommentsChange();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) return;
    
    try {
      await API.comments.updateComment(commentId, {
        content: editContent,
        task: taskId, 
      });
      
      setEditingId(null);
      if (onCommentsChange) onCommentsChange();
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await API.comments.deleteComment(commentId);
        if (onCommentsChange) onCommentsChange();
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
      
      <form onSubmit={handleAddComment} className="mb-6">
        <textarea
          placeholder="Add a new comment..."
          rows="3"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
      
      {comments.length === 0 ? (
        <p className="text-gray-500 italic">No comments yet. Add one above.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full mr-3"
                    src={comment.user.avatar || 'https://via.placeholder.com/40'}
                    alt={comment.user.username}
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{comment.user.username}</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {user.id === comment.user.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStart(comment)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {editingId === comment.id ? (
                <div className="mt-3">
                  <textarea
                    rows="3"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditSubmit(comment.id)}
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
                <div className="mt-3">
                  <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;