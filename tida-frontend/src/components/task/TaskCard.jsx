import React, { useState, useCallback, memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import TaskDrawer from './TaskDrawer';

const TaskCard = memo(({ task, index, columnId, onTaskUpdated, onTaskDeleted }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }, []);
  
  const handleClick = useCallback((e) => {
    if (e.defaultPrevented) return;
    setIsDrawerOpen(true);
  }, []);
  
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);
  
  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.is_completed).length || 0;
  const progressPercentage = subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0;
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) return '';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      if (dateOnly.getTime() === today.getTime()) {
        return 'Today';
      } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      }
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }, []);
  
  const getInitials = useCallback((name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }, []);
  
  return (
    <>
      <Draggable 
        draggableId={task.id.toString()} 
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-2 bg-white rounded-lg border ${isOverdue ? 'border-red-200' : 'border-gray-200'} ${
              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
            } ${isHovered ? 'ring-2 ring-blue-200' : ''} transition-all duration-150 hover:shadow-md`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-column-id={columnId}
            data-task-id={task.id}
          >
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 break-words pr-2">
                  {task.title}
                </h3>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority ? task.priority.charAt(0).toUpperCase() : '-'}
                </span>
              </div>
              
              {task.description && (
                <p className="mt-1 text-xs text-gray-600 line-clamp-2 break-words mb-2">
                  {task.description}
                </p>
              )}
              
              {subtaskCount > 0 && (
                <div className="mt-2 mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                      <svg className="inline h-3 w-3 mr-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {completedSubtasks}/{subtaskCount}
                    </span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag.id}
                      className="inline-block px-2 py-0.5 text-xs rounded-full truncate max-w-[80px]"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                        border: `1px solid ${tag.color}`
                      }}
                      title={tag.name}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="mt-2 flex items-center justify-between">
                {task.due_date ? (
                  <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    <svg className={`h-3.5 w-3.5 mr-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(task.due_date)}
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}
                
                {task.assigned_to && (
                  <div className="flex items-center justify-center ml-2" title={`Assigned to: ${task.assigned_to.username}`}>
                    {task.assigned_to.avatar ? (
                      <img
                        className="h-6 w-6 rounded-full ring-2 ring-white"
                        src={task.assigned_to.avatar}
                        alt={task.assigned_to.username}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-medium ring-2 ring-white">
                        {getInitials(task.assigned_to.username)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-500 flex items-center space-x-4 border-t border-gray-200 rounded-b-lg">
              {task.comments?.length > 0 && (
                <div className="flex items-center" title={`${task.comments.length} comments`}>
                  <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {task.comments.length}
                </div>
              )}
              
              {task.attachments?.length > 0 && (
                <div className="flex items-center" title={`${task.attachments.length} attachments`}>
                  <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {task.attachments.length}
                </div>
              )}
              
              {(isOverdue && task.due_date) && (
                <div className="flex items-center text-red-600">
                  <svg className="h-3.5 w-3.5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Overdue
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
      
      <TaskDrawer 
        taskId={task.id}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onTaskUpdated={onTaskUpdated}
        onTaskDeleted={onTaskDeleted}
      />
    </>
  );
});

export default TaskCard;