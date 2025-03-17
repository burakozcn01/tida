import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BoardFormDrawer from './BoardFormDrawer';

const BoardList = ({ projectId, boards = [], isLoading = false }) => {
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  const filteredBoards = boards.filter(board => 
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sortedBoards = [...filteredBoards].sort((a, b) => {
    switch (sortOrder) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'columns-asc':
        return (a.columns?.length || 0) - (b.columns?.length || 0);
      case 'columns-desc':
        return (b.columns?.length || 0) - (a.columns?.length || 0);
      default:
        return 0;
    }
  });

  const openNewBoardDrawer = () => {
    setEditingBoard(null);
    setIsFormDrawerOpen(true);
  };

  const openEditBoardDrawer = (board) => {
    setEditingBoard(board);
    setIsFormDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsFormDrawerOpen(false);
    setEditingBoard(null);
  };

  const handleBoardSuccess = () => {
    setIsFormDrawerOpen(false);
    setEditingBoard(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Boards
          {boards.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {boards.length}
            </span>
          )}
        </h2>
        
        <button
          onClick={openNewBoardDrawer}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Board
        </button>
      </div>
      
      {boards.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-gray-50 p-3 rounded-lg">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search boards..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-60 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center w-full sm:w-auto">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select
              id="sort"
              className="border border-gray-300 rounded-md pl-3 pr-8 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="columns-asc">Columns (Low-High)</option>
              <option value="columns-desc">Columns (High-Low)</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">No boards yet</h3>
          <p className="mt-1 text-gray-500 max-w-md mx-auto">
            Create a board to start organizing your tasks into columns and track your progress.
          </p>
          <button
            onClick={openNewBoardDrawer}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Board
          </button>
        </div>
      ) : sortedBoards.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600">No matching boards found</h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBoards.map((board) => (
            <div
              key={board.id}
              className="group flex flex-col h-full bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-5 overflow-hidden relative"
            >
              <Link
                to={`/boards/${board.id}`}
                className="absolute inset-0 z-0"
                aria-hidden="true"
              />
              <div className="flex-1 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {board.name}
                  </h3>
                  <span className="flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {board.columns?.length || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {board.description || 'No description provided'}
                </p>
              </div>
              
              <div className="pt-3 mt-auto border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 relative z-10">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {board.columns?.length || 0} {board.columns?.length === 1 ? 'column' : 'columns'}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditBoardDrawer(board);
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative z-20"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  
                  <Link
                    to={`/boards/${board.id}`}
                    className="inline-flex items-center text-blue-600 relative z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="mr-1">View</span>
                    <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BoardFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={closeDrawer}
        projectId={projectId}
        initialData={editingBoard}
        onSuccess={handleBoardSuccess}
      />
    </div>
  );
};

export default BoardList;