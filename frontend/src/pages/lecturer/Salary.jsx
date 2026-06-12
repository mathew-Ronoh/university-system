import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Salary() {
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    api.get('/lecturer/salary').then(({ data }) => setSalaries(data.salaries)).catch(() => {});
  }, []);

  const monthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];

  const totalPaid = salaries.filter((s) => s.status === 'paid').reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const totalPending = salaries.filter((s) => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Salary</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-orange-600">KES {totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Period</th><th className="text-right p-3">Amount</th>
              <th className="text-center p-3">Status</th><th className="text-left p-3">Paid Date</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{monthName(s.month)} {s.year}</td>
                <td className="p-3 text-right font-medium">KES {parseFloat(s.amount).toLocaleString()}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td className="p-3">{s.paidAt || '—'}</td>
                <td className="p-3 text-gray-500">{s.notes || '—'}</td>
              </tr>
            ))}
            {salaries.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No salary records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
