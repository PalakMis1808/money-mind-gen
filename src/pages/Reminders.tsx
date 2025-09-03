import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar, DollarSign, Plus, Trash2, Clock } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  due_date: string;
  amount: number | null;
  created_at: string;
}

const Reminders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    due_date: "",
    amount: ""
  });

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.due_date || !user) {
      toast({
        title: "Error",
        description: "Please fill in the title and due date",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: formData.title,
          due_date: formData.due_date,
          amount: formData.amount ? parseFloat(formData.amount) : null
        })
        .select()
        .single();

      if (error) throw error;

      setReminders([...reminders, data]);
      setFormData({ title: "", due_date: "", amount: "" });
      
      toast({
        title: "Success!",
        description: "Reminder added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add reminder",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReminders(reminders.filter(reminder => reminder.id !== id));
      
      toast({
        title: "Success!",
        description: "Reminder deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive"
      });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Bill Reminders</h1>
        <p className="text-muted-foreground">Never miss a payment again</p>
      </div>

      {/* Add New Reminder */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add New Reminder</span>
          </CardTitle>
          <CardDescription>Set up notifications for upcoming bills</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Bill Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Electricity Bill"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="bg-gradient-primary hover:shadow-elevated transition-all duration-200"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Reminder"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="grid gap-4">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={`shadow-card ${isOverdue(reminder.due_date) ? 'border-destructive bg-destructive/5' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOverdue(reminder.due_date) ? 'bg-destructive/20' : 'bg-primary/10'}`}>
                      <Bell className={`h-6 w-6 ${isOverdue(reminder.due_date) ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reminder.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue(reminder.due_date) ? 'text-destructive font-medium' : ''}>
                            {formatDate(reminder.due_date)}
                            {isOverdue(reminder.due_date) && " (Overdue)"}
                          </span>
                        </div>
                        {reminder.amount && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${reminder.amount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reminder.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reminders set</h3>
              <p className="text-muted-foreground">Add your first bill reminder to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {reminders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-primary">
                {reminders.length}
              </div>
              <p className="text-muted-foreground">Total Reminders</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-destructive">
                {reminders.filter(r => isOverdue(r.due_date)).length}
              </div>
              <p className="text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-success">
                ₹{reminders.reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)}
              </div>
              <p className="text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reminders;