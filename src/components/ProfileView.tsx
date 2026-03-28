import React from "react";
import { User, Mail, Shield, Clock, Camera, Edit3, Save, Lock as LockIcon } from "lucide-react";
import { motion } from "motion/react";
import { auth } from "../firebase";

export const ProfileView: React.FC = () => {
  const user = auth.currentUser;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Profile Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-border/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-primary/5 z-0"></div>
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-primary/40 flex items-center justify-center text-primary-foreground text-4xl font-black shadow-2xl border-4 border-card">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-[2.5rem]" />
                  ) : (
                    user?.email?.[0].toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-3 rounded-2xl bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform active:scale-95">
                  <Camera size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">{user?.displayName || "User"}</h2>
              <p className="text-sm text-muted-foreground font-medium mb-6">{user?.email}</p>
              
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary text-xs font-bold uppercase tracking-widest text-primary">
                <Shield size={14} />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-border/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Account Stats</h3>
            <div className="space-y-4">
              <StatItem icon={<Shield size={16} />} label="Security Level" value="High" color="text-emerald-500" />
              <StatItem icon={<Clock size={16} />} label="Member Since" value="March 2024" />
              <StatItem icon={<LockIcon size={16} />} label="Encryption" value="AES-256" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold tracking-tight">Personal Information</h3>
              <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Edit3 size={16} />
                Edit
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField label="Full Name" value={user?.displayName || "Not set"} icon={<User size={18} />} />
                <ProfileField label="Email Address" value={user?.email || "Not set"} icon={<Mail size={18} />} />
              </div>
              <ProfileField label="Bio" value="Digital security enthusiast and SYNEX user." isTextArea />
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 flex justify-end">
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-border/50 bg-destructive/5 border-destructive/10">
            <h3 className="text-xl font-extrabold tracking-tight text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-6 py-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-xs font-bold ${color || "text-foreground"}`}>{value}</span>
    </div>
  );
}

function ProfileField({ label, value, icon, isTextArea }: { label: string, value: string, icon?: React.ReactNode, isTextArea?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        {isTextArea ? (
          <div className="w-full px-5 py-4 rounded-2xl bg-secondary/50 border border-transparent text-sm font-medium min-h-[100px]">
            {value}
          </div>
        ) : (
          <div className={`w-full ${icon ? "pl-12" : "px-5"} py-3.5 rounded-2xl bg-secondary/50 border border-transparent text-sm font-medium truncate`}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}
