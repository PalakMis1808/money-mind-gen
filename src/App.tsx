import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Budget from "./pages/Budget";
import Reminders from "./pages/Reminders";
import AIInsights from "./pages/AIInsights";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }
  
  if (!user) {
    return <Auth />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {user && <Navigation />}
      <main className={user ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-expense" element={
            <ProtectedRoute>
              <AddExpense />
            </ProtectedRoute>
          } />
          <Route path="/budget" element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
