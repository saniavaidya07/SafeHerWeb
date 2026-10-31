// ============================================
// SafeHer - Admin Dashboard Logic (OPTIMIZED)
// ============================================

const AdminDashboard = {
  init() {
    // Delay chart loading for smooth page transition
    requestAnimationFrame(() => {
      this.initCharts();
      this.loadRecentReports();
    });
    console.log('📊 Admin dashboard loaded');
  },

  // ============================================
  // INIT CHARTS (OPTIMIZED)
  // ============================================
  initCharts() {
    // Global config
    Chart.defaults.color = '#CBD5E1';
    Chart.defaults.borderColor = 'rgba(203, 213, 225, 0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.animation.duration = 800;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Reports Overview Chart
    const reportsCtx = document.getElementById('reportsChart');
    if (reportsCtx) {
      new Chart(reportsCtx, {
        type: 'line',
        data: {
          labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
          datasets: [
            {
              label: 'New Reports',
              data: [45, 52, 38, 67, 84, 72, 95],
              borderColor: '#7C3AED',
              backgroundColor: 'rgba(124, 58, 237, 0.15)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#7C3AED',
              pointBorderColor: 'white',
              pointBorderWidth: 2
            },
            {
              label: 'Resolved',
              data: [40, 48, 35, 60, 78, 68, 88],
              borderColor: '#10B981',
              backgroundColor: 'transparent',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#10B981',
              pointBorderColor: 'white',
              pointBorderWidth: 2
            }
          ]
        },
        options: {
          animation: { duration: 600 },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: 'white',
              bodyColor: '#CBD5E1',
              borderColor: '#7C3AED',
              borderWidth: 1,
              padding: 10,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(203, 213, 225, 0.05)' },
              ticks: { color: '#64748B' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748B' }
            }
          }
        }
      });
    }

    // Categories Chart (Doughnut)
    const categoriesCtx = document.getElementById('categoriesChart');
    if (categoriesCtx) {
      new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Harassment', 'Stalking', 'Threat', 'Suspicious', 'Other'],
          datasets: [{
            data: [340, 220, 180, 250, 244],
            backgroundColor: [
              '#EF4444',
              '#7C3AED',
              '#F97316',
              '#EAB308',
              '#06B6D4'
            ],
            borderColor: '#1E293B',
            borderWidth: 2,
            hoverOffset: 8
          }]
        },
        options: {
          animation: { duration: 600 },
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 12,
                font: { size: 11 }
              }
            },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: 'white',
              bodyColor: '#CBD5E1',
              padding: 10
            }
          }
        }
      });
    }

    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    if (userGrowthCtx) {
      new Chart(userGrowthCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [1250, 1890, 2340, 1980, 2560, 3120],
            backgroundColor: 'rgba(236, 72, 153, 0.6)',
            borderColor: '#EC4899',
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.6
          }]
        },
        options: {
          animation: { duration: 600 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: 'white',
              bodyColor: '#CBD5E1',
              borderColor: '#EC4899',
              borderWidth: 1,
              padding: 10
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(203, 213, 225, 0.05)' },
              ticks: { color: '#64748B' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748B' }
            }
          }
        }
      });
    }

    // Response Times Chart
    const responseCtx = document.getElementById('responseChart');
    if (responseCtx) {
      new Chart(responseCtx, {
        type: 'line',
        data: {
          labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'],
          datasets: [{
            label: 'Response Time (mins)',
            data: [8, 12, 3, 2, 4, 6],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10B981',
            pointBorderColor: 'white',
            pointBorderWidth: 2
          }]
        },
        options: {
          animation: { duration: 600 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: 'white',
              bodyColor: '#CBD5E1',
              padding: 10
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(203, 213, 225, 0.05)' },
              ticks: {
                color: '#64748B',
                callback: (v) => v + 'm'
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748B' }
            }
          }
        }
      });
    }
  },

  // ============================================
  // LOAD RECENT REPORTS
  // ============================================
  loadRecentReports() {
    const reports = [
      { id: '#RPT-2024-1234', type: 'Harassment', user: 'Priya S.', priority: 'critical', status: 'pending' },
      { id: '#RPT-2024-1233', type: 'Stalking', user: 'Anjali K.', priority: 'high', status: 'review' },
      { id: '#RPT-2024-1232', type: 'Threat', user: 'Meera P.', priority: 'high', status: 'verified' },
      { id: '#RPT-2024-1231', type: 'Suspicious', user: 'Kavita R.', priority: 'medium', status: 'resolved' },
      { id: '#RPT-2024-1230', type: 'Harassment', user: 'Divya M.', priority: 'critical', status: 'pending' }
    ];

    const tbody = document.getElementById('recent-reports-tbody');
    if (!tbody) return;

    tbody.innerHTML = reports.map(r => `
      <tr>
        <td><span class="table-report-id">${r.id}</span></td>
        <td>
          <span class="table-type-badge type-${r.type.toLowerCase()}">
            ${r.type}
          </span>
        </td>
        <td>
          <div class="table-user">
            <div class="table-user-avatar">${r.user.charAt(0)}</div>
            <span>${r.user}</span>
          </div>
        </td>
        <td>
          <span class="table-priority-badge priority-${r.priority}-t">${r.priority}</span>
        </td>
        <td>
          <span class="table-status-badge status-${r.status}-t">${r.status}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" title="View">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="table-action-btn" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="table-action-btn danger" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminDashboard.init();
});