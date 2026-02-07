import { useState } from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Recruiter {
  id: number;
  name: string;
  email: string;
  company: string;
  jobsScraped: number;
  candidatesManaged: number;
  createdDate: string;
  status: "active" | "inactive";
  initials: string;
}

const mockRecruiters: Recruiter[] = [
  { id: 1, name: "John Smith", email: "john.smith@techcorp.com", company: "TechCorp Inc.", jobsScraped: 156, candidatesManaged: 23, createdDate: "Jan 15, 2026", status: "active", initials: "JS" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@innovate.io", company: "Innovate.io", jobsScraped: 142, candidatesManaged: 31, createdDate: "Jan 10, 2026", status: "active", initials: "SJ" },
  { id: 3, name: "Mike Chen", email: "mike.chen@recruit.co", company: "RecruitCo", jobsScraped: 98, candidatesManaged: 18, createdDate: "Dec 28, 2025", status: "active", initials: "MC" },
  { id: 4, name: "Emma Davis", email: "emma.d@hiresmart.com", company: "HireSmart", jobsScraped: 87, candidatesManaged: 14, createdDate: "Dec 20, 2025", status: "inactive", initials: "ED" },
  { id: 5, name: "Alex Brown", email: "alex.b@talentfind.com", company: "TalentFind", jobsScraped: 76, candidatesManaged: 22, createdDate: "Dec 15, 2025", status: "active", initials: "AB" },
];

interface RecruitersTableProps {
  onCreateNew: () => void;
}

const RecruitersTable = ({ onCreateNew }: RecruitersTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  if (mockRecruiters.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card flex flex-col items-center justify-center py-16 px-8">
        <Users className="w-12 h-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">No recruiters yet</h3>
        <p className="text-sm text-muted-foreground mb-6">Create your first recruiter account to get started.</p>
        <Button variant="portal" size="lg" onClick={onCreateNew}>
          <UserPlus className="w-4 h-4" />
          Create New Recruiter
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
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
            {mockRecruiters.map((r) => (
              <tr key={r.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {r.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{r.company || "—"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary-600">{r.jobsScraped}</td>
                <td className="px-4 py-3 text-sm font-semibold text-success-600">{r.candidatesManaged}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{r.createdDate}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      r.status === "active"
                        ? "bg-success-50 text-success-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {r.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-md hover:bg-muted text-neutral-500 hover:text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Recruiter</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Power className="w-4 h-4 mr-2" />
                        {r.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border">
        {mockRecruiters.map((r) => (
          <div key={r.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  r.status === "active" ? "bg-success-50 text-success-700" : "bg-muted text-muted-foreground"
                )}
              >
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Jobs</p>
                <p className="text-sm font-semibold text-primary-600">{r.jobsScraped}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Candidates</p>
                <p className="text-sm font-semibold text-success-600">{r.candidatesManaged}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-neutral-600">{r.createdDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
        <p className="text-sm text-muted-foreground">Showing 1-5 of 24 recruiters</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={cn(
                "w-8 h-8 rounded text-sm font-medium transition-colors",
                currentPage === p
                  ? "bg-primary text-white"
                  : "border border-border hover:bg-muted"
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruitersTable;
