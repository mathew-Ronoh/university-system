import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Link } from 'react-router-dom';

export default function LecturerDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/lecturer/courses').then(({ data }) => setCourses(data.units)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lecturer Dashboard</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold mb-4">My Courses ({courses.length})</h2>
        <div className="space-y-3">
          {courses.map((c) => (
            <Link key={c.id} to={`/lecturer/courses/${c.id}`} className="block border rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{c.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{c.code}</p>
                </div>
                <span className="text-green-600 text-sm self-center">View →</span>
              </div>
            </Link>
          ))}
          {courses.length === 0 && <p className="text-gray-500">No courses assigned yet.</p>}
        </div>
      </div>
    </div>
  );
}
