export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Заказы
        </h1>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              История заказов
            </h2>
            <p className="text-sm text-gray-600">
              Список всех заказов пользователя
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
