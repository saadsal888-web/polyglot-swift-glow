import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { LoadingScreen } from "./components/common/LoadingScreen";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import LessonsHub from "./pages/LessonsHub";
import Lesson from "./pages/Lesson";
import Subscription from "./pages/Subscription";
import Leaderboard from "./pages/Leaderboard";
import Badges from "./pages/Badges";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import DeleteAccount from "./pages/DeleteAccount";
import NotFound from "./pages/NotFound";
import StoryReader from "./pages/StoryReader";

const queryClient = new QueryClient();

const ONBOARDING_KEY = 'onboarding_seen';

const AppContent = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.warn('[App] localStorage not available:', e);
      }
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('[App] Failed to save onboarding status:', e);
    }
    setShowOnboarding(false);
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      {showOnboarding && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/lessons" element={<ProtectedRoute><LessonsHub /></ProtectedRoute>} />
          <Route path="/lesson/:moduleId/:lessonNumber" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
          <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
          <Route path="/stories/:storyId" element={<ProtectedRoute><StoryReader /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
