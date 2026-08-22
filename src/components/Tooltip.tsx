import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 150,
  disabled = false,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-950 border-y-transparent border-r-transparent border-[5px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-950 border-y-transparent border-l-transparent border-[5px]'
  };

  const initialMotion = {
    top: { opacity: 0, y: 4, scale: 0.94 },
    bottom: { opacity: 0, y: -4, scale: 0.94 },
    left: { opacity: 0, x: 4, scale: 0.94 },
    right: { opacity: 0, x: -4, scale: 0.94 }
  };

  const animateMotion = {
    top: { opacity: 1, y: 0, scale: 1 },
    bottom: { opacity: 1, y: 0, scale: 1 },
    left: { opacity: 1, x: 0, scale: 1 },
    right: { opacity: 1, x: 0, scale: 1 }
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && !disabled && content && (
          <motion.div
            initial={initialMotion[position]}
            animate={animateMotion[position]}
            exit={initialMotion[position]}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-50 pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-stone-100 dark:text-slate-100 text-[11px] font-semibold tracking-wide border border-emerald-500/30 dark:border-emerald-500/40 shadow-xl shadow-stone-950/20 backdrop-blur-md flex items-center gap-1.5",
              positionClasses[position],
              className
            )}
          >
            <span>{content}</span>
            <div className={cn("absolute w-0 h-0 pointer-events-none", arrowClasses[position])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
