"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/auth";
import {
  LayoutDashboard,
  User,
  Package,
  CreditCard,
  Radio,
  LogOut,
} from "lucide-react";

export interface HeaderProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { label: "Дашборд", href: "/dashboard/dashboard", icon: LayoutDashboard },
  { label: "Профиль", href: "/dashboard/profile", icon: User },
  { label: "Заказы", href: "/dashboard/orders", icon: Package },
  { label: "Платежи", href: "/dashboard/payments", icon: CreditCard },
  { label: "Трансляция", href: "/dashboard/stream", icon: Radio },
];

export default function Header({ className = "" }: HeaderProps) {
  const pathname = usePathname();
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={`w-full border-b bg-white ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Информация о пользователе */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.email || 'Пользователь'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </div>

          {/* Навигация и кнопка выхода */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2 overflow-x-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      `inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ` +
                      (isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200")
                    }
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-600"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors bg-red-100 text-red-800 hover:bg-red-200"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span>Выход</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


