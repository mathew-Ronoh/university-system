import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/audit-logs').then(({ data }) => setLogs(data.auditLogs)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Action</th><th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Entity ID</th><th className="text-left p-3">User ID</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{l.action}</td>
                <td className="p-3">{l.entityType}</td>
                <td className="p-3">{l.entityId || '—'}</td>
                <td className="p-3">{l.userId || '—'}</td>
                <td className="p-3 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
