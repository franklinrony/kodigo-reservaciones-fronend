import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SyncProvider } from './contexts/SyncContext';
import { BoardPermissionsProvider } from './contexts/BoardPermissionsContext';
import { SyncIndicator } from './components/ui/SyncIndicator';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { BoardsPage } from './pages/BoardsPage';
import { BoardPage } from './pages/BoardPage';
import { PreviewPage } from './pages/PreviewPage';

function App() {
  return (
    <SyncProvider>
      <NotificationProvider>
        <AuthProvider>
          <BoardPermissionsProvider>
            <Router>
              <SyncIndicator />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
              
              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
            
            <Route
              path="/boards"
              element={
                <Layout>
                  <ProtectedRoute>
                    <BoardsPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            
            <Route
              path="/board/:id"
              element={
                <ProtectedRoute>
                  <BoardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Temporary preview route */}
            <Route
              path="/preview"
              element={<PreviewPage />}
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </BoardPermissionsProvider>
    </AuthProvider>
    </NotificationProvider>
    </SyncProvider>
  );
}

export default App;