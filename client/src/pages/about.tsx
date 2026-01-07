import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-display font-bold text-white mb-4">About VibeSEO</h1>
      <Card className="bg-card border-white/5 shadow-xl">
        <CardContent className="pt-6 prose prose-invert">
          <p>
            VibeSEO is an enterprise-grade SEO rank tracking application designed for precision and global scale. 
            We provide deep insights into your search engine performance across multiple regions and search engines.
          </p>
          <p>
            Our mission is to empower SEO professionals and agencies with the most accurate, real-time data 
            to drive their organic growth strategies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
