import { useEffect, useState } from 'react';
import { Bell, X, Check, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: number;
  createdAt: Date;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const { data: allNotifications } = trpc.notifications.getAll.useQuery(
    { limit: 20 },
    { enabled: isOpen }
  );

  const { data: unreadCount } = trpc.notifications.getUnread.useQuery(
    undefined,
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.delete.useMutation();

  useEffect(() => {
    if (allNotifications) {
      setNotifications(allNotifications as NotificationItem[]);
    }
  }, [allNotifications]);

  const handleMarkAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ id });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: 1 } : n))
    );
  };

  const handleDelete = async (id: number) => {
    await deleteNotificationMutation.mutateAsync({ id });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      case 'system':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      case 'system':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount && unreadCount.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount.length}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">通知中心</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无通知</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-l-4 transition-colors',
                    getNotificationBgColor(notification.type),
                    notification.isRead === 0 ? 'bg-opacity-100' : 'bg-opacity-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {notification.isRead === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="标记为已读"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        title="删除"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
