import React, { useState } from "react";
import { 
  Settings, Shield, Bell, Lock as LockIcon, Globe, 
  ChevronRight, Sun, Moon, Database, 
  Smartphone, Key, HelpCircle, Save 
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: <Settings size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "data", label: "Data & Storage", icon: <Database size={18} /> },
    { id: "devices", label: "Devices", icon: <Smartphone size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Settings</h1>
        <p className="text-muted-foreground font-medium">Configure your SYNEX experience and security preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Settings Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm tracking-tight",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 translate-x-1" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <HelpCircle size={18} />
              </div>
              <h3 className="font-bold text-sm">Need Help?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Check our documentation or contact support for assistance.
            </p>
            <button className="text-xs font-bold text-primary hover:underline">
              Support Center
            </button>
          </div>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 space-y-8">
          <div className="glass p-10 rounded-[2.5rem] border border-border/50 shadow-sm">
            {activeTab === "general" && (
              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-extrabold tracking-tight mb-6">Appearance</h3>
                  <div className="space-y-6">
                    <SettingToggle 
                      icon={<Sun size={20} />} 
                      title="Light Mode" 
                      description="Use the light theme for the application." 
                      checked={false} 
                    />
                    <SettingToggle 
                      icon={<Moon size={20} />} 
                      title="Dark Mode" 
                      description="Use the dark theme for the application." 
                      checked={true} 
                    />
                    <SettingToggle 
                      icon={<Globe size={20} />} 
                      title="System Sync" 
                      description="Automatically sync theme with your system settings." 
                      checked={true} 
                    />
                  </div>
                </section>

                <section className="pt-10 border-t border-border/50">
                  <h3 className="text-xl font-extrabold tracking-tight mb-6">Language & Region</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Language</label>
                      <select className="w-full px-5 py-3.5 rounded-2xl bg-secondary/50 border border-transparent text-sm font-medium outline-none focus:border-primary transition-all">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Timezone</label>
                      <select className="w-full px-5 py-3.5 rounded-2xl bg-secondary/50 border border-transparent text-sm font-medium outline-none focus:border-primary transition-all">
                        <option>UTC-08:00 (Pacific Time)</option>
                        <option>UTC+00:00 (GMT)</option>
                        <option>UTC+01:00 (CET)</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-extrabold tracking-tight mb-6">Security Preferences</h3>
                  <div className="space-y-6">
                    <SettingToggle 
                      icon={<LockIcon size={20} />} 
                      title="Two-Factor Authentication" 
                      description="Add an extra layer of security to your account." 
                      checked={false} 
                    />
                    <SettingToggle 
                      icon={<Key size={20} />} 
                      title="Biometric Unlock" 
                      description="Use FaceID or Fingerprint to unlock SYNEX." 
                      checked={true} 
                    />
                  </div>
                </section>

                <section className="pt-10 border-t border-border/50">
                  <h3 className="text-xl font-extrabold tracking-tight mb-6">Password Management</h3>
                  <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 text-sm">
                    Change Password
                  </button>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-extrabold tracking-tight mb-6">Notification Channels</h3>
                  <div className="space-y-6">
                    <SettingToggle 
                      icon={<Bell size={20} />} 
                      title="Email Notifications" 
                      description="Receive security alerts and updates via email." 
                      checked={true} 
                    />
                    <SettingToggle 
                      icon={<Smartphone size={20} />} 
                      title="Push Notifications" 
                      description="Receive instant alerts on your mobile device." 
                      checked={false} 
                    />
                  </div>
                </section>
              </div>
            )}

            <div className="mt-12 pt-10 border-t border-border/50 flex justify-end">
              <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 text-lg">
                <Save size={22} />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function SettingToggle({ icon, title, description, checked }: { icon: React.ReactNode, title: string, description: string, checked: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 group">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-secondary/80 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-6">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
        </div>
      </div>
      <button className={cn(
        "w-14 h-8 rounded-full p-1 transition-all duration-500 relative",
        checked ? "bg-primary" : "bg-secondary"
      )}>
        <div className={cn(
          "w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500",
          checked ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
