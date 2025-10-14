import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/edit-pet/:id" element={<EditPet />} />
          <Route path="/pet/:id/checkup-reminder" element={<CheckupReminder />} />
          <Route path="/pet/:id/vaccinations" element={<Vaccinations />} />
          <Route path="/pet/:id/weight" element={<LogWeight />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/vets" element={<Vets />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pet/:id" element={<PetProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
