
import React, { useState } from 'react';
import { Menu, X, Home, User, Utensils, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado com sucesso!",
        description: "Você foi desconectado.",
      });
      navigate('/');
    }
    setIsOpen(false);
  };

  const menuItems = [
    { icon: Home, label: "Início", action: () => navigate('/') },
    { icon: User, label: "Meu Perfil", action: () => navigate('/profile') },
    { icon: Utensils, label: "Plano Alimentar", action: () => navigate('/nutritional-profile') },
    { icon: LogOut, label: "Sair", action: handleSignOut },
  ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-nutri-green-500 text-white rounded-md hover:bg-nutri-green-600 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-nutri-dark-900">
              <span className="text-nutri-green-500">Nutri</span>Match
            </h2>
          </div>
          
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={item.action}
                    className="flex items-center w-full p-3 text-left text-nutri-dark-700 hover:bg-nutri-green-50 hover:text-nutri-green-600 rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
