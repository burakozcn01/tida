// src/api/api.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost/api/';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
  
export { axiosInstance };

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${baseURL}auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
const authAPI = {
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post('auth/token/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('accounts/register/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('accounts/users/me/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Projects API
const projectsAPI = {
  getProjects: async () => {
    try {
      const response = await axiosInstance.get('projects/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProject: async (id) => {
    try {
      const response = await axiosInstance.get(`projects/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await axiosInstance.post('projects/', projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const response = await axiosInstance.put(`projects/${id}/`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await axiosInstance.delete(`projects/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addMember: async (projectId, userId) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/add_member/`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/remove_member/`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  archiveProject: async (projectId) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/archive/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unarchiveProject: async (projectId) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/unarchive/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProjectFromTemplate: async (projectData) => {
    try {
      const response = await axiosInstance.post('projects/create_from_template/', projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createBoardFromTemplate: async (projectId, boardData) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/create_board_from_template/`, boardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Boards API
const boardsAPI = {
  getBoards: async () => {
    try {
      const response = await axiosInstance.get('boards/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBoard: async (id) => {
    try {
      const response = await axiosInstance.get(`boards/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProjectBoards: async (projectId) => {
    try {
      const response = await axiosInstance.get(`boards/project_boards/?project_id=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createBoard: async (boardData) => {
    try {
      const response = await axiosInstance.post('boards/', boardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateBoard: async (id, boardData) => {
    try {
      const response = await axiosInstance.put(`boards/${id}/`, boardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteBoard: async (id) => {
    try {
      const response = await axiosInstance.delete(`boards/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createBoardFromTemplate: async (projectId, boardData) => {
    try {
      const response = await axiosInstance.post(`projects/${projectId}/create_board_from_template/`, boardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Columns API
const columnsAPI = {
  getColumns: async () => {
    try {
      const response = await axiosInstance.get('columns/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBoardColumns: async (boardId) => {
    try {
      const response = await axiosInstance.get(`columns/board_columns/?board_id=${boardId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createColumn: async (columnData) => {
    try {
      const response = await axiosInstance.post('columns/', columnData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateColumn: async (id, columnData) => {
    try {
      const response = await axiosInstance.put(`columns/${id}/`, columnData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteColumn: async (id) => {
    try {
      const response = await axiosInstance.delete(`columns/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  reorderColumns: async (boardId, columnOrder) => {
    try {
      const response = await axiosInstance.post('columns/reorder/', {
        board_id: boardId,
        column_order: columnOrder
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Tasks API
const tasksAPI = {
  getTasks: async () => {
    try {
      const response = await axiosInstance.get('tasks/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTask: async (id) => {
    try {
      const response = await axiosInstance.get(`tasks/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getColumnTasks: async (columnId) => {
    try {
      const response = await axiosInstance.get(`tasks/column_tasks/?column_id=${columnId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await axiosInstance.post('tasks/', taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await axiosInstance.put(`tasks/${id}/`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await axiosInstance.delete(`tasks/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  reorderTasks: async (sourceColumnId, destinationColumnId, taskOrder) => {
    try {
      const response = await axiosInstance.post('tasks/reorder/', {
        source_column_id: sourceColumnId,
        destination_column_id: destinationColumnId,
        task_order: taskOrder
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  assignTask: async (taskId, userId) => {
    try {
      const response = await axiosInstance.post(`tasks/${taskId}/assign/`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyTasks: async () => {
    try {
      const response = await axiosInstance.get('tasks/my_tasks/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  filterTasksByDate: async (startDate, endDate) => {
    try {
      let url = 'tasks/date_filter/?';
      if (startDate) url += `start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  filterTasksByTags: async (tagIds) => {
    try {
      const response = await axiosInstance.get(`tasks/filter_by_tags/?tag_ids=${tagIds.join(',')}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Subtasks API
const subtasksAPI = {
  getSubtasks: async () => {
    try {
      const response = await axiosInstance.get('subtasks/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTaskSubtasks: async (taskId) => {
    try {
      const response = await axiosInstance.get(`subtasks/task_subtasks/?task_id=${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createSubtask: async (subtaskData) => {
    try {
      const response = await axiosInstance.post('subtasks/', subtaskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSubtask: async (id, subtaskData) => {
    try {
      const response = await axiosInstance.put(`subtasks/${id}/`, subtaskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSubtask: async (id) => {
    try {
      const response = await axiosInstance.delete(`subtasks/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Tags API
const tagsAPI = {
  getTags: async () => {
    try {
      const response = await axiosInstance.get('tags/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTag: async (tagData) => {
    try {
      const response = await axiosInstance.post('tags/', tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTag: async (id, tagData) => {
    try {
      const response = await axiosInstance.put(`tags/${id}/`, tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await axiosInstance.delete(`tags/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addTagToTask: async (tagId, taskId) => {
    try {
      const response = await axiosInstance.post(`tags/${tagId}/add_to_task/`, { task_id: taskId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeTagFromTask: async (tagId, taskId) => {
    try {
      const response = await axiosInstance.post(`tags/${tagId}/remove_from_task/`, { task_id: taskId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Comments API
const commentsAPI = {
  getTaskComments: async (taskId) => {
    try {
      const response = await axiosInstance.get(`comments/task_comments/?task_id=${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createComment: async (commentData) => {
    try {
      const response = await axiosInstance.post('comments/', commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateComment: async (id, commentData) => {
    try {
      const response = await axiosInstance.put(`comments/${id}/`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (id) => {
    try {
      const response = await axiosInstance.delete(`comments/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Attachments API
const attachmentsAPI = {
    getAxiosInstance: () => {
      return axiosInstance;
    },
    
    getTaskAttachments: async (taskId) => {
      try {
        const response = await axiosInstance.get(`attachments/task_attachments/?task_id=${taskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    uploadAttachment: async (formData) => {
      try {
        const response = await axiosInstance.post('attachments/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    deleteAttachment: async (id) => {
      try {
        const response = await axiosInstance.delete(`attachments/${id}/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };

// Users API
const usersAPI = {
  getUsers: async () => {
    try {
      const response = await axiosInstance.get('accounts/users/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      const response = await axiosInstance.get(`accounts/users/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const isFormData = userData instanceof FormData;
      
      const response = await axiosInstance.put(`accounts/users/${id}/`, userData, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const API = {
  auth: authAPI,
  projects: projectsAPI,
  boards: boardsAPI,
  columns: columnsAPI,
  tasks: tasksAPI,
  subtasks: subtasksAPI,
  tags: tagsAPI,
  comments: commentsAPI,
  attachments: attachmentsAPI,
  users: usersAPI,
};

export default API;