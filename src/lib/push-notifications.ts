'use client';

// Push notification utilities for browser notifications

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  onClick?: () => void;
}

class PushNotificationManager {
  private permission: NotificationPermission = 'default';
  private notificationQueue: NotificationOptions[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();

      // Process queued notifications if granted
      if (this.permission === 'granted') {
        this.processQueue();
      }

      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Show a notification
  async show(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      return null;
    }

    // If permission not granted, queue the notification
    if (this.permission !== 'granted') {
      this.notificationQueue.push(options);
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/badge-icon.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        data: options.data
      });

      if (options.onClick) {
        notification.onclick = () => {
          window.focus();
          notification.close();
          options.onClick?.();
        };
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Process queued notifications
  private processQueue(): void {
    while (this.notificationQueue.length > 0) {
      const options = this.notificationQueue.shift();
      if (options) {
        this.show(options);
      }
    }
  }

  // Show chat message notification
  async showMessageNotification(params: {
    senderName: string;
    message: string;
    conversationId: string;
    messageType?: 'text' | 'voice' | 'image' | 'file';
  }): Promise<Notification | null> {
    const { senderName, message, conversationId, messageType = 'text' } = params;

    const getBody = () => {
      switch (messageType) {
        case 'voice':
          return '🎤 Sent a voice message';
        case 'image':
          return '🖼️ Sent an image';
        case 'file':
          return '📎 Sent a file';
        default:
          return message.length > 100 ? message.slice(0, 100) + '...' : message;
      }
    };

    return this.show({
      title: `New message from ${senderName}`,
      body: getBody(),
      tag: `chat-${conversationId}`,
      data: { conversationId },
      onClick: () => {
        window.location.href = `/chat?conversation=${conversationId}`;
      }
    });
  }

  // Show crisis alert notification (for therapists)
  async showCrisisNotification(params: {
    studentName: string;
    level: string;
    conversationId: string;
  }): Promise<Notification | null> {
    const { studentName, level, conversationId } = params;

    return this.show({
      title: `⚠️ Crisis Alert: ${studentName}`,
      body: `${level.toUpperCase()} risk level detected. Immediate attention may be required.`,
      tag: `crisis-${conversationId}`,
      requireInteraction: true,
      data: { conversationId, type: 'crisis' },
      onClick: () => {
        window.location.href = `/therapist/chat?conversation=${conversationId}`;
      }
    });
  }
}

// Singleton instance
export const pushNotifications = new PushNotificationManager();

// React hook for notification permission
import { useState, useEffect } from 'react';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(pushNotifications.isSupported());
    setPermission(pushNotifications.getPermission());
  }, []);

  const requestPermission = async () => {
    const result = await pushNotifications.requestPermission();
    setPermission(result);
    return result;
  };

  return {
    permission,
    isSupported,
    requestPermission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied'
  };
}
