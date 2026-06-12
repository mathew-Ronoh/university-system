import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function FinanceDashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/admin/users?role=student').then(({ data }) => setStudents(data.users)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Finance Dashboard</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold mb-4">Students</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th><th className="text-left p-3">Email</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.firstName} {s.lastName}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">
                  <a href={`/finance/students/${s.id}`} className="text-green-600 hover:underline text-sm">View Fees →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
