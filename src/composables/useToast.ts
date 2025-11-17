import { useNotifications } from './useNotifications'

export function useToast() {
  const notifications = useNotifications()

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    return notifications.addNotification(message, type)
  }

  return {
    showToast,
    success: notifications.success,
    error: notifications.error,
    warning: notifications.warning,
    info: notifications.info,
  }
}
