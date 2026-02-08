import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, UserPlus, Search, MapPin, Briefcase, Calendar, Mail, Phone, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecruiterCandidates } from "@/hooks/useRecruiterData";
import { formatDistanceToNow } from "date-fns";

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const RecruiterCandidates = () => {
  const navigate = useNavigate();
  const { data: candidates = [], isLoading } = useRecruiterCandidates();
  const [search, setSearch] = useState("");

  const filtered = candidates.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = c.users?.full_name?.toLowerCase() || "";
    const email = c.users?.email?.toLowerCase() || "";
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Candidates</h1>
            <p className="text-base text-muted-foreground mt-1">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in your pipeline</p>
          </div>
          <Button variant="portal">
            <UserPlus className="w-4 h-4" /> Add Candidate
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      {candidates.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading candidates...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-success-500" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">{search ? "No matching candidates" : "No candidates yet"}</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {search ? "Try adjusting your search term." : "Add candidates to start matching them with opportunities and submitting applications."}
          </p>
          {!search && (
            <Button variant="portal" size="lg">
              <UserPlus className="w-4 h-4" /> Add Your First Candidate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((c: any) => {
            const name = c.users?.full_name || "Unknown";
            const email = c.users?.email || "";
            return (
              <motion.div key={c.candidate_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-secondary-900 truncate">{name}</p>
                    <p className="text-sm text-muted-foreground truncate">{email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-neutral-600">
                  {c.current_job_title && (
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-neutral-400" />{c.current_job_title}</div>
                  )}
                  {c.current_location && (
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-neutral-400" />{c.current_location}</div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-neutral-400" />{c.phone}</div>
                  )}
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-neutral-400" />Added {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</div>
                </div>
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {c.skills.slice(0, 4).map((s: string) => (
                      <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                    {c.skills.length > 4 && <span className="text-xs text-neutral-500">+{c.skills.length - 4}</span>}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{c.experience_years ? `${c.experience_years} yrs exp` : "—"}</span>
                  <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidates;
