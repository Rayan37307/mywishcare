import { useState, useEffect } from 'react';

const InteractiveLoader = () => {
  const [, setMousePosition] = useState({ x: 0, y: 0 });
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update mouse position for the effect, but we don't need to store it
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Create new dot at mouse position
      const newDot = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 10 + 5, // Random size between 5-15px
      };
      
      setDots(prev => [...prev.slice(-20), newDot]); // Keep only last 20 dots
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Create initial dots at random positions
    const initialDots = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
    }));
    setDots(initialDots);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Remove old dots periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.slice(-15)); // Keep only last 15 dots
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Green background overlay */}
      <div className="absolute inset-0 bg-[#D4F871] opacity-10"></div>
      
      {/* Dots following mouse and static */}
      {dots.map(dot => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-[#D4F871] animate-pulse"
          style={{
            left: `${dot.x}px`,
            top: `${dot.y}px`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.7,
          }}
        />
      ))}
      
      {/* Floating animated circles */}
      <div className="absolute top-1/4 left-1/4 w-24 h-24 border-4 border-[#D4F871] rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-3/4 right-1/4 w-16 h-16 border-4 border-[#D4F871] rounded-full opacity-30 animate-ping"></div>
      <div className="absolute bottom-1/4 left-1/2 w-20 h-20 border-4 border-[#D4F871] rounded-full opacity-20 animate-pulse"></div>
      
      {/* Center loader */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 border-4 border-[#D4F871] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-center text-[#D4F871] font-bold">Loading...</p>
      </div>
    </div>
  );
};

export default InteractiveLoader;