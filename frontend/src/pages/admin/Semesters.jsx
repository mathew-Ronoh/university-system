import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', academicYear: '', startDate: '', endDate: '', isCurrent: false });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/admin/semesters').then(({ data }) => setSemesters(data.semesters));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.startDate || !form.endDate) {
      setError('Start date and end date are required.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/semesters', form);
      setShowForm(false);
      setForm({ name: '', academicYear: '', startDate: '', endDate: '', isCurrent: false });
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create semester.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Semesters</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
          {showForm ? 'Cancel' : '+ Add Semester'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Name (e.g. Semester 1)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Academic Year (e.g. 2025/2026)" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="border p-2 rounded" required />
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border p-2 rounded" required />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border p-2 rounded" required />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} />
            <span>Current Semester</span>
          </label>
          <button type="submit" disabled={submitting} className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th><th className="text-left p-3">Year</th>
              <th className="text-left p-3">Start</th><th className="text-left p-3">End</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.academicYear}</td>
                <td className="p-3">{s.startDate}</td>
                <td className="p-3">{s.endDate}</td>
                <td className="p-3">
                  {s.isCurrent ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Current</span> : <span className="text-gray-400 text-xs">Past</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
