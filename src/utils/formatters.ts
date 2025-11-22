import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('ru')
dayjs.extend(relativeTime)

export const formatters = {
  // Форматирование цены
  price: (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  },

  // Форматирование числа
  number: (value: number): string => {
    return new Intl.NumberFormat('ru-RU').format(value)
  },

  // Форматирование даты
  date: (value: string | Date, format = 'DD.MM.YYYY'): string => {
    return dayjs(value).format(format)
  },

  // Форматирование даты и времени
  datetime: (value: string | Date): string => {
    return dayjs(value).format('DD.MM.YYYY HH:mm')
  },

  // Относительное время (например, "2 часа назад")
  timeAgo: (value: string | Date): string => {
    return dayjs(value).fromNow()
  },

  // Форматирование телефона
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`
    }
    return value
  },

  // Сокращение длинного текста
  truncate: (value: string, length = 50): string => {
    if (value.length <= length) return value
    return value.substring(0, length) + '...'
  },

  // Форматирование размера файла
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Б'
    const k = 1024
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  // Форматирование ОГРН
  ogrn: (value: string): string => {
    return value.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{5})(\d{1})/, '$1 $2 $3 $4 $5 $6')
  },

  // Форматирование ИНН
  inn: (value: string): string => {
    if (value.length === 10) {
      return value.replace(/(\d{2})(\d{2})(\d{6})/, '$1 $2 $3')
    }
    return value.replace(/(\d{2})(\d{2})(\d{6})(\d{2})/, '$1 $2 $3 $4')
  },

  // Форматирование КПП
  kpp: (value: string): string => {
    return value.replace(/(\d{4})(\d{2})(\d{3})/, '$1 $2 $3')
  },

  // Форматирование полного имени пользователя
  fullName: (user: { last_name: string; first_name: string; patronymic?: string | null } | null | undefined): string => {
    if (!user) return ''
    const parts = [user.last_name, user.first_name]
    if (user.patronymic) {
      parts.push(user.patronymic)
    }
    return parts.join(' ')
  },

  // Получение инициала из имени
  initial: (user: { last_name: string; first_name: string; patronymic?: string | null } | null | undefined): string => {
    if (!user) return ''
    return user.last_name.charAt(0).toUpperCase()
  },
}
