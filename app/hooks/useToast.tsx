"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "border-green-500 bg-green-50 dark:bg-green-950/20",
  error: "border-red-500 bg-red-50 dark:bg-red-950/20",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, dismissToast } = context;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <Alert
            key={toast.id}
            className={`${toastStyles[toast.type]} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <Icon className="h-4 w-4" />
            {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
            <AlertDescription>{toast.message}</AlertDescription>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        );
      })}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}