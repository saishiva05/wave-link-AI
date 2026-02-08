import { useState } from "react";
import { MoreVertical, Eye, Edit, Power, Trash2, ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRecruiters } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecruitersTableProps {
  onCreateNew: () => void;
}

const RecruitersTable = ({ onCreateNew }: RecruitersTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 10;
  const { data, isLoading } = useAdminRecruiters(currentPage, perPage, search);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const recruiters = data?.recruiters || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    const { error } = await supabase.from("users").update({ is_active: !currentlyActive }).eq("user_id", userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: currentlyActive ? "Recruiter deactivated" : "Recruiter activated" });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (recruiters.length === 0 && !search) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card flex flex-col items-center justify-center py-16 px-8">
        <Users className="w-12 h-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">No recruiters yet</h3>
        <p className="text-sm text-muted-foreground mb-6">Create your first recruiter account to get started.</p>
        <Button variant="portal" size="lg" onClick={onCreateNew}><UserPlus className="w-4 h-4" /> Create New Recruiter</Button>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name, email, or company..."
          className="w-full max-w-sm h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b-2 border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recruiter</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs Scraped</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidates</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((r: any) => {
              const user = r.users;
              const name = user?.full_name || "Unknown";
              const email = user?.email || "";
              const isActive = user?.is_active ?? true;
              return (
                <tr key={r.recruiter_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">{getInitials(name)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{r.company_name || "—"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">{r.total_jobs_scraped}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-success-600">{r.total_candidates_managed}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{format(new Date(r.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      isActive ? "bg-success-50 text-success-700" : "bg-muted text-muted-foreground"
                    )}>{isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-muted text-neutral-500 hover:text-primary transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Recruiter</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(r.user_id, isActive)}>
                          <Power className="w-4 h-4 mr-2" />{isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border">
        {recruiters.map((r: any) => {
          const user = r.users;
          const name = user?.full_name || "Unknown";
          const isActive = user?.is_active ?? true;
          return (
            <div key={r.recruiter_id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">{getInitials(name)}</div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", isActive ? "bg-success-50 text-success-700" : "bg-muted text-muted-foreground")}>{isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs text-muted-foreground">Jobs</p><p className="text-sm font-semibold text-primary-600">{r.total_jobs_scraped}</p></div>
                <div><p className="text-xs text-muted-foreground">Candidates</p><p className="text-sm font-semibold text-success-600">{r.total_candidates_managed}</p></div>
                <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm text-neutral-600">{format(new Date(r.created_at), "MMM d")}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
        <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total} recruiters</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentPage === p ? "bg-primary text-white" : "border border-border hover:bg-muted")}>{p}</button>
          ))}
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default RecruitersTable;
