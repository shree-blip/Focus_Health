"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Mail, ArrowRight } from "lucide-react";

interface SubmissionSuccessModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  email?: string;
}

export function SubmissionSuccessModal({
  open,
  onClose,
  title = "Submission Received!",
  message = "Thank you for reaching out. Our team will review your information and get back to you shortly.",
  email,
}: SubmissionSuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={16} className="text-slate-500 dark:text-slate-400" />
            </button>

            {/* Top accent strip */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

            {/* Content */}
            <div className="px-8 pt-10 pb-8 text-center">
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15, damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 dark:shadow-green-900/30"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3, damping: 15, stiffness: 200 }}
                >
                  <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-3"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-muted-foreground text-base leading-relaxed mb-6"
              >
                {message}
              </motion.p>

              {/* Email check notice */}
              {email && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl px-5 py-3.5 mb-6"
                >
                  <Mail size={18} className="text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-left">
                    A confirmation email has been sent to <span className="font-semibold">{email}</span>
                  </p>
                </motion.div>
              )}

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continue Browsing
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
