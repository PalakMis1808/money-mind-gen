import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CalendarDays } from "lucide-react";

const categories = [
  "Food",
  "Rent", 
  "Travel",
  "Shopping",
  "Entertainment",
  "Other"
];

const AddExpense = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    category: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !user) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          notes: formData.notes || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Expense added successfully",
      });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        category: "",
        notes: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Add New Expense</h1>
        <p className="text-muted-foreground">Keep track of your spending</p>
      </div>

      {/* Form Card */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Expense Details</span>
          </CardTitle>
          <CardDescription>
            Fill in the details of your expense below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <span>Date *</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about this expense..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-elevated transition-all duration-200"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>Common expenses for faster entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Coffee", amount: 5, category: "Food" },
              { label: "Lunch", amount: 15, category: "Food" },
              { label: "Gas", amount: 50, category: "Travel" },
              { label: "Groceries", amount: 75, category: "Food" },
              { label: "Movie", amount: 12, category: "Entertainment" },
              { label: "Parking", amount: 10, category: "Travel" },
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    amount: item.amount.toString(),
                    category: item.category,
                    notes: item.label
                  }));
                }}
                disabled={loading}
                className="h-auto p-3 flex flex-col space-y-1 hover:bg-accent/80"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">${item.amount}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;