import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

export default function StudentFees() {
  const { id } = useParams();
  const [data, setData] = useState({ fees: [], payments: [] });
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [feeForm, setFeeForm] = useState({ totalFees: '', semesterId: 1, dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' });

  const load = () => {
    Promise.all([
      api.get(`/finance/students/${id}/fees`),
      api.get(`/finance/students/${id}/payments`),
    ]).then(([f, p]) => setData({ fees: f.data.fees, payments: p.data.payments })).catch(() => {});
  };
  useEffect(() => { load(); }, [id]);

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/finance/students/${id}/fees`, feeForm);
    setShowFeeForm(false);
    setFeeForm({ totalFees: '', semesterId: 1, dueDate: '' });
    load();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (editingPayment) {
      await api.put(`/finance/payments/${editingPayment}`, payForm);
      setEditingPayment(null);
    } else {
      await api.post(`/finance/students/${id}/payments/manual`, payForm);
    }
    setShowPaymentForm(false);
    setPayForm({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' });
    load();
  };

  const startEdit = (p) => {
    setEditingPayment(p.id);
    setPayForm({ amount: p.amount, method: p.method, paymentDate: p.paymentDate, transactionCode: p.transactionCode || '' });
    setShowPaymentForm(true);
  };

  const deletePayment = async (paymentId) => {
    if (!confirm('Delete this payment? This will recalculate the fee balance.')) return;
    await api.delete(`/finance/payments/${paymentId}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Fees</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowFeeForm(!showFeeForm)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
            {showFeeForm ? 'Cancel' : '+ Set Fee'}
          </button>
          <button onClick={() => { setShowPaymentForm(!showPaymentForm); setEditingPayment(null); setPayForm({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' }); }} className="bg-maroon-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-maroon-800">
            {showPaymentForm ? 'Cancel' : '+ Record Payment'}
          </button>
        </div>
      </div>

      {showFeeForm && (
        <form onSubmit={handleFeeSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Total Fees (KES)" type="number" value={feeForm.totalFees} onChange={(e) => setFeeForm({ ...feeForm, totalFees: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Semester ID" type="number" value={feeForm.semesterId} onChange={(e) => setFeeForm({ ...feeForm, semesterId: +e.target.value })} className="border p-2 rounded" required />
          <input type="date" value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} className="border p-2 rounded" />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Create Fee</button>
        </form>
      )}

      {showPaymentForm && (
        <form onSubmit={handlePaymentSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Amount (KES)" type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="border p-2 rounded" required />
          <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className="border p-2 rounded">
            <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option><option value="mpesa">M-Pesa</option>
            <option value="helb">HELB</option>
          </select>
          <input type="date" value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} className="border p-2 rounded" required />
          <input placeholder="Transaction Code" value={payForm.transactionCode} onChange={(e) => setPayForm({ ...payForm, transactionCode: e.target.value })} className="border p-2 rounded" />
          <button type="submit" className="bg-maroon-900 text-white py-2 rounded hover:bg-maroon-800">{editingPayment ? 'Update Payment' : 'Record Payment'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold mb-3">Fees</h2>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Total</th><th className="text-left p-2">Paid</th><th className="text-left p-2">Balance</th><th className="text-left p-2">Status</th></tr></thead>
            <tbody>
              {data.fees.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="p-2">{f.totalFees}</td>
                  <td className="p-2">{f.paidAmount}</td>
                  <td className="p-2">{f.balance}</td>
                  <td className="p-2 capitalize">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold mb-3">Payment History</h2>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Date</th><th className="text-left p-2">Method</th><th className="text-right p-2">Amount</th><th className="text-center p-2">Actions</th></tr></thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.paymentDate}</td>
                  <td className="p-2 uppercase">{p.method}</td>
                  <td className="p-2 text-right">{p.amount}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => startEdit(p)} className="text-green-600 hover:text-green-800 text-xs mr-2">Edit</button>
                    <button onClick={() => deletePayment(p.id)} className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
