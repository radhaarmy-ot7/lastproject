import { describe, it, expect } from 'vitest';
import { buildDashboardStats } from './TeacherDashboard';

describe('buildDashboardStats', () => {
  it('uses the actual number of students from the data', () => {
    const stats = buildDashboardStats(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ id: 1 }],
      [{ attendance_percentage: 80 }, { attendance_percentage: 90 }]
    );

    expect(stats.totalStudents).toBe(3);
    expect(stats.totalNotices).toBe(1);
    expect(stats.attendanceRate).toBe(85);
  });
});
