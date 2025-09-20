'use client';

import { useState, useEffect } from 'react';
import { DealsService, Deal } from '@/lib/api/services';
import { useAuthContext } from '@/lib/auth';
import { RefreshCw, Calendar, Package, RotateCcw, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { CreateDealModal, DealDetailsModal, EditDealModal } from '../deals';

interface OrdersListProps {
  className?: string;
}

export default function OrdersList({ className = '' }: OrdersListProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [orders, setOrders] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepeating, setIsRepeating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Загрузка списка заказов только после завершения аутентификации
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders();
    } else if (!authLoading && !isAuthenticated) {
      // Если не аутентифицирован, сбрасываем состояние загрузки
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await DealsService.getDeals();
      setOrders(response.items);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Ошибка загрузки заказов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeatOrder = async (orderId: number) => {
    try {
      setIsRepeating(orderId);
      setErrorMessage('');
      setSuccessMessage('');

      await DealsService.repeatDeal(orderId);
      
      setSuccessMessage('Заказ успешно повторен');
      
      // Обновляем список заказов
      await fetchOrders();
    } catch (error) {
      console.error('Error repeating order:', error);
      const errorMsg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка повтора заказа';
      setErrorMessage(errorMsg || 'Ошибка повтора заказа');
    } finally {
      setIsRepeating(null);
    }
  };

  const handleCreateSuccess = () => {
    setSuccessMessage('Сделка успешно создана');
    fetchOrders();
  };

  const handleViewDetails = (dealId: number) => {
    setSelectedDealId(dealId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedDealId(null);
  };

  const handleEditDeal = (dealId: number) => {
    setSelectedDealId(dealId);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedDealId(null);
  };

  const handleEditSuccess = () => {
    setSuccessMessage('Сделка успешно обновлена');
    fetchOrders();
  };

  const handleDeleteDeal = (dealId: number) => {
    setShowDeleteConfirm(dealId);
  };

  const confirmDeleteDeal = async (dealId: number) => {
    try {
      setIsDeleting(dealId);
      setErrorMessage('');
      setShowDeleteConfirm(null);

      await DealsService.deleteDeal(dealId);
      
      setSuccessMessage('Сделка успешно удалена');
      await fetchOrders();
    } catch (error: unknown) {
      console.error('Error deleting deal:', error);
      const errorMsg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Ошибка удаления сделки';
      setErrorMessage(errorMsg || 'Ошибка удаления сделки');
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStageColor = (stageId: string) => {
    switch (stageId.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'prepayment_invoice':
        return 'bg-orange-100 text-orange-800';
      case 'work':
        return 'bg-purple-100 text-purple-800';
      case 'final_invoice':
        return 'bg-indigo-100 text-indigo-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lose':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Показываем загрузку если идет процесс аутентификации или загрузки заказов
  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">
            {authLoading ? 'Проверка аутентификации...' : 'Загрузка заказов...'}
          </p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Требуется авторизация</h3>
        <p className="text-gray-600">Войдите в систему для просмотра заказов</p>
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

      {/* Заголовок и кнопки */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">История заказов</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Создать сделку
          </button>
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>

      {/* Список заказов */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
          <p className="text-gray-600">Ваши заказы будут отображаться здесь</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(order.stageId)}`}
                    >
                      {order.stageName || order.stageId}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Создан: {formatDate(order.dateCreate)}</span>
                    </div>
                    <div>
                      <span>ID: #{order.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Подтверждение удаления */}
                  {showDeleteConfirm === order.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                      <span className="text-sm text-red-700">Удалить сделку?</span>
                      <button
                        onClick={() => confirmDeleteDeal(order.id)}
                        disabled={isDeleting === order.id}
                        className={`px-2 py-1 text-xs font-medium text-white rounded ${
                          isDeleting === order.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isDeleting === order.id ? 'Удаление...' : 'Да'}
                      </button>
                      <button
                        onClick={cancelDelete}
                        disabled={isDeleting === order.id}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        Нет
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Подробнее
                      </button>
                      <button
                        onClick={() => handleEditDeal(order.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100"
                      >
                        <Edit className="h-4 w-4" />
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(order.id)}
                        disabled={isDeleting === order.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </button>
                      <button
                        onClick={() => handleRepeatOrder(order.id)}
                        disabled={isRepeating === order.id}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isRepeating === order.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <RotateCcw className={`h-4 w-4 ${isRepeating === order.id ? 'animate-spin' : ''}`} />
                        {isRepeating === order.id ? 'Повтор...' : 'Повторить заказ'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal создания сделки */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal подробной информации */}
      <DealDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        dealId={selectedDealId}
      />

      {/* Modal редактирования сделки */}
      <EditDealModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
        dealId={selectedDealId}
      />
    </div>
  );
}
