import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ChevronLeft, ChevronRight, Search, MoreVertical, Eye, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import CreateCandidateModal from "@/components/admin/CreateCandidateModal";

const AdminCandidates = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "candidates", currentPage, perPage, search],
    queryFn: async () => {
      let query = supabase
        .from("candidates")
        .select(`
          candidate_id, current_job_title, current_location, experience_years, created_at, user_id,
          users!candidates_user_id_fkey(user_id, full_name, email, is_active, phone),
          recruiters!candidates_assigned_recruiter_id_fkey(recruiter_id, users!recruiters_user_id_fkey(full_name))
        `, { count: "exact" });

      if (search) {
        query = query.or(`users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`);
      }

      query = query.order("created_at", { ascending: false }).range((currentPage - 1) * perPage, currentPage * perPage - 1);
      const { data, error, count } = await query;
      if (error) throw error;
      return { candidates: data || [], total: count || 0 };
    },
  });

  const candidates = data?.candidates || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    const { error } = await supabase.from("users").update({ is_active: !currentlyActive }).eq("user_id", userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: currentlyActive ? "Candidate deactivated" : "Candidate activated" });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Manage Candidates</h1>
          <p className="text-base text-muted-foreground mt-1">Create and manage candidate accounts across all recruiters</p>
        </div>
        <Button variant="portal" size="lg" onClick={() => setCreateModalOpen(true)}>
          <GraduationCap className="w-4 h-4" /> Create New Candidate
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{total} total candidates</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : candidates.length === 0 && !search ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <GraduationCap className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No candidates yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first candidate account to get started.</p>
            <Button variant="portal" size="lg" onClick={() => setCreateModalOpen(true)}>
              <GraduationCap className="w-4 h-4" /> Create New Candidate
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Recruiter</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c: any) => {
                    const user = c.users;
                    const name = user?.full_name || "Unknown";
                    const email = user?.email || "";
                    const isActive = user?.is_active ?? true;
                    const recruiterName = (c.recruiters as any)?.users?.full_name || "Unassigned";
                    return (
                      <tr key={c.candidate_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-info-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">{getInitials(name)}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-secondary-900 truncate">{name}</p>
                              <p className="text-xs text-muted-foreground truncate">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{c.current_job_title || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{c.current_location || "—"}</td>
                        <td className="px-4 py-3 text-sm text-primary-600 font-medium">{recruiterName}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{format(new Date(c.created_at), "MMM d, yyyy")}</td>
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
                              <DropdownMenuItem onClick={() => toggleActive(c.user_id, isActive)}>
                                <Power className="w-4 h-4 mr-2" />{isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
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
              {candidates.map((c: any) => {
                const user = c.users;
                const name = user?.full_name || "Unknown";
                const isActive = user?.is_active ?? true;
                const recruiterName = (c.recruiters as any)?.users?.full_name || "Unassigned";
                return (
                  <div key={c.candidate_id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-info-500 flex items-center justify-center text-white text-xs font-semibold">{getInitials(name)}</div>
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", isActive ? "bg-success-50 text-success-700" : "bg-muted text-muted-foreground")}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Recruiter:</span> <span className="text-primary-600 font-medium">{recruiterName}</span></div>
                      <div><span className="text-muted-foreground">Title:</span> {c.current_job_title || "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
              <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentPage === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <CreateCandidateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
};

export default AdminCandidates;
