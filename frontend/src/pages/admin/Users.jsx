import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'student', firstName: '', lastName: '', phone: '', admissionNo: '', courseId: '' });
  const [uploading, setUploading] = useState(null);

  const load = () => api.get('/admin/users').then(({ data }) => setUsers(data.users));
  const loadCourses = () => api.get('/admin/courses').then(({ data }) => setCourses(data.courses));

  useEffect(() => { load(); loadCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.role !== 'student') {
      delete payload.admissionNo;
      delete payload.courseId;
    }
    await api.post('/admin/users', payload);
    setShowForm(false);
    setForm({ email: '', password: '', role: 'student', firstName: '', lastName: '', phone: '', admissionNo: '', courseId: '' });
    load();
  };

  const toggleActive = async (id) => {
    await api.post(`/admin/users/${id}/toggle-active`);
    load();
  };

  const handleAvatarUpload = async (userId, file) => {
    if (!file) return;
    setUploading(userId);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api.post(`/admin/users/${userId}/avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const selectedCourse = courses.find((c) => c.id === +form.courseId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-800">
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border p-2 rounded" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border p-2 rounded">
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="finance">Finance</option>
            <option value="admin">Admin</option>
          </select>
          <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded" />

          {form.role === 'student' && (
            <>
              <input placeholder="Admission No" value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} className="border p-2 rounded" required />
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="border p-2 rounded" required>
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
              {selectedCourse && (
                <div className="col-span-1 flex items-center text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                  Fee: KES {parseFloat(selectedCourse.fee).toLocaleString()}/semester
                </div>
              )}
            </>
          )}

          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Create</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Photo</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="relative group">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-600 text-xs font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                    )}
                    <label className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${uploading === u.id ? 'opacity-100' : ''}`}>
                      {uploading === u.id ? '...' : 'Edit'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) handleAvatarUpload(u.id, e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </td>
                <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                    <button onClick={() => toggleActive(u.id)} className="text-green-600 hover:underline text-xs">
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
