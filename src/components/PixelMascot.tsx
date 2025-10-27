import { motion } from 'framer-motion';

interface PixelMascotProps {
  mood?: 'happy' | 'thinking' | 'excited';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PixelMascot = ({ mood = 'happy', size = 'md', className = '' }: PixelMascotProps) => {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  const pixelSize = sizeMap[size];

  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" className="pixel-mascot">
        {/* Head */}
        <rect x="8" y="6" width="8" height="8" fill="#FFE66D" stroke="#2C3E50" strokeWidth="0.5"/>
        
        {/* Eyes */}
        {mood === 'happy' && (
          <>
            <rect x="10" y="9" width="2" height="2" fill="#2C3E50"/>
            <rect x="12" y="9" width="2" height="2" fill="#2C3E50"/>
          </>
        )}
        
        {mood === 'thinking' && (
          <>
            <rect x="10" y="9" width="1.5" height="1.5" fill="#2C3E50"/>
            <rect x="12.5" y="9" width="1.5" height="1.5" fill="#2C3E50"/>
            <rect x="11" y="7" width="2" height="1" fill="#2C3E50"/>
          </>
        )}

        {mood === 'excited' && (
          <>
            <rect x="10" y="8" width="2" height="3" fill="#2C3E50"/>
            <rect x="12" y="8" width="2" height="3" fill="#2C3E50"/>
          </>
        )}
        
        {/* Smile */}
        <rect x="10" y="12" width="1" height="1" fill="#2C3E50"/>
        <rect x="11" y="13" width="2" height="1" fill="#2C3E50"/>
        <rect x="13" y="12" width="1" height="1" fill="#2C3E50"/>
        
        {/* Body */}
        <rect x="9" y="14" width="6" height="6" fill="#4ECDC4" stroke="#2C3E50" strokeWidth="0.5"/>
        
        {/* Arms */}
        <rect x="6" y="15" width="3" height="2" fill="#FFB347" stroke="#2C3E50" strokeWidth="0.5"/>
        <rect x="15" y="15" width="3" height="2" fill="#FFB347" stroke="#2C3E50" strokeWidth="0.5"/>
        
        {/* Legs */}
        <rect x="10" y="20" width="2" height="3" fill="#FFB347" stroke="#2C3E50" strokeWidth="0.5"/>
        <rect x="12" y="20" width="2" height="3" fill="#FFB347" stroke="#2C3E50" strokeWidth="0.5"/>
      </svg>
    </motion.div>
  );
};
