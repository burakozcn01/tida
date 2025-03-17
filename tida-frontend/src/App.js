// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';
import PageLoader from './components/common/PageLoader';

const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const MyTasks = lazy(() => import('./components/dashboard/MyTasks'));
const ProjectList = lazy(() => import('./components/project/ProjectList'));
const ProjectDetail = lazy(() => import('./components/project/ProjectDetail'));
const BoardView = lazy(() => import('./components/column/BoardView'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/boards/:boardId" element={<BoardView />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
      
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        
        <ToastContainer 
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={3}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;