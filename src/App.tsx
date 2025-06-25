import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigsProvider } from "@/contexts/ConfigsContext";
import { CanvasProvider } from "@/contexts/CanvasContext";
import Index from "./pages/Index";
import AuthPage from "./components/auth/AuthPage";
import AIModelMarketplace from "./pages/AIModelMarketplace";
import TwitterTest from "./pages/TwitterTest";
import GoogleOAuthTest from "./pages/GoogleOAuthTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import PricingPlans from "./components/marketplace/PricingPlans";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import { AIDesigner } from "./pages/designer/AIDesigner";
import AgentStudio from "./components/agent_studio/AgentStudio";
import CanvasList from "./components/designer/CanvasList";
import SettingsDialog from "./components/settings/dialog";
import Settings from "./pages/Settings";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "@/utils/env-check"; // Initialize environment variable check

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary fallback={<div className="p-4 text-center">Authentication error. Please refresh the page.</div>}>
          <AuthProvider>
            <ErrorBoundary fallback={<div className="p-4 text-center">Configuration error. Please check your settings.</div>}>
              <ConfigsProvider>
                <ErrorBoundary fallback={<div className="p-4 text-center">Canvas error. Please try refreshing.</div>}>
                  <CanvasProvider>
                    <BrowserRouter>
                      <ErrorBoundary>
                        <Routes>
                          <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                          <Route path="/auth" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
                          <Route path="/marketplace" element={<ErrorBoundary><AIModelMarketplace /></ErrorBoundary>} />
                          <Route path="/ai-marketplace" element={<ErrorBoundary><AIModelMarketplace /></ErrorBoundary>} />
                          <Route path="/designer" element={<ErrorBoundary><AIDesigner /></ErrorBoundary>} />
                          <Route path="/ai-designer" element={<ErrorBoundary><AIDesigner /></ErrorBoundary>} />
                          <Route path="/canvas/:canvasId" element={<ErrorBoundary><AIDesigner /></ErrorBoundary>} />
                          <Route path="/canvas" element={<ErrorBoundary><CanvasList /></ErrorBoundary>} />
                          <Route path="/agent-studio" element={<ErrorBoundary><AgentStudio /></ErrorBoundary>} />
                          <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
                          <Route path="/pricing" element={<ErrorBoundary><PricingPlans /></ErrorBoundary>} />
                          <Route path="/payment" element={<ErrorBoundary><Payment /></ErrorBoundary>} />
                          <Route path="/payment/success" element={<ErrorBoundary><PaymentSuccess /></ErrorBoundary>} />
                          <Route path="/twitter-test" element={<ErrorBoundary><TwitterTest /></ErrorBoundary>} />
                          <Route path="/google-test" element={<ErrorBoundary><GoogleOAuthTest /></ErrorBoundary>} />
                          <Route path="/privacy" element={<ErrorBoundary><PrivacyPolicy /></ErrorBoundary>} />
                          <Route path="/terms" element={<ErrorBoundary><TermsOfService /></ErrorBoundary>} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
                        </Routes>
                      </ErrorBoundary>
                      
                      {/* Settings Dialog - Available from anywhere */}
                      <ErrorBoundary fallback={<div>Settings unavailable</div>}>
                        <SettingsDialog />
                      </ErrorBoundary>
                    </BrowserRouter>
                  </CanvasProvider>
                </ErrorBoundary>
              </ConfigsProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
