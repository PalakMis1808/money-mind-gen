import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Lightbulb, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

const AIInsights = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    
    try {
      // This will be replaced with actual API call to backend/AI service
      // For now, we'll simulate with mock insights
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights = [
        "🍽️ Your food expenses have increased by 15% this month. Consider meal planning to reduce costs.",
        "🚗 Travel expenses are 50% over budget. Look into carpooling or public transportation options.",
        "🎬 Entertainment spending is well within budget. Good job maintaining balance!",
        "💡 You could save $200/month by reducing food delivery orders and cooking more at home.",
        "📊 Your spending pattern shows consistent overspending in the last week of each month. Plan ahead!",
        "🎯 Based on your trends, consider setting aside $150 more per month for unexpected expenses.",
      ];
      
      setInsights(mockInsights);
      setHasGeneratedInsights(true);
      
      toast({
        title: "Success!",
        description: "AI insights generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
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
                    Analyzing...
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

      {/* Insights Results */}
      {hasGeneratedInsights && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Your Personalized Insights</span>
            </CardTitle>
            <CardDescription>
              Based on your spending data from the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 bg-accent/50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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