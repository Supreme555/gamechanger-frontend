'use client';

import { User } from 'lucide-react';

interface Payment {
  id: number;
  name: string;
  email: string;
  status: 'paid' | 'unpaid';
  progress: number;
}

const mockPayments: Payment[] = [
  { id: 1, name: 'Имя', email: 'name@mail.ru', status: 'unpaid', progress: 0 },
  { id: 2, name: 'Gregory Davis A', email: 'gregory.davis@sup.com', status: 'paid', progress: 73 },
  { id: 3, name: 'Gregory Davis A', email: 'gregory.davis@sup.com', status: 'paid', progress: 71 }
];

export default function RecentPayments() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Платежи</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Все платежи за последнюю неделю →
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 font-medium pb-3 border-b border-gray-200">
          <span>Employee</span>
          <span>Статус</span>
          <span>Выполнение</span>
          <span>Действие</span>
        </div>
        {mockPayments.map((payment) => (
          <div key={payment.id} className="grid grid-cols-4 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{payment.name}</p>
                <p className="text-xs text-gray-500 truncate">{payment.email}</p>
              </div>
            </div>
            <div>
              {payment.status === 'paid' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Оплачено
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Не оплачено
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    payment.progress > 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${payment.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-0 font-medium">{payment.progress}%</span>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Смотреть
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
