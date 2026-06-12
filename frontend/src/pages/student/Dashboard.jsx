import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ units: 0, balance: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/student/current-units'),
      api.get('/student/fees/balance'),
    ]).then(([u, f]) => {
      setStats({
        units: u.data.units.length,
        balance: f.data.summary?.totalBalance || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/student/units" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm">Current Units</h3>
          <p className="text-3xl font-bold text-maroon-900 mt-2">{stats.units}</p>
        </Link>
        <Link to="/student/fees" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm">Outstanding Balance</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">KES {parseFloat(stats.balance).toLocaleString()}</p>
        </Link>
        <Link to="/student/transcript" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm">Transcript</h3>
          <p className="text-green-600 mt-2 font-medium">View & Download →</p>
        </Link>
      </div>
    </div>
  );
}
