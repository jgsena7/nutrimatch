
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#3A5B32] w-full py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          Venha conosco para uma vida melhor!
        </h2>
        <h3 className="text-2xl lg:text-3xl font-semibold text-white mb-8">
          Invista no seu futuro
        </h3>
        <Button 
          size="lg"
          onClick={() => navigate('/register')}
          className="bg-[#A8D12F] hover:bg-[#96c028] text-black px-8 py-3 text-lg rounded-full font-medium shadow-lg"
        >
          Associar-se
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
