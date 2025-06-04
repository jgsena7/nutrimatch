
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#18230F] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Logo/Nome da Marca */}
          <div className="mb-6">
            <span className="text-4xl font-bold">
              <span className="text-[#A4DA14] font-extrabold">Nutri</span>
              <span className="text-white">Match</span>
            </span>
          </div>

          {/* Slogan/Tagline */}
          <div className="mb-8">
            <p className="text-white text-lg font-normal">
              Sua dieta, do seu jeito.
            </p>
          </div>

          {/* Links de Navegação do Rodapé */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center space-x-8 text-sm text-white">
              <a href="#" className="hover:text-[#A4DA14] transition-colors">Termos</a>
              <a href="#" className="hover:text-[#A4DA14] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#A4DA14] transition-colors">Contato</a>
              <a href="#" className="hover:text-[#A4DA14] transition-colors">API</a>
              <a href="#" className="hover:text-[#A4DA14] transition-colors">Feedback</a>
            </div>
          </div>

          {/* Texto de Copyright */}
          <div className="mb-2">
            <p className="text-xs text-white">
              © 2025 NutriMatch. Todos os direitos reservados.
            </p>
          </div>

          {/* Informação de Localização */}
          <div>
            <p className="text-xs text-white">
              Salvador, Bahia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
