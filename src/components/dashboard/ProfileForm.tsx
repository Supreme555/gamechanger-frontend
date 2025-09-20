'use client';

import { useState, useEffect } from 'react';
import { validateEmail, validateRequired, validateName } from '@/lib/validation/validators';
import { useAuthContext } from '@/lib/auth';
import { UsersService } from '@/lib/api/services';
import Image from 'next/image';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
}


export default function ProfileForm() {
  const { user } = useAuthContext();
  const [form, setForm] = useState<ProfileFormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<keyof ProfileFormState, string>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Загрузка профиля пользователя
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await UsersService.getProfile();
        
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrorMessage('Ошибка загрузки профиля');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Очищаем сообщения при изменении полей
    setSuccessMessage('');
    setErrorMessage('');

    let error = '';
    if (name === 'email') error = validateEmail(value);
    else if (name === 'name') error = validateName(value);
    else error = validateRequired(value);
    setErrors((prev) => ({ ...prev, [name]: error } as typeof prev));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация полей
    const newErrors: Record<keyof ProfileFormState, string> = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validateRequired(form.phone),
      address: validateRequired(form.address),
    };
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some((v) => v !== '');
    if (hasErrors) {
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      // Отправляем данные на сервер
      const updateData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };

      await UsersService.updateProfile(updateData);
      
      setSuccessMessage('Профиль успешно обновлен');
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка обновления профиля';
      setErrorMessage(errorMessage || 'Ошибка обновления профиля');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="h-[120px] w-[120px] rounded-full border-2 border-blue-600 bg-gray-100 grid place-items-center overflow-hidden">
          <Image src="/file.svg" alt="avatar" width={40} height={40} />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Сообщения об успехе и ошибках */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Имя"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="name@mail.ru"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+7 (999) 000-00-00"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Адрес"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full rounded-md py-3 font-medium transition-colors ${
            isSaving
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Сохранение...' : 'Редактировать'}
        </button>
      </form>
    </div>
  );
}


