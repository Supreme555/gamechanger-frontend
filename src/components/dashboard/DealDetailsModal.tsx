'use client';

import { useState, useEffect } from 'react';
import { DealsService, DealDetails } from '@/lib/api/services';
import { useAuthContext } from '@/lib/auth';
import { 
  X, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare, 
  Phone,
  Target,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: number | null;
}

export default function DealDetailsModal({ isOpen, onClose, dealId }: DealDetailsModalProps) {
  const { isAuthenticated } = useAuthContext();
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Загрузка детальной информации о сделке
  useEffect(() => {
    const fetchDealDetails = async () => {
      if (!dealId || !isAuthenticated) return;

      try {
        setIsLoading(true);
        setErrorMessage('');
        const dealData = await DealsService.getDealById(dealId);
        setDeal(dealData);
      } catch (error) {
        console.error('Error fetching deal details:', error);
        const errorMsg = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
          : 'Ошибка загрузки сделки';
        setErrorMessage(errorMsg || 'Ошибка загрузки сделки');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && dealId) {
      fetchDealDetails();
    }
  }, [isOpen, dealId, isAuthenticated]);

  const handleClose = () => {
    setDeal(null);
    setErrorMessage('');
    onClose();
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

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${amount.toLocaleString('ru-RU')} ${symbol}`;
  };

  const getStageColor = (stageId: string) => {
    switch (stageId.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prepayment_invoice':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'work':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'final_invoice':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lose':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId?.toLowerCase()) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
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
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Подробная информация о сделке</h3>
              <p className="text-sm text-gray-600">Детальные данные и статус сделки</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Загрузка информации о сделке...</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {errorMessage}
          </div>
        ) : deal ? (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Левая колонка */}
              <div className="space-y-4">
                {/* Название и статус */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl font-semibold text-gray-900">{deal.title}</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(deal.stageId)}`}>
                      {deal.stageName || deal.stageId}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>ID сделки: #{deal.id}</p>
                    <p>Категория: {deal.categoryId}</p>
                    <p>Тип: {deal.typeId}</p>
                  </div>
                </div>

                {/* Финансовая информация */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h5 className="font-semibold text-gray-900">Финансы</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сумма сделки:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(deal.opportunity, deal.currencyId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Валюта:</span>
                      <span className="font-medium">{deal.currencyId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Вероятность:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{deal.probability}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Контакты */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-gray-900">Контакты</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ответственный:</span>
                      <span className="font-medium">ID {deal.assignedById}</span>
                    </div>
                    {deal.contactId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Контакт:</span>
                        <span className="font-medium">ID {deal.contactId}</span>
                      </div>
                    )}
                    {deal.companyId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Компания:</span>
                        <span className="font-medium">ID {deal.companyId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="space-y-4">
                {/* Даты */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h5 className="font-semibold text-gray-900">Временная шкала</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Создана:</span>
                      <span className="font-medium">{formatDate(deal.dateCreate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Изменена:</span>
                      <span className="font-medium">{formatDate(deal.dateModify)}</span>
                    </div>
                    {deal.closeDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Планируемое закрытие:</span>
                        <span className="font-medium">{formatDate(deal.closeDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Статус */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-gray-600" />
                    <h5 className="font-semibold text-gray-900">Статус сделки</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Открыта:</span>
                      <div className="flex items-center gap-1">
                        {deal.opened ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">{deal.opened ? 'Да' : 'Нет'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Закрыта:</span>
                      <div className="flex items-center gap-1">
                        {deal.closed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">{deal.closed ? 'Да' : 'Нет'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Источник */}
                {deal.sourceId && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getSourceIcon(deal.sourceId)}
                      <h5 className="font-semibold text-gray-900">Источник</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Тип:</span>
                        <span className="font-medium">{deal.sourceId}</span>
                      </div>
                      {deal.sourceDescription && (
                        <div>
                          <span className="text-gray-600">Описание:</span>
                          <p className="font-medium mt-1">{deal.sourceDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Комментарии */}
            {deal.comments && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-yellow-600" />
                  <h5 className="font-semibold text-gray-900">Комментарии</h5>
                </div>
                <p className="text-gray-700 leading-relaxed">{deal.comments}</p>
              </div>
            )}

            {/* Кнопка закрытия */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
