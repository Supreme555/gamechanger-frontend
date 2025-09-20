import { OrdersList } from '@/components/dashboard';

export default function OrdersPage() {
  return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="h-6 w-1.5 rounded bg-blue-600"></span>
        <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <OrdersList />
      </div>
    </div>
  );
}
