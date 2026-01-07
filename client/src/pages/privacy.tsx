import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-sans font-bold text-foreground mb-4">Privacy Policy</h1>
      <Card className="bg-card border-border shadow-md">
        <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
          <p className="text-foreground">Effective Date: January 7, 2026</p>
          <h3 className="text-foreground">1. Information We Collect</h3>
          <p className="text-foreground">We collect search engine ranking data and website URLs you provide for tracking purposes.</p>
          <h3 className="text-foreground">2. How We Use Information</h3>
          <p className="text-foreground">Information is used strictly to provide SEO tracking services and analytics to you.</p>
          <h3 className="text-foreground">3. Data Protection</h3>
          <p className="text-foreground">We implement industry-standard security measures to protect your data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
