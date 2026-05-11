import { useState } from "react";
import { MoreVertical, Power, Trash2, ChevronLeft, ChevronRight, ShieldPlus, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAdmins } from "@/hooks/useAdminData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdminsTableProps {
  onCreateNew: () => void;
}

const AdminsTable = ({ onCreateNew }: AdminsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const perPage = 10;
  const { data, isLoading } = useAdminAdmins(currentPage, perPage, search);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const admins = data?.admins || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    const { error } = await supabase.from("users").update({ is_active: !currentlyActive }).eq("user_id", userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: currentlyActive ? "Admin deactivated" : "Admin activated" });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const handleDelete = async (userId: string) => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { action: "delete-user", userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Admin deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete admin", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (admins.length === 0 && !search) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card flex flex-col items-center justify-center py-16 px-8">
        <ShieldCheck className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No additional admins yet</h3>
        <p className="text-sm text-muted-foreground mb-6">Create another admin to share platform-wide management.</p>
        <Button variant="portal" size="lg" onClick={onCreateNew}><ShieldPlus className="w-4 h-4" /> Create New Admin</Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or email..."
            className="w-full max-w-sm h-10 px-3 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b-2 border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a: any) => {
                const isSelf = a.user_id === currentUser?.id;
                return (
                  <tr key={a.user_id} className="border-b border-border hover:bg-muted/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0 overflow-hidden">
                          {a.avatar_url ? <img src={a.avatar_url} alt={a.full_name} className="w-full h-full object-cover" /> : getInitials(a.full_name || "AD")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                            {a.full_name}
                            {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">You</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.last_login_at ? format(new Date(a.last_login_at), "MMM d, yyyy h:mma") : "Never"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        a.is_active ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400" : "bg-muted text-muted-foreground"
                      )}>{a.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem disabled={isSelf} onClick={() => toggleActive(a.user_id, a.is_active)}>
                            <Power className="w-4 h-4 mr-2" />{a.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={isSelf} className="text-destructive focus:text-destructive" onClick={() => setDeleteConfirm(a)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {admins.map((a: any) => {
            const isSelf = a.user_id === currentUser?.id;
            return (
              <div key={a.user_id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">{getInitials(a.full_name || "AD")}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        {a.full_name}
                        {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">You</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", a.is_active ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400" : "bg-muted text-muted-foreground")}>{a.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {format(new Date(a.created_at), "MMM d, yyyy")}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={isSelf} onClick={() => toggleActive(a.user_id, a.is_active)}>
                      {a.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={isSelf} onClick={() => setDeleteConfirm(a)}>Delete</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
          <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total} admins</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentPage === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted text-foreground")}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !isDeleting && setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-[420px] w-full animate-scale-in p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display mt-4">Delete Admin?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Permanently delete <span className="font-medium text-foreground">{deleteConfirm.full_name}</span>? This will revoke their admin access immediately.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteConfirm.user_id)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminsTable;
