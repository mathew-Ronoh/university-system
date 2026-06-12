import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminUnits from './pages/admin/Units';
import AdminSemesters from './pages/admin/Semesters';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSalaries from './pages/admin/Salaries';
import AdminEnrollments from './pages/admin/Enrollments';

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentUnits from './pages/student/Units';
import StudentTranscript from './pages/student/Transcript';
import StudentFees from './pages/student/Fees';

import LecturerDashboard from './pages/lecturer/Dashboard';
import LecturerProfile from './pages/lecturer/Profile';
import CourseStudents from './pages/lecturer/CourseStudents';
import LecturerSalary from './pages/lecturer/Salary';

import FinanceDashboard from './pages/finance/Dashboard';
import StudentFeesPage from './pages/finance/StudentFees';
import FinanceReports from './pages/finance/Reports';

function ProtectedLayout({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedLayout roles={['admin']}><AdminDashboard /></ProtectedLayout>} />
          <Route path="/admin/users" element={<ProtectedLayout roles={['admin']}><AdminUsers /></ProtectedLayout>} />
          <Route path="/admin/courses" element={<ProtectedLayout roles={['admin']}><AdminCourses /></ProtectedLayout>} />
          <Route path="/admin/units" element={<ProtectedLayout roles={['admin']}><AdminUnits /></ProtectedLayout>} />
          <Route path="/admin/semesters" element={<ProtectedLayout roles={['admin']}><AdminSemesters /></ProtectedLayout>} />
          <Route path="/admin/audit-logs" element={<ProtectedLayout roles={['admin']}><AdminAuditLogs /></ProtectedLayout>} />
          <Route path="/admin/enrollments" element={<ProtectedLayout roles={['admin']}><AdminEnrollments /></ProtectedLayout>} />
          <Route path="/admin/salaries" element={<ProtectedLayout roles={['admin']}><AdminSalaries /></ProtectedLayout>} />

          <Route path="/student" element={<ProtectedLayout roles={['student']}><StudentDashboard /></ProtectedLayout>} />
          <Route path="/student/profile" element={<ProtectedLayout roles={['student']}><StudentProfile /></ProtectedLayout>} />
          <Route path="/student/units" element={<ProtectedLayout roles={['student']}><StudentUnits /></ProtectedLayout>} />
          <Route path="/student/transcript" element={<ProtectedLayout roles={['student']}><StudentTranscript /></ProtectedLayout>} />
          <Route path="/student/fees" element={<ProtectedLayout roles={['student']}><StudentFees /></ProtectedLayout>} />

          <Route path="/lecturer" element={<ProtectedLayout roles={['lecturer']}><LecturerDashboard /></ProtectedLayout>} />
          <Route path="/lecturer/profile" element={<ProtectedLayout roles={['lecturer']}><LecturerProfile /></ProtectedLayout>} />
          <Route path="/lecturer/courses" element={<ProtectedLayout roles={['lecturer']}><LecturerDashboard /></ProtectedLayout>} />
          <Route path="/lecturer/courses/:id" element={<ProtectedLayout roles={['lecturer']}><CourseStudents /></ProtectedLayout>} />
          <Route path="/lecturer/salary" element={<ProtectedLayout roles={['lecturer']}><LecturerSalary /></ProtectedLayout>} />

          <Route path="/finance" element={<ProtectedLayout roles={['finance']}><FinanceDashboard /></ProtectedLayout>} />
          <Route path="/finance/students" element={<ProtectedLayout roles={['finance']}><FinanceDashboard /></ProtectedLayout>} />
          <Route path="/finance/students/:id" element={<ProtectedLayout roles={['finance']}><StudentFeesPage /></ProtectedLayout>} />
          <Route path="/finance/reports" element={<ProtectedLayout roles={['finance']}><FinanceReports /></ProtectedLayout>} />
          <Route path="/finance/salaries" element={<ProtectedLayout roles={['finance']}><AdminSalaries /></ProtectedLayout>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
