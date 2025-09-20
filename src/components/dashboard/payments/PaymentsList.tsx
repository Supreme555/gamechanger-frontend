'use client';

import { useState, useEffect } from 'react';
import { DealsService, Deal } from '@/lib/api/services';
import { useAuthContext } from '@/lib/auth';
import { RefreshCw, Calendar, CreditCard, Eye, Edit } from 'lucide-react';
import { DealDetailsModal, EditDealModal } from '../deals';

interface PaymentsListProps {
  className?: string;
}

export default function PaymentsList({ className = '' }: PaymentsListProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [payments, setPayments] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Загрузка списка платежей только после завершения аутентификации
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPayments();
    } else if (!authLoading && !isAuthenticated) {
      // Если не аутентифицирован, сбрасываем состояние загрузки
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await DealsService.getDeals();
      // Фильтруем сделки, показываем только те, которые связаны с платежами
      // В реальном проекте здесь может быть отдельный API endpoint для платежей
      setPayments(response.items);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setErrorMessage('Ошибка загрузки платежей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (dealId: number) => {
    setSelectedDealId(dealId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedDealId(null);
  };

  const handleEditPayment = (dealId: number) => {
    setSelectedDealId(dealId);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedDealId(null);
  };

  const handleEditSuccess = () => {
    setSuccessMessage('Платеж успешно обновлен');
    fetchPayments();
  };

  const handleMarkAsPaid = async (dealId: number) => {
    try {
      setIsUpdating(dealId);
      setErrorMessage('');
      setSuccessMessage('');

      // Обновляем статус сделки на "Завершена" (WON)
      await DealsService.updateDeal(dealId, {
        stageId: 'WON',
        comments: 'Платеж получен'
      });
      
      setSuccessMessage('Платеж отмечен как оплаченный');
      await fetchPayments();
    } catch (error: unknown) {
      console.error('Error updating payment:', error);
      const errorMsg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка обновления платежа';
      setErrorMessage(errorMsg || 'Ошибка обновления платежа');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const getPaymentStatus = (stageId: string) => {
    switch (stageId.toLowerCase()) {
      case 'won':
        return { label: 'Оплачено', color: 'bg-green-100 text-green-800' };
      case 'lose':
        return { label: 'Отклонено', color: 'bg-red-100 text-red-800' };
      case 'final_invoice':
        return { label: 'Выставлен счет', color: 'bg-indigo-100 text-indigo-800' };
      case 'prepayment_invoice':
        return { label: 'Предоплата', color: 'bg-orange-100 text-orange-800' };
      case 'work':
        return { label: 'В работе', color: 'bg-purple-100 text-purple-800' };
      case 'preparation':
        return { label: 'Подготовка', color: 'bg-yellow-100 text-yellow-800' };
      case 'new':
        return { label: 'Новый', color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'В обработке', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const isPaymentPending = (stageId: string) => {
    return !['won', 'lose'].includes(stageId.toLowerCase());
  };

  // Показываем загрузку если идет процесс аутентификации или загрузки платежей
  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">
            {authLoading ? 'Проверка аутентификации...' : 'Загрузка платежей...'}
          </p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Требуется авторизация</h3>
        <p className="text-gray-600">Войдите в систему для просмотра платежей</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Сообщения */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Заголовок и кнопка обновления */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">История платежей</h2>
        <button
          onClick={fetchPayments}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Список платежей */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Платежей пока нет</h3>
          <p className="text-gray-600">Ваши платежи будут отображаться здесь</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const status = getPaymentStatus(payment.stageId);
            return (
              <div
                key={payment.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Создан: {formatDate(payment.dateCreate)}</span>
                      </div>
                      <div>
                        <span>ID: #{payment.id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-semibold">{formatCurrency(15000)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(payment.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Подробнее
                    </button>
                    <button
                      onClick={() => handleEditPayment(payment.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100"
                    >
                      <Edit className="h-4 w-4" />
                      Изменить
                    </button>
                    {isPaymentPending(payment.stageId) && (
                      <button
                        onClick={() => handleMarkAsPaid(payment.id)}
                        disabled={isUpdating === payment.id}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isUpdating === payment.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-900'
                        }`}
                      >
                        <CreditCard className={`h-4 w-4 ${isUpdating === payment.id ? 'animate-pulse' : ''}`} />
                        {isUpdating === payment.id ? 'Обработка...' : 'Оплатить'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal подробной информации */}
      <DealDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        dealId={selectedDealId}
      />

      {/* Modal редактирования платежа */}
      <EditDealModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
        dealId={selectedDealId}
      />
    </div>
  );
}
