import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Words from "./pages/Words";
import LearnWords from "./pages/LearnWords";
import Phrases from "./pages/Phrases";
import LearnPhrases from "./pages/LearnPhrases";
import DeletedPhrases from "./pages/DeletedPhrases";
import TrainPhrases from "./pages/TrainPhrases";
import Exercise from "./pages/Exercise";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import Achievements from "./pages/Achievements";
import PlacementTest from "./pages/PlacementTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import DeleteAccount from "./pages/DeleteAccount";
import Auth from "./pages/Auth";
import DifficultWords from "./pages/DifficultWords";
import Subscription from "./pages/Subscription";
import Flashcards from "./pages/Flashcards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/words" element={<ProtectedRoute><Words /></ProtectedRoute>} />
              <Route path="/learn/:difficulty" element={<ProtectedRoute><LearnWords /></ProtectedRoute>} />
              <Route path="/phrases" element={<ProtectedRoute><Phrases /></ProtectedRoute>} />
              <Route path="/learn-phrases/:difficulty" element={<ProtectedRoute><LearnPhrases /></ProtectedRoute>} />
              <Route path="/deleted-phrases" element={<ProtectedRoute><DeletedPhrases /></ProtectedRoute>} />
              <Route path="/train-phrases" element={<ProtectedRoute><TrainPhrases /></ProtectedRoute>} />
              <Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/placement-test" element={<ProtectedRoute requireLevel={false}><PlacementTest /></ProtectedRoute>} />
              <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
              <Route path="/difficult-words" element={<ProtectedRoute><DifficultWords /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
