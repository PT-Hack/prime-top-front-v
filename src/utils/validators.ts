export const validators = {
  required: (value: string) => !!value || 'Это поле обязательно для заполнения',

  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Введите корректный email'
  },

  minLength: (min: number) => (value: string) => {
    return value.length >= min || `Минимальная длина ${min} символов`
  },

  maxLength: (max: number) => (value: string) => {
    return value.length <= max || `Максимальная длина ${max} символов`
  },

  password: (value: string) => {
    if (value.length < 6) return 'Пароль должен содержать минимум 6 символов'
    return true
  },

  passwordMatch: (password: string) => (value: string) => {
    return value === password || 'Пароли не совпадают'
  },

  phone: (value: string) => {
    const pattern = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/
    return pattern.test(value) || 'Введите корректный номер телефона'
  },

  inn: (value: string) => {
    const pattern = /^\d{10}$|^\d{12}$/
    return pattern.test(value) || 'ИНН должен содержать 10 или 12 цифр'
  },

  ogrn: (value: string) => {
    const pattern = /^\d{13}$|^\d{15}$/
    return pattern.test(value) || 'ОГРН должен содержать 13 или 15 цифр'
  },

  kpp: (value: string) => {
    const pattern = /^\d{9}$/
    return pattern.test(value) || 'КПП должен содержать 9 цифр'
  },

  positiveNumber: (value: number) => {
    return value > 0 || 'Значение должно быть больше 0'
  },
}

export const validateField = (value: unknown, rules: Array<(v: any) => boolean | string>) => {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      return result
    }
  }
  return true
}
