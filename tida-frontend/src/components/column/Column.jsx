import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import API from '../../api/api';
import TaskCard from '../task/TaskCard';
import ColumnDrawer from './ColumnDrawer';
import TaskFormDrawer from '../task/TaskFormDrawer'; 
import DeleteConfirmDialog from './DeleteConfirmDialog';

const Column = ({ 
  column, 
  onUpdate, 
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  showMoveButtons = false, 
  onMoveLeft = () => {},
  onMoveRight = () => {},
  isLeftmost = false,
  isRightmost = false
}) => {
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false); 
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeColumn = {
    ...column,
    tasks: Array.isArray(column.tasks) ? column.tasks : [],
    id: column.id
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await API.columns.deleteColumn(safeColumn.id);
      setShowDeleteDialog(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting column:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasReachedWipLimit = safeColumn.wip_limit > 0 && safeColumn.tasks.length >= safeColumn.wip_limit;

  const getTextColor = (bgColor) => {
    if (!bgColor) return '#000000';
    
    const hex = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return '#000000';
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const columnColor = safeColumn.color || '#e2e8f0';
  const textColor = getTextColor(columnColor);
  
  const getLighterColor = (hexColor, opacity = 0.15) => {
    if (!hexColor) return 'rgba(226, 232, 240, 0.15)';
    
    const hex = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
    
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return 'rgba(226, 232, 240, 0.15)';
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const lighterColor = getLighterColor(columnColor);

  const handleTaskSuccess = () => {
    if (onTaskCreated) onTaskCreated();
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md w-72 h-full max-h-full border border-gray-200">
      <div 
        className="flex items-center justify-between px-3 py-2.5 rounded-t-lg"
        style={{ backgroundColor: columnColor, color: textColor }}
      >
        <div>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: textColor, opacity: 0.7 }}
            ></div>
            <h3 className="font-medium text-sm">{safeColumn.name}</h3>
          </div>
          {safeColumn.wip_limit > 0 && (
            <div className="text-xs mt-1" style={{ color: textColor, opacity: 0.9 }}>
              Tasks: {safeColumn.tasks.length} / {safeColumn.wip_limit}
              {hasReachedWipLimit && (
                <span className="ml-1 font-bold" style={{ color: textColor }}>
                  (Limit reached)
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-1">
          {showMoveButtons && (
            <>
              <button
                onClick={onMoveLeft}
                disabled={isLeftmost}
                className={`p-1 rounded transition-colors ${isLeftmost ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:bg-opacity-20'}`}
                style={{ color: textColor }}
                title="Move left"
                aria-label="Move left"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={onMoveRight}
                disabled={isRightmost}
                className={`p-1 rounded transition-colors ${isRightmost ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:bg-opacity-20'}`}
                style={{ color: textColor }}
                title="Move right"
                aria-label="Move right"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowEditDrawer(true)}
            className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            style={{ color: textColor }}
            title="Edit column"
            aria-label="Edit column"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            style={{ color: textColor }}
            title="Delete column"
            aria-label="Delete column"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <Droppable 
        droppableId={safeColumn.id.toString()} 
        type="TASK"
        isDropDisabled={hasReachedWipLimit === true}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-2"
            style={{
              backgroundColor: snapshot.isDraggingOver 
                ? lighterColor
                : '#fafafa',
              minHeight: '100px',
              overflowY: 'auto',
              height: '100%'
            }}
          >
            {safeColumn.tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-gray-400 text-sm">Drag tasks here or add a new task</p>
              </div>
            )}
            
            {safeColumn.tasks.map((task, index) => (
              <TaskCard 
                key={task.id.toString()}
                task={task} 
                index={index}
                columnId={safeColumn.id}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <TaskFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        columnId={safeColumn.id}
        initialData={null} 
        onSuccess={handleTaskSuccess}
      />
      
      <ColumnDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        boardId={safeColumn.board}
        initialData={safeColumn}
        onSuccess={() => {
          setShowEditDrawer(false);
          if (onUpdate) onUpdate();
        }}
      />
      
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Column"
        itemName="Column"
        isLoading={isDeleting}
      />
      
      <div className="p-2 border-t border-gray-200 rounded-b-lg">
        <button
          onClick={() => setIsFormDrawerOpen(true)} 
          disabled={hasReachedWipLimit}
          className={`w-full text-xs py-1.5 rounded-md flex items-center justify-center transition-colors ${
            hasReachedWipLimit
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : `text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200`
          }`}
          style={
            !hasReachedWipLimit 
              ? { 
                  background: lighterColor, 
                  color: getTextColor(columnColor) === '#FFFFFF' ? '#333333' : getTextColor(columnColor),
                  borderColor: columnColor,
                  borderWidth: '1px'
                } 
              : {}
          }
        >
          <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Task
          {hasReachedWipLimit && (
            <span className="ml-1">(WIP limit full)</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Column;