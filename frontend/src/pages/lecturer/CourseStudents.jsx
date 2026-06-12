import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

export default function CourseStudents() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    Promise.all([
      api.get(`/lecturer/courses/${id}/students`),
      api.get(`/lecturer/courses/${id}/results`),
    ]).then(([s, r]) => {
      setStudents(s.data.students);
      const res = r.data.results || [];
      setResults(res);
      const m = {};
      res.forEach((r) => { m[r.studentId] = { marks: r.marks, grade: r.grade }; });
      setMarks(m);
    }).catch(() => {});
  }, [id]);

  const updateResult = async (studentId) => {
    const entry = marks[studentId];
    if (!entry || entry.marks === undefined) return;
    try {
      const { data } = await api.put(`/lecturer/courses/${id}/results`, {
        studentId, marks: entry.marks, grade: entry.grade,
      });
      alert(data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleMarksChange = (studentId, value) => {
    const m = parseFloat(value);
    const grade = m >= 70 ? 'A' : m >= 60 ? 'B+' : m >= 50 ? 'B' : m >= 40 ? 'C+' : m >= 35 ? 'C' : m >= 30 ? 'D+' : m >= 25 ? 'D' : m >= 20 ? 'E' : 'F';
    setMarks((prev) => ({ ...prev, [studentId]: { marks: value, grade } }));
  };

  const getGradeColor = (g) => {
    const colors = { A: 'text-green-600', 'B+': 'text-green-500', B: 'text-green-500', 'C+': 'text-yellow-600', C: 'text-yellow-600', D: 'text-orange-600', E: 'text-red-600', F: 'text-red-600' };
    return colors[g] || '';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Result Entry</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Admission No</th>
              <th className="text-left p-3">Student Name</th>
              <th className="text-center p-3">Marks</th>
              <th className="text-center p-3">Grade</th>
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono">{s.admissionNo}</td>
                <td className="p-3">{s.user?.firstName} {s.user?.lastName}</td>
                <td className="p-3 text-center">
                  <input
                    type="number" min="0" max="100"
                    value={marks[s.id]?.marks ?? ''}
                    onChange={(e) => handleMarksChange(s.id, e.target.value)}
                    className="w-20 border rounded p-1 text-center"
                  />
                </td>
                <td className={`p-3 text-center font-bold ${getGradeColor(marks[s.id]?.grade)}`}>
                  {marks[s.id]?.grade || '—'}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => updateResult(s.id)} className="bg-maroon-900 text-white px-3 py-1 rounded text-xs hover:bg-maroon-800">
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No students enrolled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
