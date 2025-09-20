'use client';

import { useState, useEffect } from 'react';
import { DealsService, CreateDealDto } from '@/lib/api/services';
import { useAuthContext } from '@/lib/auth';
import { validateRequired } from '@/lib/validation/validators';
import { X, Edit, DollarSign, Calendar, User, Building2, MessageSquare, Phone, Target } from 'lucide-react';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dealId: number | null;
}

interface EditDealForm {
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
  typeId: string;
  probability: string;
  sourceId: string;
  sourceDescription: string;
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

const TYPE_OPTIONS = [
  { value: 'SALE', label: 'Продажа' },
  { value: 'RECURRING', label: 'Повторная' },
];

const SOURCE_OPTIONS = [
  { value: 'CALL', label: 'Звонок' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WEB', label: 'Сайт' },
  { value: 'ADVERTISING', label: 'Реклама' },
  { value: 'PARTNER', label: 'Партнер' },
  { value: 'RECOMMENDATION', label: 'Рекомендация' },
  { value: 'OTHER', label: 'Другое' },
];

export default function EditDealModal({ isOpen, onClose, onSuccess, dealId }: EditDealModalProps) {
  const { isAuthenticated } = useAuthContext();
  const [form, setForm] = useState<EditDealForm>({
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
    typeId: 'SALE',
    probability: '50',
    sourceId: 'CALL',
    sourceDescription: '',
  });

  const [errors, setErrors] = useState<Record<keyof EditDealForm, string>>({
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
    typeId: '',
    probability: '',
    sourceId: '',
    sourceDescription: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Загрузка данных сделки при открытии модального окна
  useEffect(() => {
    const fetchDealData = async () => {
      if (!dealId || !isAuthenticated) return;

      try {
        setIsLoading(true);
        setErrorMessage('');
        const deal = await DealsService.getDealById(dealId);
        
        // Заполняем форму данными из сделки
        setForm({
          title: deal.title || '',
          stageId: deal.stageId || 'NEW',
          opportunity: deal.opportunity?.toString() || '',
          currencyId: deal.currencyId || 'RUB',
          assignedById: deal.assignedById?.toString() || '1',
          contactId: deal.contactId?.toString() || '',
          companyId: deal.companyId?.toString() || '',
          comments: deal.comments || '',
          closeDate: deal.closeDate ? deal.closeDate.slice(0, 16) : '', // Формат для datetime-local
          categoryId: deal.categoryId?.toString() || '0',
          typeId: deal.typeId || 'SALE',
          probability: deal.probability?.toString() || '50',
          sourceId: deal.sourceId || 'CALL',
          sourceDescription: deal.sourceDescription || '',
        });
      } catch (error) {
        console.error('Error fetching deal:', error);
        const errorMsg = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
          : 'Ошибка загрузки сделки';
        setErrorMessage(errorMsg || 'Ошибка загрузки сделки');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && dealId) {
      fetchDealData();
    }
  }, [isOpen, dealId, isAuthenticated]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибки при изменении
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMessage('');
  };

  const validateForm = () => {
    const newErrors: Record<keyof EditDealForm, string> = {
      title: validateRequired(form.title),
      stageId: validateRequired(form.stageId),
      opportunity: form.opportunity ? (isNaN(Number(form.opportunity)) || Number(form.opportunity) < 0 ? 'Введите корректную сумму' : '') : '',
      currencyId: validateRequired(form.currencyId),
      assignedById: form.assignedById ? (isNaN(Number(form.assignedById)) ? 'Введите корректный ID' : '') : '',
      contactId: form.contactId ? (isNaN(Number(form.contactId)) ? 'Введите корректный ID контакта' : '') : '',
      companyId: form.companyId ? (isNaN(Number(form.companyId)) ? 'Введите корректный ID компании' : '') : '',
      comments: '',
      closeDate: '',
      categoryId: form.categoryId ? (isNaN(Number(form.categoryId)) ? 'Введите корректный ID категории' : '') : '',
      typeId: validateRequired(form.typeId),
      probability: form.probability ? (isNaN(Number(form.probability)) || Number(form.probability) < 0 || Number(form.probability) > 100 ? 'Введите значение от 0 до 100' : '') : '',
      sourceId: validateRequired(form.sourceId),
      sourceDescription: '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !dealId) {
      setErrorMessage('Необходимо войти в систему для редактирования сделки');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const dealData: Partial<CreateDealDto> & { 
        typeId?: string; 
        probability?: number; 
        sourceId?: string; 
        sourceDescription?: string; 
      } = {
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
        ...(form.typeId && { typeId: form.typeId }),
        ...(form.probability && { probability: Number(form.probability) }),
        ...(form.sourceId && { sourceId: form.sourceId }),
        ...(form.sourceDescription && { sourceDescription: form.sourceDescription }),
      };

      await DealsService.updateDeal(dealId, dealData);

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error updating deal:', error);
      const errorMsg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка обновления сделки';
      setErrorMessage(errorMsg || 'Ошибка обновления сделки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrorMessage('');
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
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-lg p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
              <Edit className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Редактировать сделку</h3>
              <p className="text-sm text-gray-600">Обновите информацию о сделке</p>
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

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              <p className="text-gray-600">Загрузка данных сделки...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Название сделки */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Название сделки *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Обновленная сделка #001"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.stageId ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    {STAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.stageId && <p className="mt-1 text-sm text-red-600">{errors.stageId}</p>}
                </div>

                {/* Тип сделки */}
                <div>
                  <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Тип сделки *
                  </label>
                  <select
                    id="typeId"
                    name="typeId"
                    value={form.typeId}
                    onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.typeId ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.typeId && <p className="mt-1 text-sm text-red-600">{errors.typeId}</p>}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.currencyId ? 'border-red-300' : 'border-gray-300'}`}
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
                    min="0"
                    value={form.opportunity}
                    onChange={onChange}
                    placeholder="150000"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.opportunity ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.opportunity && <p className="mt-1 text-sm text-red-600">{errors.opportunity}</p>}
                </div>

                {/* Вероятность */}
                <div>
                  <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-1">
                    <Target className="inline w-4 h-4 mr-1" />
                    Вероятность (%)
                  </label>
                  <input
                    id="probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability}
                    onChange={onChange}
                    placeholder="75"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.probability ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.probability && <p className="mt-1 text-sm text-red-600">{errors.probability}</p>}
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
                    placeholder="2"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.assignedById ? 'border-red-300' : 'border-gray-300'}`}
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
                    placeholder="234"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.contactId ? 'border-red-300' : 'border-gray-300'}`}
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
                    placeholder="567"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.companyId ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>}
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
                    placeholder="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                </div>

                {/* Источник */}
                <div>
                  <label htmlFor="sourceId" className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Источник *
                  </label>
                  <select
                    id="sourceId"
                    name="sourceId"
                    value={form.sourceId}
                    onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.sourceId ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.sourceId && <p className="mt-1 text-sm text-red-600">{errors.sourceId}</p>}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.closeDate ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.closeDate && <p className="mt-1 text-sm text-red-600">{errors.closeDate}</p>}
                </div>

                {/* Описание источника */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="sourceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание источника
                  </label>
                  <input
                    id="sourceDescription"
                    name="sourceDescription"
                    type="text"
                    value={form.sourceDescription}
                    onChange={onChange}
                    placeholder="Входящий звонок от клиента"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.sourceDescription ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.sourceDescription && <p className="mt-1 text-sm text-red-600">{errors.sourceDescription}</p>}
                </div>

                {/* Комментарии */}
                <div className="sm:col-span-2 lg:col-span-3">
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
                    placeholder="Обновленный комментарий"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.comments ? 'border-red-300' : 'border-gray-300'}`}
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
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
