import { useState } from "react";
import { Outlet } from "react-router-dom";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterHeader from "./RecruiterHeader";
import { cn } from "@/lib/utils";
import { useRecruiterSessionTracking } from "@/hooks/useRecruiterSessions";

const RecruiterLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useRecruiterSessionTracking();

  return (
    <div className="min-h-screen bg-background">
      <RecruiterSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          sidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-[280px]"
        )}
      >
        <RecruiterHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
