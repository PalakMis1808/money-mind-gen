import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Target, DollarSign, TrendingUp, AlertTriangle, Settings } from "lucide-react";

interface Budget {
  id: string;
  limit_amount: number;
  spent: number;
  month: string;
}

interface Expense {
  category: string;
  amount: number;
}

const Budget = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newBudget, setNewBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  useEffect(() => {
    if (user) {
      fetchBudgetData();
    }
  }, [user]);

  const fetchBudgetData = async () => {
    if (!user) return;

    try {
      // Fetch current month's budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();

      if (budgetError) throw budgetError;

      // Fetch current month's expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', user.id)
        .gte('date', `${currentMonth}-01`)
        .lt('date', `${currentMonth}-32`);

      if (expensesError) throw expensesError;

      setBudget(budgetData);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget || parseFloat(newBudget) <= 0 || !user) {
      toast({
        title: "Error",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);

    try {
      const budgetAmount = parseFloat(newBudget);

      if (budget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({ limit_amount: budgetAmount })
          .eq('id', budget.id);

        if (error) throw error;

        setBudget({ ...budget, limit_amount: budgetAmount });
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            month: currentMonth,
            limit_amount: budgetAmount,
            spent: 0
          })
          .select()
          .single();

        if (error) throw error;

        setBudget(data);
      }

      setNewBudget("");
      
      toast({
        title: "Success!",
        description: "Monthly budget updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Calculate category breakdown
  const categoryBudgets = ["Food", "Rent", "Travel", "Shopping", "Entertainment", "Other"].map(category => {
    const spent = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Simplified category budget allocation (could be made more sophisticated)
    const budgetShare = {
      "Rent": 0.4,
      "Food": 0.25,
      "Travel": 0.1,
      "Shopping": 0.1,
      "Entertainment": 0.1,
      "Other": 0.05
    };
    
    const budgeted = (budget?.limit_amount || 0) * (budgetShare[category as keyof typeof budgetShare] || 0.05);
    
    return {
      category,
      budgeted,
      spent,
      color: getCategoryColor(category)
    };
  });

  function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      "Food": "bg-blue-500",
      "Rent": "bg-green-500",
      "Travel": "bg-yellow-500",
      "Shopping": "bg-red-500",
      "Entertainment": "bg-purple-500",
      "Other": "bg-gray-500"
    };
    return colors[category] || "bg-gray-500";
  }

  const currentSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyBudget = budget?.limit_amount || 0;
  const remaining = monthlyBudget - currentSpent;
  const spentPercentage = monthlyBudget > 0 ? (currentSpent / monthlyBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading budget data...</div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-primary">${monthlyBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {budget ? 'Set for this month' : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${currentSpent.toFixed(2)}</div>
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
              ${remaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {budget && (
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
                <span>${currentSpent.toFixed(2)} spent</span>
                <span>${monthlyBudget.toFixed(2)} budget</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Budget */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>{budget ? 'Update' : 'Set'} Monthly Budget</span>
          </CardTitle>
          <CardDescription>
            {budget ? 'Update your' : 'Set your'} monthly spending limit
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
                  placeholder={budget ? `Current: ${budget.limit_amount}` : "Enter budget amount"}
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="bg-gradient-primary hover:shadow-elevated transition-all duration-200"
              disabled={updating}
            >
              {updating ? "Updating..." : (budget ? "Update Budget" : "Set Budget")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {budget && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Spending by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBudgets.map((item, index) => {
                const categoryPercentage = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;
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
                          ${item.spent.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground"> / ${item.budgeted.toFixed(2)}</span>
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
                          <span className="text-destructive">Over by ${(item.spent - item.budgeted).toFixed(2)}</span>
                        ) : (
                          <span>${(item.budgeted - item.spent).toFixed(2)} remaining</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Budget;