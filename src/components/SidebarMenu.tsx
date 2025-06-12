
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, User, Utensils, FileText } from 'lucide-react';

const SidebarMenu = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Utensils, label: 'Perfil Nutricional', path: '/nutritional-profile-consolidated' },
    { icon: FileText, label: 'Criar Perfil', path: '/nutritional-profile' },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-nutri-green-100 text-nutri-green-700 border-l-4 border-nutri-green-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;
