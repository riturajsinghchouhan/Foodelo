import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Star, ShoppingBasket, ShoppingBag } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Show splash for 1.8 seconds then start finish animation
    const timer = setTimeout(() => {
      setIsFinishing(true);
      // Wait for the finish animation (zoom) to complete then unmount
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 600); // Duration of the zoom out
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const foodIcons = [
    { Icon: Zap, x: '10%', y: '20%', delay: 0.1 },
    { Icon: Clock, x: '80%', y: '15%', delay: 0.3 },
    { Icon: Star, x: '15%', y: '80%', delay: 0.5 },
    { Icon: ShoppingBasket, x: '85%', y: '75%', delay: 0.2 },
    { Icon: ShoppingBag, x: '50%', y: '10%', delay: 0.4 },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#7e3866]">
      <AnimatePresence>
        {!isFinishing && (
          <motion.div
            key="splash-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 15, opacity: 0 }}
            transition={{ 
              exit: { duration: 0.6, ease: [0.7, 0, 0.3, 1] },
              duration: 0.3 
            }}
            className="relative flex items-center justify-center w-full h-full"
          >
            {/* Floating Food Icons Background */}
            {foodIcons.map(({ Icon, x, y, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.15, 0], 
                  scale: [0.8, 1.1, 0.8],
                  y: [0, -30, 0] 
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  delay: delay,
                  ease: "easeInOut"
                }}
                className="absolute text-white/5"
                style={{ left: x, top: y }}
              >
                <Icon className="w-12 h-12 md:w-24 md:h-24" strokeWidth={1} />
              </motion.div>
            ))}

            {/* Central Brand Logic */}
            <div className="relative">
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 20,
                  duration: 0.8 
                }}
                className="text-6xl md:text-9xl font-black tracking-tighter text-white relative font-['Outfit']"
              >
                FOODELO
                
                {/* Shine Effect Layer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity, 
                    repeatDelay: 0.5,
                    ease: 'linear'
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  style={{ mixBlendMode: 'overlay' }}
                />
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.5 }}
                className="text-center text-white/80 font-black tracking-[0.5em] text-[10px] md:text-sm uppercase mt-4"
              >
                Premium Food Delivery
              </motion.p>
            </div>

            {/* Bottom Signature */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.4 }}
               transition={{ delay: 1 }}
               className="absolute bottom-10 text-white text-[10px] uppercase tracking-widest font-bold"
            >
              Powered by Foodelo Inc.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
        
        .shine-text {
          background: linear-gradient(90deg, #fff 0%, #fff 45%, #ffffff88 50%, #fff 55%, #fff 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 2s infinite linear;
        }

        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
