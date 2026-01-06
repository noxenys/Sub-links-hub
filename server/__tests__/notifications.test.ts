import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '../db-notifications';

describe('Notification System', () => {
  const testUserId = 'test-user-123';
  let createdNotificationId: number;

  beforeEach(async () => {
    // Clean up before each test
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        actionUrl: '/test',
      });

      expect(notification).toBeDefined();
      expect(notification?.userId).toBe(testUserId);
      expect(notification?.title).toBe('Test Notification');
      expect(notification?.isRead).toBe(0);
      
      if (notification?.id) {
        createdNotificationId = notification.id;
      }
    });

    it('should create different notification types', async () => {
      const types = ['info', 'success', 'warning', 'error', 'system'] as const;

      for (const type of types) {
        const notification = await createNotification({
          userId: testUserId,
          type,
          title: `${type} Notification`,
          message: `This is a ${type} notification`,
        });

        expect(notification?.type).toBe(type);
      }
    });
  });

  describe('getNotifications', () => {
    it('should retrieve notifications for a user', async () => {
      // Create test notifications
      await createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Notification 1',
        message: 'First notification',
      });

      await createNotification({
        userId: testUserId,
        type: 'success',
        title: 'Notification 2',
        message: 'Second notification',
      });

      const notifications = await getNotifications(testUserId, 10);

      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect the limit parameter', async () => {
      const notifications = await getNotifications(testUserId, 1);

      expect(notifications.length).toBeLessThanOrEqual(1);
    });

    it('should return empty array for non-existent user', async () => {
      const notifications = await getNotifications('non-existent-user', 10);

      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });
  });

  describe('getUnreadNotifications', () => {
    it('should retrieve only unread notifications', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Unread Notification',
        message: 'This should be unread',
      });

      const unreadNotifications = await getUnreadNotifications(testUserId);

      expect(Array.isArray(unreadNotifications)).toBe(true);
      const foundNotification = unreadNotifications.find(n => n.id === notification?.id);
      expect(foundNotification).toBeDefined();
      expect(foundNotification?.isRead).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Mark as Read Test',
        message: 'This will be marked as read',
      });

      if (notification?.id) {
        await markNotificationAsRead(notification.id);

        const unreadNotifications = await getUnreadNotifications(testUserId);
        const markedNotification = unreadNotifications.find(n => n.id === notification.id);

        expect(markedNotification).toBeUndefined();
      }
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Delete Test',
        message: 'This will be deleted',
      });

      if (notification?.id) {
        await deleteNotification(notification.id);

        const notifications = await getNotifications(testUserId, 100);
        const deletedNotification = notifications.find(n => n.id === notification.id);

        expect(deletedNotification).toBeUndefined();
      }
    });
  });

  describe('Notification workflow', () => {
    it('should handle a complete notification workflow', async () => {
      // 1. Create notification
      const notification = await createNotification({
        userId: testUserId,
        type: 'success',
        title: 'Workflow Test',
        message: 'Testing complete workflow',
        actionUrl: '/workflow',
      });

      expect(notification).toBeDefined();
      expect(notification?.isRead).toBe(0);

      // 2. Get unread notifications
      const unreadBefore = await getUnreadNotifications(testUserId);
      const unreadCount = unreadBefore.filter(n => n.id === notification?.id).length;
      expect(unreadCount).toBe(1);

      // 3. Mark as read
      if (notification?.id) {
        await markNotificationAsRead(notification.id);

        const unreadAfter = await getUnreadNotifications(testUserId);
        const stillUnread = unreadAfter.find(n => n.id === notification.id);
        expect(stillUnread).toBeUndefined();

        // 4. Delete notification
        await deleteNotification(notification.id);

        const allNotifications = await getNotifications(testUserId, 100);
        const deleted = allNotifications.find(n => n.id === notification.id);
        expect(deleted).toBeUndefined();
      }
    });
  });
});
