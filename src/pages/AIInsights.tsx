import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getMonthDateRange, getCurrentMonth } from "@/lib/dateUtils";
import { Brain, Lightbulb, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

interface AIResponse {
  analysis: string;
  tips: string[];
  alerts: string[];
}

const AIInsights = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);

  const generateInsights = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to generate AI insights.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const currentMonth = getCurrentMonth();
      const { startDate, endDate } = getMonthDateRange(currentMonth);

      // Fetch user's expenses for current month
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate);

      if (expensesError) throw expensesError;

      // Fetch user's budget for current month
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('limit_amount')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;

      const expenses = expensesData || [];
      const budget = budgetData?.limit_amount || 0;

      // Prepare data for AI
      const userData = {
        expenses: expenses.map(exp => ({
          category: exp.category,
          amount: exp.amount
        })),
        budget: budget
      };

      console.log('Sending data to AI:', userData);

      // Call Supabase Edge Function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-suggestions', {
        body: userData
      });

      if (aiError) {
        console.error('Edge function error:', aiError);
        throw new Error(aiError.message || 'Failed to get AI suggestions');
      }

      if (aiData.error) {
        console.error('AI API error:', aiData.error);
        throw new Error(aiData.error);
      }

      console.log('AI response:', aiData);

      setAiResponse(aiData);
      setHasGeneratedInsights(true);
      
      toast({
        title: "Success!",
        description: "AI insights generated successfully",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "⚠️ AI could not generate suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Financial Insights</h1>
        <p className="text-muted-foreground">Get personalized recommendations to improve your finances</p>
      </div>

      {/* Generate Insights Card */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Analysis</span>
          </CardTitle>
          <CardDescription>
            Get AI-powered insights based on your spending patterns and budget data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to analyze your finances?</h3>
              <p className="text-muted-foreground mb-4">
                Our AI will review your expenses, budget, and spending patterns to provide 
                personalized recommendations for better financial health.
              </p>
              <Button 
                onClick={generateInsights}
                disabled={isLoading}
                className="bg-gradient-primary hover:shadow-elevated transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating AI insights...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Results */}
      {hasGeneratedInsights && aiResponse && (
        <div className="space-y-6">
          {/* Analysis Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>Financial Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-accent/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm leading-relaxed">{aiResponse.analysis}</p>
              </div>
            </CardContent>
          </Card>

          {/* Money-Saving Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Money-Saving Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {aiResponse.tips.map((tip, index) => (
                  <div key={index} className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-start space-x-2">
                      <span className="text-success font-bold">•</span>
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          {aiResponse.alerts && aiResponse.alerts.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span>Financial Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {aiResponse.alerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <p className="text-sm leading-relaxed text-warning font-medium">{alert}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Financial Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Smart Saving Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-success">•</span>
                <span>Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success">•</span>
                <span>Set up automatic transfers to your savings account</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success">•</span>
                <span>Review and cancel unused subscriptions monthly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success">•</span>
                <span>Use cashback apps and credit card rewards wisely</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span>Budget Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Travel Over Budget</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You've exceeded your travel budget by $100 this month.
                </p>
              </div>
              
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Great Progress</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're 20% under budget for entertainment this month!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>How AI Insights Work</CardTitle>
          <CardDescription>Understanding our financial analysis process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium">Data Analysis</h4>
              <p className="text-sm text-muted-foreground">
                We analyze your spending patterns, budget adherence, and financial trends
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium">AI Processing</h4>
              <p className="text-sm text-muted-foreground">
                Our AI identifies opportunities for savings and financial improvements
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium">Personalized Tips</h4>
              <p className="text-sm text-muted-foreground">
                Receive tailored recommendations to optimize your financial health
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;