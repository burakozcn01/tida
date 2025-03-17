// src/components/common/PageLoader.jsx
import React from 'react';

const PageLoader = ({ message = "Loading content..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-200"></div>
        
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-blue-600 animate-spin"></div>
      </div>
      
      <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
      
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export const ComponentLoader = ({ size = "medium", message }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };
  
  const borderClasses = {
    small: "border-2",
    medium: "border-3",
    large: "border-4"
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full ${borderClasses[size]} border-blue-200`}></div>
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full ${borderClasses[size]} border-t-blue-600 animate-spin`}></div>
      </div>
      
      {message && <p className="mt-3 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default PageLoader;