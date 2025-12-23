'use client';

import type { DashboardAchievement } from '@/types/dashboard';

interface AchievementsStreakProps {
  currentStreak: number;
  longestStreak: number;
  achievements: DashboardAchievement[];
}

export default function AchievementsStreak({
  currentStreak,
  longestStreak,
  achievements
}: AchievementsStreakProps) {
  // Calculate next milestone
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 10;
  const progress = Math.round((currentStreak / nextMilestone) * 100);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
        Achievements & Streaks
      </h3>

      {/* Streak Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🔥</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{currentStreak}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Current Streak</div>
        </div>
        <div style={{
          background: '#F9FAFB',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>⭐</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937' }}>{longestStreak}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Best Streak</div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>
            Next: {nextMilestone}-day streak
          </span>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            {currentStreak}/{nextMilestone}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#E5E7EB',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 ? (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '12px' }}>
            Recent Achievements
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: 'rgba(124, 58, 237, 0.08)',
                  borderRadius: '20px',
                  border: '1px solid rgba(124, 58, 237, 0.15)'
                }}
              >
                <span style={{ fontSize: '16px' }}>{achievement.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1F2937' }}>
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
          Complete activities to earn achievements!
        </div>
      )}
    </div>
  );
}
