'use client';

import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id?: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'session_reminder':
      return '🔔';
    case 'session_starting':
      return '▶️';
    case 'therapist_joined':
      return '👋';
    case 'new_message':
      return '💬';
    case 'session_cancelled':
      return '❌';
    case 'session_completed':
      return '✅';
    default:
      return '📢';
  }
};

const getNotificationLink = (type: string, data?: string): string | null => {
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    switch (type) {
      case 'session_reminder':
      case 'session_starting':
      case 'therapist_joined':
        return parsed.sessionId ? `/therapy/session/${parsed.sessionId}` : null;
      case 'new_message':
        return '/chat';
      case 'session_completed':
        return parsed.sessionId ? `/therapy/summary/${parsed.sessionId}` : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationPanel({
  notifications,
  loading,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationPanelProps) {
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    const link = getNotificationLink(notification.type, notification.data);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        width: '360px',
        maxHeight: '480px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
          Notifications
        </h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => onMarkAsRead()}
            style={{
              background: 'none',
              border: 'none',
              color: '#7C3AED',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
            <div>No notifications yet</div>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 20px',
                cursor: 'pointer',
                background: notification.isRead ? 'transparent' : 'rgba(124, 58, 237, 0.04)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.isRead
                  ? 'transparent'
                  : 'rgba(124, 58, 237, 0.04)';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: notification.isRead ? '400' : '600',
                    color: '#1F2937',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {notification.title}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {notification.message}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    marginTop: '4px',
                  }}
                >
                  {formatTimeAgo(notification.createdAt)}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  borderRadius: '4px',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#DC2626';
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF';
                  e.currentTarget.style.background = 'none';
                }}
                title="Delete notification"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Unread indicator */}
              {!notification.isRead && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#7C3AED',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(124, 58, 237, 0.1)',
            textAlign: 'center',
          }}
        >
          <a
            href="/notifications"
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#7C3AED',
              textDecoration: 'none',
            }}
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
