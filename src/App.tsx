import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import SuperadminLogin from "./pages/superadmin/Login";
import SuperadminDashboard from "./pages/superadmin/Dashboard";
import StudentLogin from "./pages/student/Login";
import StudentOnboarding from "./pages/student/Onboarding";
import StudentLearn from "./pages/student/Learn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Superadmin Routes */}
            <Route path="/superadmin/access/login" element={<SuperadminLogin />} />
            <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} />
            
            {/* Student Routes */}
            <Route path="/:schoolSlug/pupil/login" element={<StudentLogin />} />
            <Route path="/:schoolSlug/pupil/onboard" element={<StudentOnboarding />} />
            <Route path="/:schoolSlug/pupil/learn" element={<StudentLearn />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
