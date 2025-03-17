import React from 'react';
import Column from './Column';

const ColumnList = ({ columns = [], onColumnUpdate, onTaskCreated, onTaskUpdated, onTaskDeleted }) => {
  const safeColumns = (columns || []).map(col => ({
    ...col,
    tasks: Array.isArray(col.tasks) ? col.tasks.sort((a, b) => a.position - b.position) : [],
    id: col.id
  }));
  
  const moveColumnLeft = (columnId) => {
    const columnIndex = safeColumns.findIndex(c => c.id === columnId);
    if (columnIndex > 0) {
      const newOrder = safeColumns.map(c => c.id);
      [newOrder[columnIndex], newOrder[columnIndex - 1]] = [newOrder[columnIndex - 1], newOrder[columnIndex]];
      onColumnUpdate && onColumnUpdate(newOrder);
    }
  };

  const moveColumnRight = (columnId) => {
    const columnIndex = safeColumns.findIndex(c => c.id === columnId);
    if (columnIndex < safeColumns.length - 1) {
      const newOrder = safeColumns.map(c => c.id);
      [newOrder[columnIndex], newOrder[columnIndex + 1]] = [newOrder[columnIndex + 1], newOrder[columnIndex]];
      onColumnUpdate && onColumnUpdate(newOrder);
    }
  };
  
  return (
    <div 
      className="flex h-full"
      style={{ 
        overflowX: 'auto',
        paddingBottom: '16px',
      }}
    >
      {safeColumns.map((column, index) => (
        <div
          key={column.id.toString()}
          className="h-full mx-2 first:ml-4 flex flex-col"
        >
          <Column
            column={column}
            dragHandleProps={null}
            onUpdate={onColumnUpdate}
            onTaskCreated={onTaskCreated}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
            showMoveButtons={true}
            onMoveLeft={() => moveColumnLeft(column.id)}
            onMoveRight={() => moveColumnRight(column.id)}
            isLeftmost={index === 0}
            isRightmost={index === safeColumns.length - 1}
          />
        </div>
      ))}
      
      {safeColumns.length === 0 && (
        <div className="flex items-center justify-center w-full ml-4">
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <svg className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 font-medium mb-1">No columns yet</p>
            <p className="text-gray-500 text-sm">Add your first column to get started with your board.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnList;