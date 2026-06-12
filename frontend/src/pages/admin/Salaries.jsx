import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Salaries({ basePath: bp }) {
  const { user } = useAuth();
  const basePath = bp || `/${user?.role}`;
  const [salaries, setSalaries] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lecturerId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: '' });

  const load = () => {
    api.get(`${basePath}/salaries`).then(({ data }) => setSalaries(data.salaries)).catch(() => {});
    if (user?.role === 'admin') api.get('/admin/lecturers').then(({ data }) => setLecturers(data.lecturers)).catch(() => {});
  };
  useEffect(() => { load(); }, [basePath, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`${basePath}/salaries`, form);
    setShowForm(false);
    setForm({ lecturerId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: '' });
    load();
  };

  const markPaid = async (id) => {
    await api.post(`${basePath}/salaries/${id}/mark-paid`);
    load();
  };

  const monthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lecturer Salaries</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(!showForm)} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
            {showForm ? 'Cancel' : '+ Add Salary'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={form.lecturerId} onChange={(e) => setForm({ ...form, lecturerId: e.target.value })} className="border p-2 rounded" required>
            <option value="">Select Lecturer</option>
            {lecturers.map((l) => (<option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>))}
          </select>
          <input placeholder="Amount (KES)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border p-2 rounded" required />
          <div className="flex gap-2">
            <select value={form.month} onChange={(e) => setForm({ ...form, month: +e.target.value })} className="border p-2 rounded flex-1">
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{monthName(i + 1)}</option>)}
            </select>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className="border p-2 rounded w-24" />
          </div>
          <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border p-2 rounded col-span-2" />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Create</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Lecturer</th><th className="text-left p-3">Period</th>
              <th className="text-right p-3">Amount</th><th className="text-center p-3">Status</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.lecturer?.firstName} {s.lecturer?.lastName}</td>
                <td className="p-3">{monthName(s.month)} {s.year}</td>
                <td className="p-3 text-right font-medium">KES {parseFloat(s.amount).toLocaleString()}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'paid' ? 'bg-green-100 text-green-700' : s.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {s.status !== 'paid' && (
                    <button onClick={() => markPaid(s.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
            {salaries.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No salary records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
