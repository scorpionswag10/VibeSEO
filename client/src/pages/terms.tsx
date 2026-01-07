import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-display font-bold text-white mb-4">Terms of Service</h1>
      <Card className="bg-card border-white/5 shadow-xl">
        <CardContent className="pt-6 prose prose-invert">
          <p>Welcome to VibeSEO. By using our service, you agree to these terms.</p>
          <h3>1. Service Description</h3>
          <p>VibeSEO provides search engine ranking tracking and SEO analysis tools.</p>
          <h3>2. Acceptable Use</h3>
          <p>You agree not to use the service for any illegal or unauthorized purpose.</p>
          <h3>3. Termination</h3>
          <p>We reserve the right to terminate service for violations of these terms.</p>
        </CardContent>
      </Card>
    </div>
  );
}
