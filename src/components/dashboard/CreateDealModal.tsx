'use client';

import { useState } from 'react';
import { DealsService, CreateDealDto } from '@/lib/api/services';
import { useAuthContext } from '@/lib/auth';
import { validateRequired } from '@/lib/validation/validators';
import { X, Plus, DollarSign, Calendar, User, Building2, MessageSquare } from 'lucide-react';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateDealForm {
  title: string;
  stageId: string;
  opportunity: string;
  currencyId: string;
  assignedById: string;
  contactId: string;
  companyId: string;
  comments: string;
  closeDate: string;
  categoryId: string;
}

const STAGE_OPTIONS = [
  { value: 'NEW', label: 'Новая' },
  { value: 'PREPARATION', label: 'Подготовка документов' },
  { value: 'PREPAYMENT_INVOICE', label: 'Счёт на предоплату' },
  { value: 'WORK', label: 'В работе' },
  { value: 'FINAL_INVOICE', label: 'Финальный счёт' },
  { value: 'WON', label: 'Завершить сделку' },
];

const CURRENCY_OPTIONS = [
  { value: 'RUB', label: 'RUB (₽)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

export default function CreateDealModal({ isOpen, onClose, onSuccess }: CreateDealModalProps) {
  const { isAuthenticated } = useAuthContext();
  const [form, setForm] = useState<CreateDealForm>({
    title: '',
    stageId: 'NEW',
    opportunity: '',
    currencyId: 'RUB',
    assignedById: '1',
    contactId: '',
    companyId: '',
    comments: '',
    closeDate: '',
    categoryId: '0',
  });

  const [errors, setErrors] = useState<Record<keyof CreateDealForm, string>>({
    title: '',
    stageId: '',
    opportunity: '',
    currencyId: '',
    assignedById: '',
    contactId: '',
    companyId: '',
    comments: '',
    closeDate: '',
    categoryId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибки при изменении
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMessage('');
  };

  const validateForm = () => {
    const newErrors: Record<keyof CreateDealForm, string> = {
      title: validateRequired(form.title),
      stageId: validateRequired(form.stageId),
      opportunity: form.opportunity ? (isNaN(Number(form.opportunity)) ? 'Введите корректную сумму' : '') : '',
      currencyId: validateRequired(form.currencyId),
      assignedById: form.assignedById ? (isNaN(Number(form.assignedById)) ? 'Введите корректный ID' : '') : '',
      contactId: form.contactId ? (isNaN(Number(form.contactId)) ? 'Введите корректный ID контакта' : '') : '',
      companyId: form.companyId ? (isNaN(Number(form.companyId)) ? 'Введите корректный ID компании' : '') : '',
      comments: '',
      closeDate: '',
      categoryId: form.categoryId ? (isNaN(Number(form.categoryId)) ? 'Введите корректный ID категории' : '') : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setErrorMessage('Необходимо войти в систему для создания сделки');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const dealData: CreateDealDto = {
        title: form.title,
        stageId: form.stageId,
        ...(form.opportunity && { opportunity: Number(form.opportunity) }),
        currencyId: form.currencyId,
        ...(form.assignedById && { assignedById: Number(form.assignedById) }),
        ...(form.contactId && { contactId: Number(form.contactId) }),
        ...(form.companyId && { companyId: Number(form.companyId) }),
        ...(form.comments && { comments: form.comments }),
        ...(form.closeDate && { closeDate: form.closeDate }),
        ...(form.categoryId && { categoryId: Number(form.categoryId) }),
      };

      await DealsService.createDeal(dealData);

      // Сброс формы
      setForm({
        title: '',
        stageId: 'NEW',
        opportunity: '',
        currencyId: 'RUB',
        assignedById: '1',
        contactId: '',
        companyId: '',
        comments: '',
        closeDate: '',
        categoryId: '0',
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating deal:', error);
      const errorMsg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка создания сделки';
      setErrorMessage(errorMsg || 'Ошибка создания сделки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-lg p-6 z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Создать новую сделку</h3>
                <p className="text-sm text-gray-600">Заполните информацию о новой сделке</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Название сделки */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название сделки *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Новая сделка #001"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Стадия */}
              <div>
                <label htmlFor="stageId" className="block text-sm font-medium text-gray-700 mb-1">
                  Стадия *
                </label>
                <select
                  id="stageId"
                  name="stageId"
                  value={form.stageId}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stageId ? 'border-red-300' : 'border-gray-300'}`}
                >
                  {STAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.stageId && <p className="mt-1 text-sm text-red-600">{errors.stageId}</p>}
              </div>

              {/* Валюта */}
              <div>
                <label htmlFor="currencyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Валюта *
                </label>
                <select
                  id="currencyId"
                  name="currencyId"
                  value={form.currencyId}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.currencyId ? 'border-red-300' : 'border-gray-300'}`}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.currencyId && <p className="mt-1 text-sm text-red-600">{errors.currencyId}</p>}
              </div>

              {/* Сумма сделки */}
              <div>
                <label htmlFor="opportunity" className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Сумма сделки
                </label>
                <input
                  id="opportunity"
                  name="opportunity"
                  type="number"
                  value={form.opportunity}
                  onChange={onChange}
                  placeholder="100000"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.opportunity ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.opportunity && <p className="mt-1 text-sm text-red-600">{errors.opportunity}</p>}
              </div>

              {/* Ответственный */}
              <div>
                <label htmlFor="assignedById" className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-4 h-4 mr-1" />
                  ID Ответственного
                </label>
                <input
                  id="assignedById"
                  name="assignedById"
                  type="number"
                  value={form.assignedById}
                  onChange={onChange}
                  placeholder="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.assignedById ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.assignedById && <p className="mt-1 text-sm text-red-600">{errors.assignedById}</p>}
              </div>

              {/* ID Контакта */}
              <div>
                <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Контакта
                </label>
                <input
                  id="contactId"
                  name="contactId"
                  type="number"
                  value={form.contactId}
                  onChange={onChange}
                  placeholder="123"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactId ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.contactId && <p className="mt-1 text-sm text-red-600">{errors.contactId}</p>}
              </div>

              {/* ID Компании */}
              <div>
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="inline w-4 h-4 mr-1" />
                  ID Компании
                </label>
                <input
                  id="companyId"
                  name="companyId"
                  type="number"
                  value={form.companyId}
                  onChange={onChange}
                  placeholder="456"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyId ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>}
              </div>

              {/* Дата закрытия */}
              <div>
                <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Дата закрытия
                </label>
                <input
                  id="closeDate"
                  name="closeDate"
                  type="datetime-local"
                  value={form.closeDate}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.closeDate ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.closeDate && <p className="mt-1 text-sm text-red-600">{errors.closeDate}</p>}
              </div>

              {/* ID Категории */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Категории
                </label>
                <input
                  id="categoryId"
                  name="categoryId"
                  type="number"
                  value={form.categoryId}
                  onChange={onChange}
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>

              {/* Комментарии */}
              <div className="sm:col-span-2">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="inline w-4 h-4 mr-1" />
                  Комментарии
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={form.comments}
                  onChange={onChange}
                  rows={3}
                  placeholder="Важная сделка от нового клиента"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.comments ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.comments && <p className="mt-1 text-sm text-red-600">{errors.comments}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Создание...' : 'Создать сделку'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
