import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [horizontalShift, setHorizontalShift] = useState<'center' | 'left-aligned' | 'right-aligned'>('center');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
      const margin = 12;

      let nextPos = position;
      let nextShift: 'center' | 'left-aligned' | 'right-aligned' = 'center';

      // Vertical flip check
      if (position === 'top' && rect.top < margin) {
        nextPos = 'bottom';
      } else if (position === 'bottom' && rect.bottom > viewportHeight - margin) {
        nextPos = 'top';
      }

      // Horizontal boundary adjustment
      if (rect.left < margin) {
        nextShift = 'left-aligned';
      } else if (rect.right > viewportWidth - margin) {
        nextShift = 'right-aligned';
      }

      setAdjustedPosition(nextPos);
      setHorizontalShift(nextShift);
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: horizontalShift === 'left-aligned'
      ? 'bottom-full left-0 mb-2'
      : horizontalShift === 'right-aligned'
        ? 'bottom-full right-0 mb-2'
        : 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: horizontalShift === 'left-aligned'
      ? 'top-full left-0 mt-2'
      : horizontalShift === 'right-aligned'
        ? 'top-full right-0 mt-2'
        : 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: horizontalShift === 'left-aligned'
      ? 'top-full left-3 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]'
      : horizontalShift === 'right-aligned'
        ? 'top-full right-3 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]'
        : 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent border-[5px]',
    bottom: horizontalShift === 'left-aligned'
      ? 'bottom-full left-3 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]'
      : horizontalShift === 'right-aligned'
        ? 'bottom-full right-3 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]'
        : 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent border-[5px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-950 border-y-transparent border-r-transparent border-[5px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-950 border-y-transparent border-l-transparent border-[5px]'
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
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-[9999] pointer-events-none max-w-[240px] whitespace-normal break-words px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-stone-100 dark:text-slate-100 text-[11px] font-semibold tracking-wide border border-emerald-500/30 dark:border-emerald-500/40 shadow-xl shadow-stone-950/20 backdrop-blur-md flex items-center gap-1.5 text-center leading-snug",
              positionClasses[adjustedPosition],
              className
            )}
          >
            <span>{content}</span>
            <div className={cn("absolute w-0 h-0 pointer-events-none", arrowClasses[adjustedPosition])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
