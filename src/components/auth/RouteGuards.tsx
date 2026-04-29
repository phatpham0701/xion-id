import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const FullscreenLoader = () => (
  <div className="min-h-screen grid place-items-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return <>{children}</>;
};

export const RedirectIfAuthed = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
