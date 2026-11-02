import React from 'react';

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* 1. High-Definition Flatlay Desk Background (Crisp High-Res Studio Photography) */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-fixed transition-all duration-700"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}workspace-hd.jpg'), url('${import.meta.env.BASE_URL}workspace-bg.png')`,
          backgroundPosition: 'center right',
          backgroundSize: 'cover',
          imageRendering: 'auto',
          filter: 'contrast(105%) brightness(100%)',
        }}
      />

      {/* 2. Ultra-Light Ambient Film so translucent glass cards pop without hiding desk details */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(235, 245, 255, 0.08) 0%, rgba(220, 235, 250, 0.04) 100%)',
        }}
      />

      {/* 3. Subtle Liquid Specular Lens Rings that float gently over the desk surface */}
      <div 
        className="absolute top-[15%] left-[8%] w-56 h-56 rounded-full border border-white/40 backdrop-blur-[1px] opacity-20 shadow-[0_8px_32px_rgba(255,255,255,0.4)] animate-liquid-float pointer-events-none" 
      />
      <div 
        className="absolute bottom-[20%] left-[25%] w-72 h-72 rounded-full border border-white/30 backdrop-blur-[1px] opacity-15 shadow-[0_8px_32px_rgba(0,0,0,0.02)] animate-liquid-float pointer-events-none" 
        style={{ animationDelay: '-4s' }} 
      />
    </div>
  );
}
