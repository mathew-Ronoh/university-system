import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const navItems = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Courses', path: '/admin/courses' },
    { label: 'Units', path: '/admin/units' },
    { label: 'Semesters', path: '/admin/semesters' },
    { label: 'Audit Logs', path: '/admin/audit-logs' },
    { label: 'Enrollments', path: '/admin/enrollments' },
    { label: 'Salaries', path: '/admin/salaries' },
  ],
  student: [
    { label: 'Dashboard', path: '/student' },
    { label: 'Profile', path: '/student/profile' },
    { label: 'My Units', path: '/student/units' },
    { label: 'Transcript', path: '/student/transcript' },
    { label: 'Fees', path: '/student/fees' },
  ],
  lecturer: [
    { label: 'Dashboard', path: '/lecturer' },
    { label: 'Profile', path: '/lecturer/profile' },
    { label: 'My Courses', path: '/lecturer/courses' },
    { label: 'Salary', path: '/lecturer/salary' },
  ],
  finance: [
    { label: 'Dashboard', path: '/finance' },
    { label: 'Students', path: '/finance/students' },
    { label: 'Reports', path: '/finance/reports' },
    { label: 'Salaries', path: '/finance/salaries' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const items = user ? navItems[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-maroon-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-maroon-800">
          <h1 className="text-xl font-bold">Uni System</h1>
          <p className="text-maroon-300 text-sm capitalize">{user?.role}</p>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-3 py-2 rounded hover:bg-maroon-800 text-sm"
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="text-sm text-green-600 hover:text-green-800">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
