import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { FacebookProvider } from "@/contexts/FacebookContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePageTitle } from "@/hooks/usePageTitle";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import TemplateEditor from "./pages/TemplateEditor";
import Upload from "./pages/Upload";
import LaunchLog from "./pages/LaunchLog";
import Team from "./pages/Team";
import Unsubscribe from "./pages/Unsubscribe";
import AdAccounts from "./pages/AdAccounts";
import AdAccountDetail from "./pages/AdAccountDetail";
import Billing from "./pages/Billing";
import BillingReturn from "./pages/BillingReturn";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

function Titled({ title, children }: { title: string; children: React.ReactNode }) {
  usePageTitle(title);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <FacebookProvider>
          <Routes>
            <Route path="/" element={<Titled title=""><Index /></Titled>} />
            <Route path="/login" element={<Titled title="Sign in"><Login /></Titled>} />
            <Route path="/onboarding" element={<Titled title="Welcome"><Onboarding /></Titled>} />
            <Route path="/unsubscribe" element={<Titled title="Unsubscribe"><Unsubscribe /></Titled>} />
            <Route path="/privacy" element={<Titled title="Privacy Policy"><PrivacyPolicy /></Titled>} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Titled title="Dashboard"><Dashboard /></Titled>} />
              <Route path="/ad-accounts" element={<Titled title="Ad Accounts"><AdAccounts /></Titled>} />
              <Route path="/ad-accounts/:id" element={<Titled title="Ad Account"><AdAccountDetail /></Titled>} />
              <Route path="/upload" element={<Titled title="Upload"><Upload /></Titled>} />
              <Route path="/templates" element={<Titled title="Templates"><Templates /></Titled>} />
              <Route path="/templates/:id" element={<Titled title="Edit Template"><TemplateEditor /></Titled>} />
              <Route path="/launch-log" element={<Titled title="Launch Log"><LaunchLog /></Titled>} />
              <Route path="/team" element={<Titled title="Team"><Team /></Titled>} />
              <Route path="/billing" element={<Titled title="Billing"><Billing /></Titled>} />
              <Route path="/billing/return" element={<Titled title="Billing"><BillingReturn /></Titled>} />
              <Route path="/settings" element={<Titled title="Settings"><Settings /></Titled>} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Titled title="Not found"><NotFound /></Titled>} />
          </Routes>
          </FacebookProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
