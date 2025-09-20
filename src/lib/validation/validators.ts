export function validateRequired(value: string): string {
  return value.trim() ? '' : 'Поле обязательно для заполнения';
}

export function validateEmail(value: string): string {
  const required = validateRequired(value);
  if (required) return required;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? ''
    : 'Некорректный формат email адреса';
}

export function validateLogin(value: string): string {
  const required = validateRequired(value);
  if (required) return required;
  return value.length >= 3 ? '' : 'Логин должен содержать минимум 3 символа';
}

export function validatePassword(value: string): string {
  const required = validateRequired(value);
  if (required) return required;
  if (value.length < 6) {
    return 'Пароль должен содержать минимум 6 символов';
  }
  if (!/^(?=.*[A-Z])(?=.*\d).+$/.test(value)) {
    return 'Пароль должен содержать одну заглавную букву и одну цифру';
  }
  return '';
}

export function validateConfirmPassword(password: string, confirm: string): string {
  const required = validateRequired(confirm);
  if (required) return required;
  return password === confirm ? '' : 'Пароли должны совпадать';
}


