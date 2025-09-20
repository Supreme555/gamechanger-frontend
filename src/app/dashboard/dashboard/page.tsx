export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Панель управления
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Карточки статистики будут здесь */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Статистика</h3>
            <p className="text-sm text-gray-600 mt-2">
              Основные показатели
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
