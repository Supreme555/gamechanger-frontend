type PaymentRow = {
  invoice: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
};

const rows: PaymentRow[] = [
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'unpaid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
  { invoice: '321312321', date: '16.03.2025', amount: 15000, status: 'paid' },
];

export default function PaymentsPage() {
  const formatCurrency = (value: number) =>
    `${value.toLocaleString('ru-RU')} тг`;

  return (
    <div className="py-6">
      {/* Title block */}
      <div className="mb-6 rounded-md border bg-gray-100 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Платежи</h1>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Номер счета</th>
                <th className="px-6 py-3">Дата</th>
                <th className="px-6 py-3">Сумма</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr
                  key={`${row.invoice}-${idx}`}
                  className={`text-sm text-gray-700 tabular-nums ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50/40`}
                >
                  <td className="px-6 py-4">{row.invoice}</td>
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4">{formatCurrency(row.amount)}</td>
                  <td className="px-6 py-4">
                    {row.status === 'paid' ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Оплачено
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        Не оплачено
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === 'unpaid' ? (
                      <button className="rounded-md bg-black px-4 py-1.5 text-sm text-white shadow-sm ring-1 ring-black/10 transition-colors hover:bg-gray-900">
                        Оплатить
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
