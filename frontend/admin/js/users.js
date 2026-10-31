// ============================================
// SafeHer - Users Management
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const users = [
    { id: 1, name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543210', reports: 12, status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Anjali Kumar', email: 'anjali@example.com', phone: '+91 9876543211', reports: 8, status: 'active', joined: '2024-01-18' },
    { id: 3, name: 'Meera Patel', email: 'meera@example.com', phone: '+91 9876543212', reports: 5, status: 'premium', joined: '2024-01-20' },
    { id: 4, name: 'Divya Rao', email: 'divya@example.com', phone: '+91 9876543213', reports: 15, status: 'active', joined: '2024-01-22' },
    { id: 5, name: 'Kavita Singh', email: 'kavita@example.com', phone: '+91 9876543214', reports: 3, status: 'inactive', joined: '2024-01-25' },
    { id: 6, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 9876543215', reports: 20, status: 'premium', joined: '2024-01-28' },
    { id: 7, name: 'Ritu Verma', email: 'ritu@example.com', phone: '+91 9876543216', reports: 2, status: 'suspended', joined: '2024-02-01' },
    { id: 8, name: 'Nishtha Gupta', email: 'nishtha@example.com', phone: '+91 9876543217', reports: 7, status: 'active', joined: '2024-02-05' },
    { id: 9, name: 'Pooja Malhotra', email: 'pooja@example.com', phone: '+91 9876543218', reports: 11, status: 'active', joined: '2024-02-08' },
    { id: 10, name: 'Riya Iyer', email: 'riya@example.com', phone: '+91 9876543219', reports: 4, status: 'active', joined: '2024-02-10' }
  ];

  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const colors = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F97316', '#EAB308', '#06B6D4', '#EF4444'];

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td><input type="checkbox" /></td>
      <td>
        <div class="table-user">
          <div class="table-user-avatar" style="background: ${colors[i % colors.length]}">${u.name.charAt(0)}</div>
          <span>${u.name}</span>
        </div>
      </td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td><strong>${u.reports}</strong></td>
      <td><span class="user-status-badge user-status-${u.status}">${u.status}</span></td>
      <td>${new Date(u.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn" title="View"><i class="fa-solid fa-eye"></i></button>
          <button class="table-action-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="table-action-btn danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Filter chips
  document.querySelectorAll('.filter-chip-a').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip-a').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      Toast.info(`Filtered by: ${chip.textContent}`);
    });
  });
});