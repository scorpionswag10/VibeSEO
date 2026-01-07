import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-sm py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} VibeSEO. All rights reserved.
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
