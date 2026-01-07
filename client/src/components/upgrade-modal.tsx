import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  requiredTier?: string;
}

export function UpgradeModal({ open, onOpenChange, featureName, requiredTier = "Agency" }: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">Upgrade Required</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            The <span className="text-primary font-bold">{featureName}</span> feature is only available on the <span className="text-white font-bold">{requiredTier}</span> plan and above.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-white/5 border border-white/5 rounded-xl p-6 my-4">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A1C976]" />
              Multi-engine tracking (Bing & DDG)
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A1C976]" />
              Real-time on-demand syncing
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A1C976]" />
              Index Shield monitoring
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            onClick={() => {
              onOpenChange(false);
              setLocation("/pricing");
            }}
          >
            View Pricing Plans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
