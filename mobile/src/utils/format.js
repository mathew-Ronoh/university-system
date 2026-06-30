export const formatCurrency = (amount, currency = 'KES') => {
  const num = parseFloat(amount) || 0;
  return `${currency} ${num.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getGradeColor = (grade) => {
  const colors = {
    A: '#16a34a',
    'B+': '#22c55e',
    B: '#22c55e',
    'C+': '#ca8a04',
    C: '#ca8a04',
    D: '#ea580c',
    E: '#dc2626',
    F: '#dc2626',
    I: '#6b7280',
  };
  return colors[grade] || '#6b7280';
};

export const getStatusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'paid' || s === 'completed') return '#16a34a';
  if (s === 'inactive' || s === 'pending') return '#ca8a04';
  if (s === 'overdue' || s === 'failed' || s === 'partial') return '#dc2626';
  return '#6b7280';
};

export const getStatusBgColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'paid' || s === 'completed') return '#dcfce7';
  if (s === 'inactive' || s === 'pending') return '#fef9c3';
  if (s === 'overdue' || s === 'failed' || s === 'partial') return '#fee2e2';
  return '#f3f4f6';
};

export const computeGrade = (marks) => {
  const m = parseFloat(marks);
  if (isNaN(m)) return null;
  if (m >= 70) return 'A';
  if (m >= 60) return 'B+';
  if (m >= 50) return 'B';
  if (m >= 40) return 'C+';
  if (m >= 35) return 'C';
  if (m >= 30) return 'D+';
  if (m >= 25) return 'D';
  if (m >= 20) return 'E';
  return 'F';
};

export const getInitials = (firstName, lastName) => {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
};

export const getRoleColor = (role) => {
  const colors = {
    student: '#16a34a',
    lecturer: '#2563eb',
    finance: '#ca8a04',
    admin: '#dc2626',
  };
  return colors[role] || '#6b7280';
};
