'use client';

import { Deal } from '@/lib/api/services';
import { FileText } from 'lucide-react';

interface RecentOrdersProps {
  orders: Deal[];
  isLoading: boolean;
}

export default function RecentOrders({ orders, isLoading }: RecentOrdersProps) {

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Заказы</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Заказов пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {orders.slice(0, 4).map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 text-base mb-2">
                  {order.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>ID: #{order.id}</span>
                  <span>{formatDate(order.dateCreate)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(order.stageId)}`}>
                  {order.stageName || order.stageId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
