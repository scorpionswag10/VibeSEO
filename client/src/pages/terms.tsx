import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-sans font-bold text-foreground mb-4">Terms of Service</h1>
      <Card className="bg-card border-border shadow-md">
        <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
          <p className="text-foreground">Welcome to VibeSEO. By using our service, you agree to these terms.</p>
          <h3 className="text-foreground">1. Service Description</h3>
          <p className="text-foreground">VibeSEO provides search engine ranking tracking and SEO analysis tools.</p>
          <h3 className="text-foreground">2. Acceptable Use</h3>
          <p className="text-foreground">You agree not to use the service for any illegal or unauthorized purpose.</p>
          <h3 className="text-foreground">3. Termination</h3>
          <p className="text-foreground">We reserve the right to terminate service for violations of these terms.</p>
        </CardContent>
      </Card>
    </div>
  );
}
