// app/providers.tsx
"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function Toasts() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      theme={theme}
      autoClose={4000}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable={false}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toasts />
    </ThemeProvider>
  );
}