import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function StudentUnits() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    api.get('/student/current-units').then(({ data }) => setUnits(data.units)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Units</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((u) => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{u.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{u.code}</p>
              </div>
              <span className="bg-maroon-100 text-maroon-700 text-xs px-2 py-1 rounded">{u.credits} credits</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Lecturer: {u.lecturer?.firstName} {u.lecturer?.lastName}</p>
              {u.semester && <p>Semester: {u.semester.name} ({u.semester.academicYear})</p>}
            </div>
          </div>
        ))}
        {units.length === 0 && <p className="text-gray-500 col-span-2">No units enrolled.</p>}
      </div>
    </div>
  );
}
