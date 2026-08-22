import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export type TooltipPosition = 
  | 'top' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'left' 
  | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 120,
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

  const positionClasses: Record<TooltipPosition, string> = {
    'top': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom': 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-2',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    'top': 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]',
    'top-left': 'top-full left-3 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]',
    'top-right': 'top-full right-3 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]',
    'bottom': 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]',
    'bottom-left': 'bottom-full left-3 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]',
    'bottom-right': 'bottom-full right-3 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]',
    'left': 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-950 border-y-transparent border-r-transparent border-[5px]',
    'right': 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-950 border-y-transparent border-l-transparent border-[5px]'
  };

  const motionVariants: Record<TooltipPosition, { initial: any; animate: any }> = {
    'top': { initial: { opacity: 0, y: 4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'top-left': { initial: { opacity: 0, y: 4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'top-right': { initial: { opacity: 0, y: 4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'bottom': { initial: { opacity: 0, y: -4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'bottom-left': { initial: { opacity: 0, y: -4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'bottom-right': { initial: { opacity: 0, y: -4, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'left': { initial: { opacity: 0, x: 4, scale: 0.94 }, animate: { opacity: 1, x: 0, scale: 1 } },
    'right': { initial: { opacity: 0, x: -4, scale: 0.94 }, animate: { opacity: 1, x: 0, scale: 1 } }
  };

  const variant = motionVariants[position] || motionVariants['top'];

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
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.initial}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-[9999] pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-stone-100 dark:text-slate-100 text-[11px] font-semibold tracking-wide border border-emerald-500/30 dark:border-emerald-500/40 shadow-xl shadow-stone-950/20 backdrop-blur-md flex items-center justify-center gap-1.5",
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
