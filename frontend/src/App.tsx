import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TranslationPage from "./pages/TranslationPage";
import AudioPage from "./pages/AudioPage";
import NotFound from "./pages/NotFound";
import StartPage from "./pages/StartPage";
import LinkedInOnboarding from "./pages/LinkedInOnboarding";
import ProfileSummary from "./pages/ProfileSummary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/onboarding/linkedin" element={<LinkedInOnboarding />} />
          <Route path="/profile-summary" element={<ProfileSummary />} />
          <Route path="/onboarding/manual" element={<Index />} />
          <Route path="/translate" element={<TranslationPage />} />
          <Route path="/audio" element={<AudioPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
