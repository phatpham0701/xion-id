import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth, RedirectIfAuthed } from "@/components/auth/RouteGuards";
import { RequireAdmin } from "@/components/admin/AdminLayout";
import Index from "./pages/Index.tsx";

const AdminHome = lazy(() => import("./pages/admin/AdminHome.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminProfiles = lazy(() => import("./pages/admin/AdminProfiles.tsx"));
const AdminBadges = lazy(() => import("./pages/admin/AdminBadges.tsx"));
const AdminRewards = lazy(() => import("./pages/admin/AdminRewards.tsx"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns.tsx"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit.tsx"));

const AdminFallback = () => (
  <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
);
const lazyAdmin = (El: React.ComponentType) => (
  <RequireAdmin>
    <Suspense fallback={<AdminFallback />}><El /></Suspense>
  </RequireAdmin>
);
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Editor = lazy(() => import("./pages/Editor.tsx"));
const Templates = lazy(() => import("./pages/Templates.tsx"));
const BadgesAll = lazy(() => import("./pages/BadgesAll.tsx"));
const RewardsBox = lazy(() => import("./pages/RewardsBox.tsx"));
const TemplatePreview = lazy(() => import("./pages/TemplatePreview.tsx"));
const Campaigns = lazy(() => import("./pages/Campaigns.tsx"));
const PublicCampaign = lazy(() => import("./pages/PublicCampaign.tsx"));
const QrCenter = lazy(() => import("./pages/QrCenter.tsx"));
const PublicProfile = lazy(() => import("./pages/PublicProfile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const PageFallback = () => (
  <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
);

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/auth"
              element={
                <RedirectIfAuthed>
                  <Auth />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/editor"
              element={
                <RequireAuth>
                  <Editor />
                </RequireAuth>
              }
            />
            <Route
              path="/templates"
              element={
                <RequireAuth>
                  <Templates />
                </RequireAuth>
              }
            />
            <Route
              path="/campaigns"
              element={<RequireAuth><Campaigns /></RequireAuth>}
            />
            <Route
              path="/qr"
              element={<RequireAuth><QrCenter /></RequireAuth>}
            />
            <Route
              path="/badges"
              element={<RequireAuth><BadgesAll /></RequireAuth>}
            />
            <Route
              path="/rewards"
              element={<RequireAuth><RewardsBox /></RequireAuth>}
            />
            {/* Admin (lazy + RequireAdmin) */}
            <Route path="/admin" element={lazyAdmin(AdminHome)} />
            <Route path="/admin/users" element={lazyAdmin(AdminUsers)} />
            <Route path="/admin/profiles" element={lazyAdmin(AdminProfiles)} />
            <Route path="/admin/badges" element={lazyAdmin(AdminBadges)} />
            <Route path="/admin/rewards" element={lazyAdmin(AdminRewards)} />
            <Route path="/admin/campaigns" element={lazyAdmin(AdminCampaigns)} />
            <Route path="/admin/audit" element={lazyAdmin(AdminAudit)} />
            {/* Public campaign page — open route */}
            <Route path="/c/:id" element={<PublicCampaign />} />
            {/* Public template preview — open route, no auth required */}
            <Route path="/preview/template/:id" element={<TemplatePreview />} />
            {/* Public profile — must be last named route before catch-all */}
            <Route path="/:username" element={<PublicProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
