import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect to the user's own dashboard
    const redirectMap: Record<AppRole, string> = {
      admin: "/admin/dashboard",
      recruiter: "/recruiter/dashboard",
      candidate: "/candidate/dashboard",
    };
    return <Navigate to={redirectMap[role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
