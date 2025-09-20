export default function ProfilePage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Профиль
        </h1>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Личная информация
            </h2>
            <p className="text-sm text-gray-600">
              Управление профилем пользователя
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
