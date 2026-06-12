import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/lecturer/profile').then(({ data }) => setUser(data.user)).catch(() => {});
  }, []);

  if (!user) return <p className="text-gray-500">Loading...</p>;

  const avatarSrc = user.avatarUrl;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-600 text-2xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-500">Lecturer</p>
          </div>
        </div>

        <div className="space-y-3">
          <div><span className="text-gray-500 text-sm">Email:</span><p className="font-medium">{user.email}</p></div>
          <div><span className="text-gray-500 text-sm">Phone:</span><p className="font-medium">{user.phone || '—'}</p></div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Contact admin to update your profile or photo.</p>
      </div>
    </div>
  );
}
