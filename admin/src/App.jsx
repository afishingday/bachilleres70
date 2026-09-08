import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentEdit from './pages/StudentEdit';
import Submissions from './pages/Submissions';
import DataDeletionRequests from './pages/DataDeletionRequests';

export default function App() {
  const basename = '/admin';

  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estudiantes" element={<Students />} />
            <Route path="/estudiantes/:id" element={<StudentEdit />} />
            <Route path="/pendientes" element={<Submissions />} />
            <Route path="/solicitudes-borrado" element={<DataDeletionRequests />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
