import React, { ReactElement } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NgoDetailPage from './pages/NgoDetailPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './auth/AuthContext';

const PrivateRoute: React.FC<{ children: ReactElement, role: 'admin' | 'student' }> = ({ children, role }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (user?.role !== role) {
        // If wrong role, redirect to home or a dedicated 'unauthorized' page
        return <Navigate to="/" replace />;
    }
    return children;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ngo/:ngoId" element={<NgoDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={
              <PrivateRoute role="student">
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;