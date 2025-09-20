'use client';

import Image from 'next/image';

export default function StreamSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Трансляция</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Live
        </span>
      </div>
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <Image
          src="/dashboard/stream.png"
          alt="Производственный процесс"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
        />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-50 rounded-lg p-3">
            <p className="text-white text-sm">Прямая трансляция с производства</p>
          </div>
        </div>
      </div>
    </div>
  );
}
