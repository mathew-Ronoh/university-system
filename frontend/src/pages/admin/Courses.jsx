import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', credits: 120, department: '', description: '', fee: '' });

  const load = () => {
    api.get('/admin/courses').then(({ data }) => setCourses(data.courses));
    api.get('/admin/lecturers').then(({ data }) => setLecturers(data.lecturers));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/admin/courses', form);
    setShowForm(false);
    setForm({ code: '', name: '', credits: 120, department: '', description: '', fee: '' });
    load();
  };

  const fmt = (n) => parseFloat(n).toLocaleString('en-KE', { minimumFractionDigits: 2 });

  const assignCoordinator = async (courseId, lecturerId) => {
    await api.post('/admin/assign-course-lecturer', { courseId, lecturerId: +lecturerId || null });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
          {showForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border p-2 rounded" />
          <input placeholder="Semester Fee (KES)" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="border p-2 rounded" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border p-2 rounded col-span-2" />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Create</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Code</th><th className="text-left p-3">Name</th>
              <th className="text-left p-3">Credits</th><th className="text-left p-3">Fee (KES)</th>
              <th className="text-left p-3">Department</th><th className="text-left p-3">Coordinator</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.credits}</td>
                <td className="p-3 font-medium">{fmt(c.fee)}</td>
                <td className="p-3">{c.department}</td>
                <td className="p-3">
                  <select
                    value={c.coordinator?.id || ''}
                    onChange={(e) => assignCoordinator(c.id, e.target.value)}
                    className="border p-1 rounded text-xs"
                  >
                    <option value="">—</option>
                    {lecturers.map((l) => (
                      <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
