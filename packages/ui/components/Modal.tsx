'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the element inside the panel that titles the dialog (an h2) */
  labelledBy: string;
  /** positioning/size classes for the animated panel wrapper */
  panelClassName: string;
  /** override the backdrop classes; default matches the site standard */
  backdropClassName?: string;
  /** override the panel spring */
  panelTransition?: Transition;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog shell: backdrop + animated panel with dialog semantics,
 * focus trap, Escape-to-close, focus restore, and body scroll locking.
 * Visual positioning is supplied by the caller via panelClassName.
 */
export function Modal({
  isOpen,
  onClose,
  labelledBy,
  panelClassName,
  backdropClassName,
  panelTransition,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Move focus into the dialog on open; restore it on close
  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? panelRef.current)?.focus();
      });
    } else {
      lastActiveRef.current?.focus?.();
      lastActiveRef.current = null;
    }
  }, [isOpen]);

  // Escape closes; Tab cycles within the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={
              backdropClassName ?? 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50'
            }
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={
              panelTransition ?? { type: 'spring', damping: 30, stiffness: 300 }
            }
            className={panelClassName}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
