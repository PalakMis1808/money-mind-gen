import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";

// Mock data - this will be replaced with real data from Supabase
const expenseData = [
  { name: "Food", value: 450, color: "#3b82f6" },
  { name: "Rent", value: 1200, color: "#10b981" },
  { name: "Travel", value: 300, color: "#f59e0b" },
  { name: "Shopping", value: 200, color: "#ef4444" },
  { name: "Entertainment", value: 150, color: "#8b5cf6" },
  { name: "Other", value: 100, color: "#6b7280" },
];

const monthlyTrends = [
  { month: "Jan", spent: 2100, budget: 2500 },
  { month: "Feb", spent: 1900, budget: 2500 },
  { month: "Mar", spent: 2200, budget: 2500 },
  { month: "Apr", spent: 2400, budget: 2500 },
  { month: "May", spent: 2800, budget: 2500 },
  { month: "Jun", spent: 2400, budget: 2500 },
];

const Dashboard = () => {
  const totalSpent = expenseData.reduce((sum, item) => sum + item.value, 0);
  const monthlyBudget = 2500;
  const remaining = monthlyBudget - totalSpent;
  const spentPercentage = (totalSpent / monthlyBudget) * 100;

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
            <div className="text-2xl font-bold text-primary">${totalSpent}</div>
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
            <div className="text-2xl font-bold text-secondary">${monthlyBudget}</div>
            <p className="text-xs text-muted-foreground">
              Set for this month
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
              ${remaining}
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
          <div className="space-y-4">
            {[
              { date: "2024-01-15", category: "Food", amount: 45, notes: "Grocery shopping" },
              { date: "2024-01-14", category: "Travel", amount: 25, notes: "Bus ticket" },
              { date: "2024-01-13", category: "Entertainment", amount: 12, notes: "Movie ticket" },
              { date: "2024-01-12", category: "Shopping", amount: 89, notes: "New clothes" },
            ].map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {expense.category[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">{expense.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-destructive">-${expense.amount}</p>
                  <p className="text-sm text-muted-foreground">{expense.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;