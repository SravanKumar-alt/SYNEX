import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Sun, Moon, LogOut, User, Settings, Bell, 
  ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
  currentView: "dashboard" | "profile" | "settings";
  onViewChange: (view: "dashboard" | "profile" | "settings") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  isAuthenticated, 
  onLogout, 
  onLoginClick,
  currentView,
  onViewChange
}) => {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const handleViewChange = (view: "dashboard" | "profile" | "settings") => {
    onViewChange(view);
    setShowProfileMenu(false);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "py-0" : "py-0"
    )}>
      <div className="w-full transition-all duration-300">
        <div className="bg-background/80 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-sm border-b border-border/50">
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleViewChange("dashboard")}
          >
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20"
            >
              <Shield size={22} />
            </motion.div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              SYNEX
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground active:scale-90"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated && (
              <button className="p-2.5 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground active:scale-90 relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
              </button>
            )}

            <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all active:scale-95 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-primary/20">
                      {auth.currentUser?.photoURL ? (
                        <img src={auth.currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", showProfileMenu && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-[100]"
                      >
                        <div className="px-3 py-2 mb-2 border-b border-border/50">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account</p>
                          <p className="text-sm font-bold truncate">{auth.currentUser?.displayName || "User"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{auth.currentUser?.email}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleViewChange("settings")}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium",
                            currentView === "settings" ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                          )}
                        >
                          <Settings size={16} className={currentView === "settings" ? "text-primary" : "text-muted-foreground"} />
                          Settings
                        </button>
                        
                        <div className="my-1 border-t border-border/50"></div>
                        
                        <button 
                          onClick={() => {
                            onLogout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-sm font-bold"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30 transition-all text-sm font-bold active:scale-95"
                >
                  <User size={18} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
