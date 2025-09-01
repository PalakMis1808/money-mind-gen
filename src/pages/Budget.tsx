import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, DollarSign, TrendingUp, AlertTriangle, Settings } from "lucide-react";

const Budget = () => {
  const { toast } = useToast();
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [newBudget, setNewBudget] = useState("");
  
  // Mock data - this will come from Supabase
  const currentSpent = 2400;
  const remaining = monthlyBudget - currentSpent;
  const spentPercentage = (currentSpent / monthlyBudget) * 100;
  
  const categoryBudgets = [
    { category: "Food", budgeted: 600, spent: 450, color: "bg-blue-500" },
    { category: "Rent", budgeted: 1200, spent: 1200, color: "bg-green-500" },
    { category: "Travel", budgeted: 200, spent: 300, color: "bg-yellow-500" },
    { category: "Shopping", budgeted: 250, spent: 200, color: "bg-red-500" },
    { category: "Entertainment", budgeted: 150, spent: 150, color: "bg-purple-500" },
    { category: "Other", budgeted: 100, spent: 100, color: "bg-gray-500" },
  ];

  const handleBudgetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget || parseFloat(newBudget) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    // This will be replaced with actual API call to Supabase
    setMonthlyBudget(parseFloat(newBudget));
    setNewBudget("");
    
    toast({
      title: "Success!",
      description: "Monthly budget updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Budget Settings</h1>
        <p className="text-muted-foreground">Manage your monthly spending limits</p>
      </div>

      {/* Current Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${monthlyBudget}</div>
            <p className="text-xs text-muted-foreground">
              Total monthly limit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${currentSpent}</div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            {remaining > 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining > 0 ? 'text-success' : 'text-destructive'}`}>
              ${remaining}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Your spending progress for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={spentPercentage} 
              className={`h-3 ${spentPercentage > 90 ? 'bg-destructive/20' : spentPercentage > 75 ? 'bg-warning/20' : 'bg-success/20'}`}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${currentSpent} spent</span>
              <span>${monthlyBudget} budget</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Budget */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Update Monthly Budget</span>
          </CardTitle>
          <CardDescription>
            Set your new monthly spending limit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBudgetUpdate} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="budget" className="sr-only">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter new budget amount"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="bg-gradient-primary hover:shadow-elevated transition-all duration-200"
            >
              Update Budget
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Spending by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBudgets.map((item, index) => {
              const categoryPercentage = (item.spent / item.budgeted) * 100;
              const isOverBudget = item.spent > item.budgeted;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                        ${item.spent}
                      </span>
                      <span className="text-muted-foreground"> / ${item.budgeted}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(categoryPercentage, 100)} 
                    className={`h-2 ${isOverBudget ? 'bg-destructive/20' : 'bg-muted'}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{categoryPercentage.toFixed(0)}% used</span>
                    <span>
                      {isOverBudget ? (
                        <span className="text-destructive">Over by ${item.spent - item.budgeted}</span>
                      ) : (
                        <span>${item.budgeted - item.spent} remaining</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budget;