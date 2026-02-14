import { Clock, Eye, Calendar, CheckCircle, XCircle, UserCheck, ThumbsDown, FileText } from "lucide-react";

interface StatsData {
  total: number;
  pending: number;
  inReview: number;
  interviews: number;
  offers: number;
  rejected: number;
}

interface CandidateStatsCardsProps {
  stats: StatsData;
  onFilter: (status: string) => void;
}

const CandidateStatsCards = ({ stats, onFilter }: CandidateStatsCardsProps) => {
  const cards = [
    { icon: FileText, iconBg: "bg-secondary-50", iconColor: "text-secondary-500", title: "Total", value: stats.total, label: "All applications", labelColor: "text-secondary-600", filter: "" },
    { icon: Clock, iconBg: "bg-warning-50", iconColor: "text-warning-500", title: "Pending", value: stats.pending, label: "Awaiting review", labelColor: "text-warning-600", filter: "pending" },
    { icon: Eye, iconBg: "bg-info-50", iconColor: "text-info-500", title: "In Review", value: stats.inReview, label: "Under consideration", labelColor: "text-info-600", filter: "submitted" },
    { icon: Calendar, iconBg: "bg-primary-50", iconColor: "text-primary", title: "Interviews", value: stats.interviews, label: "Scheduled & completed", labelColor: "text-primary-600", filter: "interview_scheduled" },
    { icon: CheckCircle, iconBg: "bg-success-50", iconColor: "text-success-500", title: "Offers & Hired", value: stats.offers, label: "Successful outcomes", labelColor: "text-success-600", filter: "offer_received" },
    { icon: XCircle, iconBg: "bg-error-50", iconColor: "text-error-500", title: "Rejected", value: stats.rejected, label: "Not selected", labelColor: "text-error-600", filter: "rejected" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <button
          key={card.title}
          onClick={() => onFilter(card.filter)}
          className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-secondary-900 font-display mt-3">{card.value}</p>
          <p className="text-sm font-medium text-neutral-700 mt-1">{card.title}</p>
          <p className={`text-xs mt-0.5 ${card.labelColor}`}>{card.label}</p>
        </button>
      ))}
    </div>
  );
};

export default CandidateStatsCards;
