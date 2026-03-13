import React from 'react';

interface CharacterSpriteProps {
  emotion: 'happy' | 'shy' | 'angry' | 'neutral' | 'sad';
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ emotion }) => {
  // Mapping emotions to simple emoji/color overlays or distinct styles
  // In a real app, these would be different image URLs
  
  const getExpression = () => {
    switch (emotion) {
      case 'happy': return '^_^';
      case 'shy': return '>///<';
      case 'angry': return '>:(';
      case 'sad': return 'T_T';
      default: return '._.';
    }
  };

  const getColorOverlay = () => {
    switch (emotion) {
      case 'happy': return 'bg-yellow-500/10 shadow-[0_0_50px_rgba(234,179,8,0.3)]';
      case 'shy': return 'bg-pink-500/10 shadow-[0_0_50px_rgba(236,72,153,0.3)]';
      case 'angry': return 'bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)]';
      case 'sad': return 'bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)]';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className={`relative w-full h-full flex items-end justify-center transition-all duration-500`}>
       {/* Abstract Character Body */}
       <div className={`relative w-64 h-[28rem] md:w-80 md:h-[32rem] rounded-t-[100px] overflow-hidden transition-all duration-500 ${emotion === 'angry' ? 'translate-y-2' : ''} ${emotion === 'happy' ? '-translate-y-2' : ''}`}>
          
          {/* Base Image (Simulating an anime character silhouette/placeholder) */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-400 opacity-90 backdrop-blur-sm z-10" />
          
          {/* Detailed Image Placeholder (Using Picsum with a consistent seed for "Girl") */}
          <img 
            src="https://picsum.photos/seed/fahcharacter/400/800" 
            alt="Fah"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 z-20"
          />

          {/* Emotion Overlay */}
          <div className={`absolute inset-0 z-30 pointer-events-none ${getColorOverlay()}`} />

          {/* Face Expression (Abstract) */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-white/80 px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
             <span className="text-2xl font-bold text-slate-800 font-mono">{getExpression()}</span>
          </div>

          {/* Clothing hint */}
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-pink-900/20 to-transparent z-20" />
       </div>
    </div>
  );
};

export default CharacterSprite;
