
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#18230F] w-full py-12">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            <span className="text-[#A4DA14]">Nutri</span>
            <span className="text-white">Match</span>
          </h2>
          <p className="text-white text-lg mb-8">
            Sua dieta, do seu jeito.
          </p>
        </div>

        <nav className="mb-4">
          <div className="flex flex-wrap justify-center items-center space-x-6 text-white text-sm">
            <a href="#" className="hover:text-[#A4DA14] transition-colors">Termos</a>
            <a href="#" className="hover:text-[#A4DA14] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#A4DA14] transition-colors">Contato</a>
            <a href="#" className="hover:text-[#A4DA14] transition-colors">API</a>
            <a href="#" className="hover:text-[#A4DA14] transition-colors">Feedback</a>
          </div>
        </nav>

        <div className="text-white text-xs">
          <p className="mb-2">
            © 2025 NutriMatch. Todos os direitos reservados.
          </p>
          <p>
            Salvador, Bahia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
