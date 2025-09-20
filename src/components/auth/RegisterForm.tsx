'use client';

import { useState } from 'react';
import { validateConfirmPassword, validateEmail, validatePassword, validateRequired } from '@/lib/validation/validators';
import { useAuthContext } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface RegisterFormProps {
  className?: string;
}

export default function RegisterForm({ className = '' }: RegisterFormProps) {
  const { register, isLoading } = useAuthContext();
  const isMobileWhite = className.includes('text-white');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(formData.password, value);
      default:
        return validateRequired(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Валидация при изменении поля
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация всех полей
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword)
    };
    
    setErrors(newErrors);
    setSubmitError('');
    
    // Проверка на наличие ошибок
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      const result = await register({
        email: formData.email,
        password: formData.password
      });

      if (!result.success) {
        setSubmitError(result.error || 'Ошибка регистрации');
      }
    }
  };

  // Проверка, есть ли ошибки или пустые поля
  const hasErrors = Object.values(errors).some(error => error !== '');
  const hasEmptyFields = Object.values(formData).some(value => !value.trim());
  const isSubmitDisabled = hasErrors || hasEmptyFields || isLoading;

  return (
    <div className={className}>
      {/* Логотип */}
      <div className="text-center mb-6">
        <h1 className={`text-2xl font-bold ${isMobileWhite ? 'text-white' : 'text-gray-900'}`}>ЛОГОТИП</h1>
      </div>

      {/* Заголовок */}
      <div className="text-center mb-6">
        <h2 className={`text-xl font-semibold ${isMobileWhite ? 'text-white' : 'text-gray-900'}`}>Регистрация</h2>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Поле email */}
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isMobileWhite ? 'text-white' : 'text-gray-700'}`}>
            Почта
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tgmlm@gmail.ru"
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Поле пароля */}
        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isMobileWhite ? 'text-white' : 'text-gray-700'}`}>
            Пароль
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••••••••"
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <Eye className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Поле подтверждения пароля */}
        <div>
          <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${isMobileWhite ? 'text-white' : 'text-gray-700'}`}>
            Повторите пароль
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••••••••"
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <Eye className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Ошибка отправки */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSubmitDisabled
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
          }`}
        >
          {isLoading ? 'Регистрация...' : 'Отправить'}
        </button>
      </form>

      {/* Ссылки внизу */}
      <div className="mt-6">
        <div className="flex items-center gap-3 my-4">
          <div className={`h-px flex-1 ${isMobileWhite ? 'bg-white/40' : 'bg-gray-200'}`}></div>
          <span className={`text-sm ${isMobileWhite ? 'text-gray-300' : 'text-gray-500'}`}>или</span>
          <div className={`h-px flex-1 ${isMobileWhite ? 'bg-white/40' : 'bg-gray-200'}`}></div>
        </div>
        <div className="text-center">
          <Link 
            href="/auth/login" 
            className={`text-sm ${isMobileWhite ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Вход
          </Link>
        </div>
      </div>
    </div>
  );
}
