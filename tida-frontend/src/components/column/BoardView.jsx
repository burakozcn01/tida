import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import API from '../../api/api';
import ColumnList from '../column/ColumnList';
import ColumnDrawer from '../column/ColumnDrawer';
import TaskFormDrawer from '../task/TaskFormDrawer'; 
import { toast } from 'react-toastify';

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false); 
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [showNewColumnDrawer, setShowNewColumnDrawer] = useState(false);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.boards.getBoard(boardId);
      setBoard(data);
      
      const columnsData = await API.columns.getBoardColumns(boardId);
      
      const columnsWithTasks = columnsData.map(col => ({
        ...col,
        tasks: Array.isArray(col.tasks) ? [...col.tasks] : []
      }));
      
      const sortedColumns = columnsWithTasks.sort((a, b) => a.position - b.position);
      setColumns(sortedColumns);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching board:', err);
      setError('Failed to load board details.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleTaskUpdated = useCallback(() => {
    fetchBoard();
    if (typeof toast !== 'undefined') {
      toast.success('Task updated successfully');
    }
  }, [fetchBoard]);

  const handleTaskDeleted = useCallback((taskId) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskId)
      }));
    });
    
    if (typeof toast !== 'undefined') {
      toast.success('Task deleted successfully');
    }
  }, []);

  const handleDragEnd = async (result) => {
    const { source, destination, type, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    if (type === 'TASK') {
      try {
        const newColumns = columns.map(col => ({
          ...col,
          tasks: [...col.tasks]
        }));
        
        const sourceColumn = newColumns.find(
          col => col.id.toString() === source.droppableId
        );
        
        const destColumn = newColumns.find(
          col => col.id.toString() === destination.droppableId
        );
        
        if (!sourceColumn || !destColumn) return;
        
        const taskIndex = sourceColumn.tasks.findIndex(
          task => task.id.toString() === draggableId
        );
        
        if (taskIndex === -1) return;
        
        const [task] = sourceColumn.tasks.splice(taskIndex, 1);
        
        const updatedTask = {
          ...task,
          column: parseInt(destination.droppableId, 10)
        };
        
        destColumn.tasks.splice(destination.index, 0, updatedTask);
        
        sourceColumn.tasks.forEach((task, idx) => {
          task.position = idx;
        });
        
        destColumn.tasks.forEach((task, idx) => {
          task.position = idx;
        });
        
        setColumns(newColumns);
        
        await API.tasks.reorderTasks(
          parseInt(source.droppableId, 10),
          parseInt(destination.droppableId, 10),
          destColumn.tasks.map(task => task.id)
        );
      } catch (error) {
        console.error('Error during drag operation:', error);
        fetchBoard();
      }
    }
  };

  const handleColumnReorder = async (newOrder) => {
    try {
      await API.columns.reorderColumns(boardId, newOrder);
      fetchBoard();
    } catch (error) {
      console.error('Column reordering error:', error);
      fetchBoard();
    }
  };

  const handleTaskFormClose = () => {
    setIsTaskFormOpen(false);
    setSelectedColumn(null);
  };

  const handleTaskFormSuccess = () => {
    setIsTaskFormOpen(false);
    setSelectedColumn(null);
    fetchBoard();
    if (typeof toast !== 'undefined') {
      toast.success('Task saved successfully');
    }
  };

  const handleColumnCreated = () => {
    setShowNewColumnDrawer(false);
    fetchBoard();
    if (typeof toast !== 'undefined') {
      toast.success('Column created successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md shadow-sm mt-4" role="alert">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-600">Board not found</h2>
        <p className="mt-2 text-gray-500">The board you're looking for doesn't exist or you don't have access.</p>
        <button 
          onClick={() => navigate('/boards')} 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Boards
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{board.name}</h1>
          </div>
          <p className="mt-1 text-gray-600 text-sm">
            {board.description || 'No description provided'}
          </p>
          {board.project && (
            <div className="mt-2">
              <Link to={`/projects/${board.project}`} className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Project
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 ml-auto">
          <button
            onClick={() => setShowNewColumnDrawer(true)}
            className="inline-flex items-center px-3 py-2 border-2 border-blue-600 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:border-blue-800 transition-all duration-200"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Column
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <ColumnList 
            columns={columns} 
            onColumnUpdate={handleColumnReorder}
            onTaskCreated={fetchBoard}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onAddTask={(columnId) => {
              setSelectedColumn(columnId);
              setIsTaskFormOpen(true);
            }}
          />
        </DragDropContext>
      </div>
      
      <ColumnDrawer
        isOpen={showNewColumnDrawer}
        onClose={() => setShowNewColumnDrawer(false)}
        boardId={parseInt(boardId)}
        onSuccess={handleColumnCreated}
      />
      
      <TaskFormDrawer
        isOpen={isTaskFormOpen}
        onClose={handleTaskFormClose}
        columnId={selectedColumn}
        onSuccess={handleTaskFormSuccess}
      />
    </div>
  );
};

export default BoardView;