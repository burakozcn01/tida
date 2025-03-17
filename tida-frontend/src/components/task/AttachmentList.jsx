import React, { useState } from 'react';
import API from '../../api/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const AttachmentList = ({ taskId, attachments, onAttachmentsChange }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File size cannot exceed 100MB. Selected file: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      setFile(selectedFile);
      setName(selectedFile.name);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('task', taskId);
      
      const axiosInstance = API.attachments.getAxiosInstance();
      
      await axiosInstance.post('attachments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setFile(null);
      setName('');
      setUploadProgress(0);
      
      if (onAttachmentsChange) onAttachmentsChange();
      
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error('Error uploading file:', err);
      
      const errorMessage = err.response?.data?.file?.[0] || 
                          err.response?.data?.detail || 
                          'An error occurred while uploading the file';
      
      setError(errorMessage);
      toast.error('File could not be uploaded');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await API.attachments.deleteAttachment(attachmentId);
        
        if (onAttachmentsChange) onAttachmentsChange();
        
        toast.success('File deleted');
      } catch (err) {
        console.error('Error deleting file:', err);
        toast.error('An error occurred while deleting the file');
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Attachments</h2>
      
      <form onSubmit={handleUpload} className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 100MB
              </p>
            </div>
            
            {file && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {uploadProgress}%
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !file}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {attachments.length === 0 ? (
        <p className="text-gray-500 italic">No files yet. Upload a file from above.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="ml-3">
                  <a
                    href={attachment.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {attachment.name}
                  </a>
                  <div className="text-xs text-gray-500">
                    <span>Uploaded by: {attachment.uploaded_by.username}</span>
                    <span className="mx-1">•</span>
                    <span>{format(new Date(attachment.uploaded_at), 'dd.MM.yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentList;
