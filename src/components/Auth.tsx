import React, { useState } from "react";
import { Shield, Mail, Lock as LockIcon, User, ArrowRight, Loader2, Chrome } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { auth, googleProvider, signInWithPopup, db, doc, setDoc, getDoc } from "../firebase";

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists, if not create it
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "user"
        });
      }
      
      toast.success("Welcome to SYNEX!");
      onSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="bg-primary text-primary-foreground p-4 rounded-2xl mb-6 shadow-xl shadow-primary/20"
          >
            <Shield size={40} />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight text-center">
            Welcome to SYNEX
          </h2>
          <p className="text-muted-foreground text-sm mt-3 text-center max-w-[240px] leading-relaxed">
            Your personal encrypted space for sensitive data.
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Chrome size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="text-[10px] text-center text-muted-foreground px-6 leading-relaxed uppercase tracking-wider font-bold opacity-60">
            Secure authentication powered by Firebase. 
            We never see your password.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-border/50 text-center">
          <div className="flex items-center justify-center gap-2 text-primary/60 text-xs font-bold uppercase tracking-widest">
            <LockIcon size={14} />
            <span>AES-256 Encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

