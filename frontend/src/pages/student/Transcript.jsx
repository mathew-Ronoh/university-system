import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Transcript() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/student/transcript').then(({ data }) => setResults(data.results || [])).catch(() => {});
  }, []);

  const download = () => {
    const token = localStorage.getItem('accessToken');
    window.open(`/api/student/transcript/download?token=${token}`, '_blank');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transcript</h1>
        <button onClick={download} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Unit</th><th className="text-left p-3">Code</th>
              <th className="text-center p-3">Marks</th><th className="text-center p-3">Grade</th>
              <th className="text-left p-3">Semester</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.unit?.name}</td>
                <td className="p-3 font-mono">{r.unit?.code}</td>
                <td className="p-3 text-center">{r.marks ?? '—'}</td>
                <td className="p-3 text-center font-bold">{r.grade || '—'}</td>
                <td className="p-3">{r.semester?.name}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No results yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
