import { Clock, Eye, Calendar, CheckCircle } from "lucide-react";

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
    { icon: Clock, iconBg: "bg-warning-50", iconColor: "text-warning-500", title: "Pending", value: stats.pending, label: "Awaiting review", labelColor: "text-warning-600", filter: "pending" },
    { icon: Eye, iconBg: "bg-info-50", iconColor: "text-info-500", title: "In Review", value: stats.inReview, label: "Under consideration", labelColor: "text-info-600", filter: "submitted" },
    { icon: Calendar, iconBg: "bg-primary-50", iconColor: "text-primary", title: "Interview Scheduled", value: stats.interviews, label: "Upcoming interviews", labelColor: "text-primary-600", filter: "interview_scheduled" },
    { icon: CheckCircle, iconBg: "bg-success-50", iconColor: "text-success-500", title: "Offers & Hired", value: stats.offers, label: "Successful applications", labelColor: "text-success-600", filter: "offer_received" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => (
        <button
          key={card.title}
          onClick={() => onFilter(card.filter)}
          className="bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-neutral-600">{card.title}</span>
          </div>
          <p className="text-4xl font-bold text-secondary-900 font-display mt-5">{card.value}</p>
          <p className={`text-sm mt-2 ${card.labelColor}`}>{card.label}</p>
        </button>
      ))}
    </div>
  );
};

export default CandidateStatsCards;
