import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, units: 0, semesters: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/courses'),
      api.get('/admin/units'),
      api.get('/admin/semesters'),
    ]).then(([u, c, un, s]) => {
      setStats({
        users: u.data.users.length,
        courses: c.data.courses.length,
        units: un.data.units.length,
        semesters: s.data.semesters.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, color: 'bg-maroon-500' },
    { label: 'Courses', value: stats.courses, color: 'bg-green-600' },
    { label: 'Units', value: stats.units, color: 'bg-maroon-400' },
    { label: 'Semesters', value: stats.semesters, color: 'bg-green-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white text-xl font-bold">{card.value}</span>
            </div>
            <h3 className="text-gray-600 text-sm">{card.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
