"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface Toast {
    id: number;
    message: string;
    type?: "success" | "error" | "info";
}

interface ToastContextType {
    showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div
                aria-live="polite"
                aria-atomic="false"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    alignItems: "center",
                    pointerEvents: "none",
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        style={{
                            background:
                                toast.type === "error"
                                    ? "#E50010"
                                    : toast.type === "info"
                                        ? "#1A1A1A"
                                        : "#1A1A1A",
                            color: "#fff",
                            padding: "12px 24px",
                            fontSize: "14px",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            animation: "slideDown 0.3s ease forwards",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        {toast.type !== "error" && (
                            <span style={{ color: "#4ade80", fontSize: "16px" }}>✓</span>
                        )}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};
