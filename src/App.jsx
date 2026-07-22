import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { AuthLayout } from './layouts/AuthLayout';
import { AppShell } from './layouts/AppShell';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Attendance from './pages/Attendance';
import FaceAttendance from './pages/FaceAttendance';
import Reports from './pages/Reports';
import TeacherPanel from './pages/TeacherPanel';
import AdminPanel from './pages/AdminPanel';
import MyAttendance from './pages/MyAttendance';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Protected Application Routes */}
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="students/:id" element={<StudentProfile />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="face" element={<FaceAttendance />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="teacher" element={<TeacherPanel />} />
                  <Route path="admin" element={<AdminPanel />} />
                  <Route path="my-attendance" element={<MyAttendance />} />
                  <Route path="ai" element={<AIInsights />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
