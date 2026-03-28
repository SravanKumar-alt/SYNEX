/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Shield, Lock as LockIcon, Search, Globe, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { ProfileView } from "./components/ProfileView";
import { SettingsView } from "./components/SettingsView";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import { toast } from "sonner";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "profile" | "settings">("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setCurrentView("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setCurrentView("dashboard");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="bg-primary text-primary-foreground p-6 rounded-[2rem] mb-8 shadow-2xl shadow-primary/20">
            <Shield size={64} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">SYNEX</h1>
          <div className="flex items-center gap-2 text-primary/60 text-xs font-bold uppercase tracking-widest">
            <Loader2 size={14} className="animate-spin" />
            <span>Initializing Secure Vault</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout 
      isAuthenticated={isAuthenticated} 
      onLogout={handleLogout} 
      onLoginClick={() => setShowAuth(true)}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentView === "dashboard" && <Dashboard />}
            {currentView === "profile" && <ProfileView />}
            {currentView === "settings" && <SettingsView />}
          </motion.div>
        ) : showAuth ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="py-12"
          >
            <Auth onSuccess={handleLoginSuccess} />
            <div className="mt-8 text-center">
              <button 
                onClick={() => setShowAuth(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-medium underline underline-offset-4"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto py-12 md:py-24"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6"
            >
              <Shield size={14} className="text-primary" />
              <span>Secure. Private. Encrypted.</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
            >
              Your Personal Digital <span className="text-primary">SYNEX</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed font-medium"
            >
              Store your notes, documents, links, and contacts in one secure place. 
              Everything is encrypted and only accessible by you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <button 
                onClick={() => setShowAuth(true)}
                className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 text-lg"
              >
                Get Started Free
              </button>
              <button className="px-10 py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-all active:scale-95 text-lg">
                Learn More
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full"
            >
              <FeatureCard 
                icon={<LockIcon size={24} />}
                title="End-to-End Security"
                description="Your data is encrypted before it even leaves your device."
              />
              <FeatureCard 
                icon={<Search size={24} />}
                title="Instant Search"
                description="Find any note or contact in seconds with our powerful search."
              />
              <FeatureCard 
                icon={<Globe size={24} />}
                title="Access Anywhere"
                description="Sync your vault across all your devices securely."
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 text-left hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}


