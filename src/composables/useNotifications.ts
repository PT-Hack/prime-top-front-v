import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const addNotification = (
    message: string,
    type: Notification['type'] = 'info',
    duration = 3000,
  ) => {
    const id = Math.random().toString(36).substring(7)
    const notification: Notification = { id, message, type, duration }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return addNotification(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return addNotification(message, 'error', duration)
  }

  const warning = (message: string, duration?: number) => {
    return addNotification(message, 'warning', duration)
  }

  const info = (message: string, duration?: number) => {
    return addNotification(message, 'info', duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear,
    // Aliases for compatibility
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
  }
}
