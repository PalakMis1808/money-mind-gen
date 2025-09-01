import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Brain,
  Wallet
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/add-expense", icon: Plus, label: "Add Expense" },
    { path: "/budget", icon: Settings, label: "Budget" },
    { path: "/insights", icon: Brain, label: "AI Insights" },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MyFinance
              </span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-elevated"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;