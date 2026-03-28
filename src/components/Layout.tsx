import React from "react";
import { Navbar } from "./Navbar";
import { Toaster } from "sonner";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
  currentView: "dashboard" | "profile" | "settings";
  onViewChange: (view: "dashboard" | "profile" | "settings") => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isAuthenticated, 
  onLogout, 
  onLoginClick,
  currentView,
  onViewChange
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout} 
        onLoginClick={onLoginClick} 
        currentView={currentView}
        onViewChange={onViewChange}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className={cn(
          "flex-1 py-8 transition-all duration-500",
          !isAuthenticated && "max-w-4xl mx-auto"
        )}>
          {children}
        </main>
      </div>
      
      <Toaster position="top-right" richColors />
    </div>
  );
};
