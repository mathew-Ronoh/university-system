import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', credits: 3, courseId: 1 });

  const load = () => {
    api.get('/admin/units').then(({ data }) => setUnits(data.units));
    api.get('/admin/lecturers').then(({ data }) => setLecturers(data.lecturers));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/admin/units', form);
    setShowForm(false);
    setForm({ code: '', name: '', credits: 3, courseId: 1 });
    load();
  };

  const assignLecturer = async (unitId, lecturerId) => {
    await api.post('/admin/assign-lecturer', { unitId, lecturerId: +lecturerId });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Units</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
          {showForm ? 'Cancel' : '+ Add Unit'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Code (e.g. CS101)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Course ID" type="number" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: +e.target.value })} className="border p-2 rounded" required />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Create</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Code</th><th className="text-left p-3">Name</th>
              <th className="text-left p-3">Credits</th><th className="text-left p-3">Lecturer</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono">{u.code}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.credits}</td>
                <td className="p-3">{u.lecturer ? `${u.lecturer.firstName} ${u.lecturer.lastName}` : '—'}</td>
                <td className="p-3">
                  <select
                    value={u.lecturerId || ''}
                    onChange={(e) => assignLecturer(u.id, e.target.value)}
                    className="border p-1 rounded text-xs"
                  >
                    <option value="">Assign lecturer</option>
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
