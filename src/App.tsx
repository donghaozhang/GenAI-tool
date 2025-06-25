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
import "@/utils/env-check"; // Initialize environment variable check

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ConfigsProvider>
          <CanvasProvider>
            <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/marketplace" element={<AIModelMarketplace />} />
            <Route path="/ai-marketplace" element={<AIModelMarketplace />} />
            <Route path="/designer" element={<AIDesigner />} />
            <Route path="/ai-designer" element={<AIDesigner />} />
            <Route path="/pricing" element={<PricingPlans />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/twitter-test" element={<TwitterTest />} />
            <Route path="/google-test" element={<GoogleOAuthTest />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
          </CanvasProvider>
        </ConfigsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
