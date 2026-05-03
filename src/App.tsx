import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth, RedirectIfAuthed } from "@/components/auth/RouteGuards";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Editor from "./pages/Editor.tsx";
import Templates from "./pages/Templates.tsx";
import BadgesAll from "./pages/BadgesAll.tsx";
import RewardsBox from "./pages/RewardsBox.tsx";
import TemplatePreview from "./pages/TemplatePreview.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import PublicCampaign from "./pages/PublicCampaign.tsx";
import QrCenter from "./pages/QrCenter.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            {/* Public campaign page — open route */}
            <Route path="/c/:id" element={<PublicCampaign />} />
            {/* Public template preview — open route, no auth required */}
            <Route path="/preview/template/:id" element={<TemplatePreview />} />
            {/* Public profile — must be last named route before catch-all */}
            <Route path="/:username" element={<PublicProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
