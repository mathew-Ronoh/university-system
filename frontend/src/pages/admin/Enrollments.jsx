import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Enrollments() {
  const [students, setStudents] = useState([]);
  const [units, setUnits] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ studentId: '', unitIds: [], semesterId: '' });
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      api.get('/admin/users?role=student'),
      api.get('/admin/units'),
      api.get('/admin/semesters'),
    ]).then(([s, u, sem]) => {
      setStudents(s.data.users);
      setUnits(u.data.units);
      setSemesters(sem.data.semesters);
      if (!form.semesterId && sem.data.semesters.length > 0) {
        const current = sem.data.semesters.find((s) => s.isCurrent);
        setForm((prev) => ({ ...prev, semesterId: current?.id || sem.data.semesters[0].id }));
      }
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const toggleUnit = (unitId) => {
    setForm((prev) => ({
      ...prev,
      unitIds: prev.unitIds.includes(unitId)
        ? prev.unitIds.filter((id) => id !== unitId)
        : [...prev.unitIds, unitId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!form.studentId) return setMessage({ type: 'error', text: 'Select a student.' });
    if (form.unitIds.length === 0) return setMessage({ type: 'error', text: 'Select at least one unit.' });
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/enroll-student', form);
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Enrollment failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUnits = units.filter((u) => form.unitIds.includes(u.id));
  const selectedStudent = students.find((s) => s.id === +form.studentId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Module Registration</h1>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select value={form.semesterId} onChange={(e) => setForm({ ...form, semesterId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select semester...</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>{sem.name} ({sem.academicYear}){sem.isCurrent ? ' — Current' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudent && (
          <p className="text-sm text-gray-600 mb-4">Enrolling: <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong></p>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Units ({form.unitIds.length} selected)</label>
          <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
            {units.map((u) => (
              <label key={u.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm ${form.unitIds.includes(u.id) ? 'bg-maroon-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.unitIds.includes(u.id)}
                  onChange={() => toggleUnit(u.id)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="font-medium">{u.code}</span> — {u.name}
                  <span className="text-gray-400 ml-2">({u.credits} credits)</span>
                </div>
              </label>
            ))}
            {units.length === 0 && <p className="p-4 text-gray-500 text-sm">No units available.</p>}
          </div>
        </div>

        {selectedUnits.length > 0 && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected ({selectedUnits.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedUnits.map((u) => (
                <span key={u.id} className="bg-maroon-100 text-maroon-700 text-xs px-2 py-1 rounded-full">
                  {u.code}
                </span>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting} className="bg-maroon-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-maroon-800 disabled:opacity-50">
          {submitting ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
    </div>
  );
}
