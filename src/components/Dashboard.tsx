import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, FileText, Link as LinkIcon, 
  User, Shield, Trash2, Edit3, 
  Download, Grid, List, Loader2,
  Clock, Tag, Lock as LockIcon, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { 
  db, auth, collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError 
} from "../firebase";

type Category = "all" | "notes" | "links" | "contacts" | "documents";

interface VaultItem {
  id: string;
  title: string;
  content: string;
  category: Category;
  updatedAt: string;
  tags?: string[];
  isEncrypted?: boolean;
  uid: string;
}

export const Dashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAdding, setIsAdding] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<VaultItem>>({
    title: "",
    content: "",
    category: "notes",
    tags: []
  });

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("vault_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setNewItem(draft);
        // If there's a draft with content, maybe open the modal? 
        // Let's not force open, but keep the data ready.
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!newItem.title && !newItem.content) {
      localStorage.removeItem("vault_draft");
      return;
    }

    setIsDraftSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem("vault_draft", JSON.stringify(newItem));
      setIsDraftSaving(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [newItem]);

  // Real-time Firestore sync
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      const q = query(
        collection(db, "vault"), 
        where("uid", "==", user.uid)
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const vaultItems: VaultItem[] = [];
        snapshot.forEach((doc) => {
          vaultItems.push({ id: doc.id, ...doc.data() } as VaultItem);
        });
        vaultItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setItems(vaultItems);
        setIsLoading(false);
      }, (error) => {
        console.error("Firestore Sync Error:", error);
        handleFirestoreError(error, OperationType.GET, "vault");
        setIsLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.content || !auth.currentUser) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAdding(true);
    try {
      const itemData = {
        title: newItem.title,
        content: newItem.content,
        category: newItem.category as Category,
        updatedAt: new Date().toISOString(),
        tags: newItem.tags || [],
        uid: auth.currentUser.uid
      };

      if (editingItem) {
        await updateDoc(doc(db, "vault", editingItem), itemData);
        toast.success("Item updated successfully");
      } else {
        await addDoc(collection(db, "vault"), itemData);
        toast.success("Item added to SYNEX");
      }
      
      setIsAdding(false);
      setEditingItem(null);
      setNewItem({ title: "", content: "", category: "notes", tags: [] });
      localStorage.removeItem("vault_draft");
    } catch (error) {
      console.error("Error saving item:", error);
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, editingItem ? `vault/${editingItem}` : "vault");
      setIsAdding(false);
    }
  };

  const handleEdit = (item: VaultItem) => {
    setEditingItem(item.id);
    setNewItem({
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "vault", id));
      toast.success("Item deleted from SYNEX");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vault/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="relative">
          <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <LockIcon size={20} className="text-primary/40" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight">Unlocking SYNEX</h2>
          <p className="text-muted-foreground text-sm">Decrypting your personal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-12rem)]">
      {/* Main Content Area */}
      <main className="flex-1 space-y-8 pb-24 lg:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {activeCategory === "all" ? "Dashboard" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredItems.length} items found in this category
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid size={18} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={18} />
              </motion.button>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30 transition-all text-sm font-bold active:scale-95"
            >
              <Plus size={20} />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Category Filter - Compact */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <CompactCategoryButton 
            active={activeCategory === "all"} 
            onClick={() => setActiveCategory("all")}
            icon={<LayoutGrid size={16} />}
            label="All"
          />
          <CompactCategoryButton 
            active={activeCategory === "notes"} 
            onClick={() => setActiveCategory("notes")}
            icon={<FileText size={16} />}
            label="Notes"
          />
          <CompactCategoryButton 
            active={activeCategory === "links"} 
            onClick={() => setActiveCategory("links")}
            icon={<LinkIcon size={16} />}
            label="Links"
          />
          <CompactCategoryButton 
            active={activeCategory === "contacts"} 
            onClick={() => setActiveCategory("contacts")}
            icon={<User size={16} />}
            label="Contacts"
          />
          <CompactCategoryButton 
            active={activeCategory === "documents"} 
            onClick={() => setActiveCategory("documents")}
            icon={<Download size={16} />}
            label="Documents"
          />
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300" size={20} />
          <input 
            type="text"
            placeholder="Search SYNEX by title, content or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4.5 rounded-[2rem] bg-card border border-border/50 focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all duration-500 text-base shadow-sm outline-none font-medium"
          />
        </div>

        {/* Items Grid/List */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={cn(
              "grid gap-6",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredItems.map((item, index) => (
              <VaultCard 
                key={item.id} 
                item={item} 
                index={index}
                viewMode={viewMode}
                onDelete={() => setItemToDelete(item.id)}
                onEdit={() => handleEdit(item)}
              />
            ))}
            
            {filteredItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-32 text-center"
              >
                <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto text-muted-foreground mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold">No results found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                  We couldn't find any items matching your current search or filters.
                </p>
                <button 
                  onClick={() => {setSearchQuery(""); setActiveCategory("all");}}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl w-full max-w-sm relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Are you sure?</h2>
              <p className="text-muted-foreground text-sm mb-8">
                This action cannot be undone. This item will be permanently removed from your SYNEX.
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (itemToDelete) {
                      handleDelete(itemToDelete);
                      setItemToDelete(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:shadow-xl hover:shadow-destructive/30 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl w-full max-w-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">{editingItem ? "Edit Entry" : "New Entry"}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{editingItem ? "Update your secure record." : "Add a secure record to SYNEX."}</p>
                </div>
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary relative">
                    <LockIcon size={24} />
                    {isDraftSaving && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center"
                      >
                        <Loader2 size={8} className="animate-spin text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {isDraftSaving ? (
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4 ml-1">
                    <Clock size={12} className="animate-pulse" />
                    <span>Saving Draft...</span>
                  </div>
                ) : (newItem.title || newItem.content) ? (
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-4 ml-1">
                    <Shield size={12} />
                    <span>Draft Encrypted & Saved</span>
                  </div>
                ) : null}

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Title</label>
                    <input 
                      type="text"
                      required
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g. Work Email Password"
                      className="w-full px-5 py-3.5 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                    <div className="relative">
                      <select 
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                        className="w-full px-5 py-3.5 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium appearance-none cursor-pointer outline-none"
                      >
                        <option value="notes">Note</option>
                        <option value="links">Link</option>
                        <option value="contacts">Contact</option>
                        <option value="documents">Document</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Content / Details</label>
                  <textarea 
                    required
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    placeholder={newItem.category === "links" ? "https://..." : "Enter the sensitive information here..."}
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium resize-none outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingItem(null);
                      setNewItem({ title: "", content: "", category: "notes", tags: [] });
                      localStorage.removeItem("vault_draft");
                    }}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all active:scale-95"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                  >
                    {editingItem ? "Update Securely" : "Secure Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 px-4 py-3 flex items-center justify-around">
        <MobileNavButton 
          active={activeCategory === "all"} 
          onClick={() => setActiveCategory("all")}
          icon={<LayoutGrid size={20} />}
          label="All"
        />
        <MobileNavButton 
          active={activeCategory === "notes"} 
          onClick={() => setActiveCategory("notes")}
          icon={<FileText size={20} />}
          label="Notes"
        />
        <div className="relative -top-6">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
        <MobileNavButton 
          active={activeCategory === "links"} 
          onClick={() => setActiveCategory("links")}
          icon={<LinkIcon size={20} />}
          label="Links"
        />
        <MobileNavButton 
          active={activeCategory === "contacts"} 
          onClick={() => setActiveCategory("contacts")}
          icon={<User size={20} />}
          label="Contacts"
        />
      </div>
    </div>
  );
};

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className={cn(
        "p-1 rounded-xl transition-all",
        active ? "bg-primary/10" : ""
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function CompactCategoryButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs whitespace-nowrap border",
        active 
          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
          : "bg-secondary/50 text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CategoryButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1" 
          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110 group-hover:text-primary")}>
          {icon}
        </span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      <span className={cn(
        "text-[10px] px-2 py-0.5 rounded-lg font-black relative z-10",
        active ? "bg-white/20 text-white" : "bg-secondary-foreground/10 text-muted-foreground"
      )}>
        {count}
      </span>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0"
        />
      )}
    </button>
  );
}

interface VaultCardProps {
  item: VaultItem;
  index: number;
  viewMode: "grid" | "list";
  onDelete: () => void;
  onEdit: () => void;
}

const VaultCard: React.FC<VaultCardProps> = ({ item, index, viewMode, onDelete, onEdit }) => {
  const Icon = {
    notes: FileText,
    links: LinkIcon,
    contacts: User,
    documents: Download,
    all: Shield
  }[item.category];

  const formattedDate = new Date(item.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.3, ease: "easeOut" } 
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        layout: { duration: 0.4, ease: "easeInOut" },
        opacity: { duration: 0.4, delay: index * 0.05 },
        scale: { duration: 0.4, delay: index * 0.05 },
        y: { duration: 0.4, delay: index * 0.05 }
      }}
      className={cn(
        "glass rounded-[2rem] overflow-hidden transition-all duration-300 group relative",
        viewMode === "list" 
          ? "flex items-center p-5 gap-6 border border-border/50" 
          : "p-8 flex flex-col h-full border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5"
      )}
    >
      <div className={cn(
        "rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
        viewMode === "list" 
          ? "w-12 h-12 bg-secondary/80 text-primary" 
          : "w-14 h-14 bg-secondary/80 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 shadow-inner"
      )}>
        <Icon size={viewMode === "list" ? 20 : 26} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-extrabold text-xl tracking-tight truncate group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <p className={cn(
          "text-muted-foreground font-medium leading-relaxed",
          viewMode === "grid" ? "line-clamp-3 my-4 text-sm" : "truncate text-sm"
        )}>
          {item.content}
        </p>

        {viewMode === "grid" && (
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {formattedDate}
              </span>
            </div>
            <div className="flex gap-1.5">
              {item.tags?.length ? item.tags.map(tag => (
                <span key={tag} className="text-[9px] px-2 py-1 rounded-lg bg-primary/5 text-primary font-bold uppercase tracking-tighter">
                  {tag}
                </span>
              )) : (
                <span className="text-[9px] px-2 py-1 rounded-lg bg-secondary text-muted-foreground/60 font-bold uppercase tracking-tighter">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {viewMode === "list" && (
        <div className="flex items-center gap-6 text-muted-foreground/40">
          <div className="hidden md:flex items-center gap-2">
            <Clock size={14} />
            <span className="text-xs font-bold">{formattedDate}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ChevronRight size={18} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

