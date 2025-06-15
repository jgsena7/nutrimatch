
import React, { useState, useEffect } from 'react';
import { aiImageService } from '@/services/aiImageService';

interface AIFoodImageProps {
  foodName: string;
  category?: string;
  fallbackImage: string;
  alt: string;
  className?: string;
  onImageLoad?: (imageUrl: string) => void;
}

export const AIFoodImage: React.FC<AIFoodImageProps> = ({
  foodName,
  category,
  fallbackImage,
  alt,
  className = '',
  onImageLoad
}) => {
  const [currentImage, setCurrentImage] = useState(fallbackImage);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasAIImage, setHasAIImage] = useState(false);

  useEffect(() => {
    const loadAIImage = async () => {
      try {
        setIsLoadingAI(true);
        
        // Tentar obter imagem gerada pela IA
        const aiImageUrl = await aiImageService.generateFoodImage(foodName, category);
        
        if (aiImageUrl && aiImageUrl !== fallbackImage) {
          setCurrentImage(aiImageUrl);
          setHasAIImage(true);
          onImageLoad?.(aiImageUrl);
        }
      } catch (error) {
        console.warn(`Falha ao carregar imagem IA para ${foodName}:`, error);
        // Manter a imagem de fallback
      } finally {
        setIsLoadingAI(false);
      }
    };

    loadAIImage();
  }, [foodName, category, fallbackImage, onImageLoad]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={currentImage}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoadingAI && !hasAIImage ? 'opacity-75' : 'opacity-100'
        }`}
        onError={(e) => {
          // Se a imagem falhar, usar fallback
          if (currentImage !== fallbackImage) {
            setCurrentImage(fallbackImage);
            setHasAIImage(false);
          }
        }}
      />
      
      {/* Indicador de loading para IA */}
      {isLoadingAI && !hasAIImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Badge sutil indicando imagem gerada por IA */}
      {hasAIImage && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded opacity-75">
          IA
        </div>
      )}
    </div>
  );
};
