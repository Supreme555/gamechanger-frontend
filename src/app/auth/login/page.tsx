import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Мобильная версия с фоном машины */}
      <div 
        className="lg:hidden relative min-h-screen bg-cover bg-center" 
        style={{backgroundImage: 'url(/auth/car.png)'}}
      >
        <div className="absolute inset-0 bg-white bg-opacity-40"></div>
        <div className="relative z-10 min-h-screen flex flex-col justify-center px-4">
          <div className="w-full max-w-sm mx-auto bg-white rounded-lg p-6">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Десктопная версия */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Правая часть с изображением для десктопа */}
      <div className="hidden lg:block lg:flex-1 relative">
        <Image
          src="/auth/car.png"
          alt="Car"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}