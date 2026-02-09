import {
  CheckCircle, XCircle, Target, TrendingUp, AlertTriangle,
  Lightbulb, FileText, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ATSAnalysisResult {
  overall_match_percentage: number;
  match_level: string;
  matched_skills: string[];
  missing_skills: string[];
  experience_summary: string;
  strengths: string[];
  gaps: string[];
  top_recommendations: string[];
  ats_score: number;
  summary: string;
}

interface ATSResultsViewProps {
  result: ATSAnalysisResult;
}

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "hsl(var(--success-500))" : score >= 50 ? "hsl(var(--warning-500))" : "hsl(var(--destructive))";
  const bg =
    score >= 70 ? "bg-success-50" : score >= 50 ? "bg-warning-50" : "bg-destructive/10";

  return (
    <div className={cn("relative w-36 h-36 rounded-full flex items-center justify-center mx-auto", bg)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-3xl font-bold font-display" style={{ color }}>{score}%</span>
        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">ATS Score</p>
      </div>
    </div>
  );
};

const SkillBadge = ({ skill, variant }: { skill: string; variant: "matched" | "missing" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
      variant === "matched"
        ? "bg-success-50 text-success-700 border border-success-200"
        : "bg-destructive/10 text-destructive border border-destructive/20"
    )}
  >
    {variant === "matched" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {skill}
  </span>
);

const SectionHeader = ({ icon: Icon, title, className }: { icon: any; title: string; className?: string }) => (
  <div className={cn("flex items-center gap-2 mb-3", className)}>
    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h4 className="text-sm font-bold text-secondary-900">{title}</h4>
  </div>
);

const ATSResultsView = ({ result }: ATSResultsViewProps) => {
  const matchColor =
    result.ats_score >= 70 ? "text-success-700 bg-success-50 border-success-200"
      : result.ats_score >= 50 ? "text-warning-700 bg-warning-50 border-warning-200"
      : "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <div className="space-y-5 w-full">
      {/* Score & Match Level */}
      <div className="text-center">
        <ScoreRing score={result.ats_score} />
        <div className="mt-4">
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border", matchColor)}>
            <Target className="w-4 h-4" />
            {result.match_level} Match
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-muted/50 border border-border rounded-xl p-4">
        <SectionHeader icon={FileText} title="Summary" />
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={CheckCircle} title={`Matched Skills (${result.matched_skills.length})`} />
          <div className="flex flex-wrap gap-1.5">
            {result.matched_skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} variant="matched" />
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={XCircle} title={`Missing Skills (${result.missing_skills.length})`} />
          <div className="flex flex-wrap gap-1.5">
            {result.missing_skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} variant="missing" />
            ))}
          </div>
        </div>
      </div>

      {/* Experience Summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={BarChart3} title="Experience Summary" />
        <p className="text-sm text-muted-foreground leading-relaxed">{result.experience_summary}</p>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={TrendingUp} title="Strengths" />
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={AlertTriangle} title="Gaps" />
          <ul className="space-y-2">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-warning-500 shrink-0 mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
        <SectionHeader icon={Lightbulb} title="Top Recommendations" />
        <ol className="space-y-2.5">
          {result.top_recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ATSResultsView;
