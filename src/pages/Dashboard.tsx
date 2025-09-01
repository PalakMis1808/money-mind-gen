import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  notes: string | null;
}

interface Budget {
  id: string;
  limit_amount: number;
  spent: number;
  month: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch current month's expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${currentMonth}-01`)
        .lt('date', `${currentMonth}-32`)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch current month's budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();

      if (budgetError) throw budgetError;

      setExpenses(expensesData || []);
      setBudget(budgetData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate expense breakdown by category
  const expenseData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({
        name: expense.category,
        value: expense.amount,
        color: getCategoryColor(expense.category)
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      "Food": "#3b82f6",
      "Rent": "#10b981",
      "Travel": "#f59e0b", 
      "Shopping": "#ef4444",
      "Entertainment": "#8b5cf6",
      "Other": "#6b7280"
    };
    return colors[category] || "#6b7280";
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyBudget = budget?.limit_amount || 0;
  const remaining = monthlyBudget - totalSpent;
  const spentPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // Calculate monthly trends (simplified for now)
  const monthlyTrends = [
    { month: "Jan", spent: 0, budget: monthlyBudget },
    { month: "Feb", spent: 0, budget: monthlyBudget },
    { month: "Mar", spent: 0, budget: monthlyBudget },
    { month: "Apr", spent: 0, budget: monthlyBudget },
    { month: "May", spent: 0, budget: monthlyBudget },
    { month: new Date().toLocaleDateString('en', { month: 'short' }), spent: totalSpent, budget: monthlyBudget },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your financial journey</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(1)}% of monthly budget
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">${monthlyBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {budget ? 'Set for this month' : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Your spending by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expenses recorded this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Your spending vs budget over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Spent"
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Budget"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {expense.category[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">{expense.notes || "No notes"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-destructive">-${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{expense.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No expenses recorded yet. <a href="/add-expense" className="text-primary hover:underline">Add your first expense</a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;