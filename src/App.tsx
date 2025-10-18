import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import CheckupReminder from "./pages/CheckupReminder";
import Vaccinations from "./pages/Vaccinations";
import LogWeight from "./pages/LogWeight";
import Emergency from "./pages/Emergency";
import Vets from "./pages/Vets";
import Settings from "./pages/Settings";
import PetProfile from "./pages/PetProfile";
import NotFound from "./pages/NotFound";
import WalkService from "./pages/WalkService";
import PetCrutch from "./pages/PetCrutch";
import Community from "./pages/Community";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
            <Route path="/edit-pet/:id" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
            <Route path="/pet/:id/checkup-reminder" element={<ProtectedRoute><CheckupReminder /></ProtectedRoute>} />
            <Route path="/pet/:id/vaccinations" element={<ProtectedRoute><Vaccinations /></ProtectedRoute>} />
            <Route path="/pet/:id/weight" element={<ProtectedRoute><LogWeight /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
            <Route path="/vets" element={<ProtectedRoute><Vets /></ProtectedRoute>} />
            <Route path="/walk-service" element={<ProtectedRoute><WalkService /></ProtectedRoute>} />
            <Route path="/pet-crutch" element={<ProtectedRoute><PetCrutch /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/pet/:id" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
