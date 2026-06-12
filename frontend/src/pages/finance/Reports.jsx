import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function FinanceReports() {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState({});

  useEffect(() => {
    api.get('/admin/users?role=student').then(({ data }) => setStudents(data.users)).catch(() => {});
  }, []);

  const loadReport = async (id) => {
    try {
      const { data } = await api.get(`/finance/reports/student/${id}`);
      setReports((prev) => ({ ...prev, [id]: data.report.summary }));
    } catch { }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Financial Reports</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Student</th><th className="text-left p-3">Total Fees</th>
              <th className="text-left p-3">Paid</th><th className="text-left p-3">Balance</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const r = reports[s.id];
              return (
                <tr key={s.id} className="border-t hover:bg-gray-50" onMouseEnter={() => !reports[s.id] && loadReport(s.id)}>
                  <td className="p-3">{s.firstName} {s.lastName}</td>
                  <td className="p-3">{r ? `KES ${parseFloat(r.totalFees).toLocaleString()}` : '—'}</td>
                  <td className="p-3">{r ? `KES ${parseFloat(r.totalPaid).toLocaleString()}` : '—'}</td>
                  <td className="p-3">{r ? `KES ${parseFloat(r.totalBalance).toLocaleString()}` : '—'}</td>
                  <td className="p-3">
                    <Link to={`/finance/students/${s.id}`} className="text-green-600 hover:underline text-xs">Manage →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
