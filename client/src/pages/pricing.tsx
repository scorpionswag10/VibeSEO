import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for personal blogs and small sites.",
    features: ["5 Keywords", "Google Tracking", "Weekly Updates", "1 Project"],
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$12",
    description: "For growing businesses needing more power.",
    features: ["50 Keywords", "Google & Bing", "Daily Updates", "5 Projects", "Competitor Tracking"],
    buttonText: "Upgrade to Pro",
    primary: true,
  },
  {
    name: "Agency",
    price: "$39",
    description: "The ultimate SEO power-suite for professionals.",
    features: ["Unlimited Keywords", "Google, Bing, & DuckDuckGo", "On-Demand Sync", "Unlimited Projects", "Global Pulse", "Index Shield"],
    buttonText: "Go Agency",
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "Custom solutions for large scale operations.",
    features: ["White-label Reports", "API Access", "Priority Support", "Dedicated Account Manager"],
    buttonText: "Contact Sales",
  },
];

export default function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="py-12 px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-sans font-bold text-[#050505] dark:text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-[#050505] dark:text-muted-foreground text-lg opacity-80">Choose the plan that fits your SEO needs. Upgrade or downgrade at any time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`bg-white dark:bg-card/40 backdrop-blur-sm border-[#DFE3EE] dark:border-white/5 shadow-xl flex flex-col ${tier.primary ? 'ring-2 ring-primary border-primary/50 scale-105 z-10' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl text-[#050505] dark:text-white">{tier.name}</CardTitle>
              <CardDescription className="dark:text-muted-foreground">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mb-8">
                <span className="text-4xl font-bold text-[#050505] dark:text-white">{tier.price}</span>
                <span className="text-secondary ml-1">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-[#050505] dark:text-muted-foreground">
                    <Check className="w-4 h-4 text-[#A1C976]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${tier.primary ? 'bg-[#1877F2] text-white hover:bg-[#1877F2]/90' : 'bg-white dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 border-[#DFE3EE] dark:border-white/10 text-[#050505] dark:text-white'}`}
                variant={tier.primary ? 'default' : 'outline'}
                disabled={tier.disabled}
              >
                {tier.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
