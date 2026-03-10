import { useAuth } from "@/hooks/useAuth";

const WelcomeBanner = () => {
  const { fullName } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground font-display">
        Welcome back, {fullName?.split(" ")[0] || "there"}!
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {dateStr} &nbsp;|&nbsp; Here's your recruitment overview
      </p>
    </div>
  );
};

export default WelcomeBanner;
