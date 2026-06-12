import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Fees() {
  const [data, setData] = useState({ fees: [], payments: [], receipts: [], summary: {} });

  useEffect(() => {
    Promise.all([
      api.get('/student/fees/balance'),
      api.get('/student/fees/payments'),
      api.get('/student/fees/receipts'),
    ]).then(([b, p, r]) => {
      setData({ fees: b.data.fees, payments: p.data.payments, receipts: r.data.receipts, summary: b.data.summary });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fee Statement</h1>

      {data.summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Fees</p>
            <p className="text-xl font-bold">KES {parseFloat(data.summary.totalOwed || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Paid</p>
            <p className="text-xl font-bold text-green-600">KES {parseFloat(data.summary.totalPaid || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Balance</p>
            <p className="text-xl font-bold text-red-600">KES {parseFloat(data.summary.totalBalance || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold mb-3">Payment History</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Date</th><th className="text-left p-2">Method</th>
              <th className="text-right p-2">Amount</th><th className="text-left p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {data.payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.paymentDate}</td>
                <td className="p-2 uppercase">{p.method}</td>
                <td className="p-2 text-right">KES {parseFloat(p.amount).toLocaleString()}</td>
                <td className="p-2">{p.receiptNo}</td>
              </tr>
            ))}
            {data.payments.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold mb-3">Receipts</h2>
        <div className="space-y-2">
          {data.receipts.map((r) => (
            <div key={r.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-sm font-medium">{r.receiptNo}</p>
                <p className="text-xs text-gray-500">{new Date(r.generatedAt).toLocaleDateString()}</p>
              </div>
              <a
                href={`/api/student/fees/receipts/${r.id}/download?token=${localStorage.getItem('accessToken')}`}
                target="_blank"
                className="text-green-600 text-sm hover:underline"
              >
                Download
              </a>
            </div>
          ))}
          {data.receipts.length === 0 && <p className="text-gray-500 text-sm">No receipts yet.</p>}
        </div>
      </div>
    </div>
  );
}
