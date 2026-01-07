import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Globe, 
  Settings as SettingsIcon, 
  Search,
  Bell,
  Menu,
  X,
  Lightbulb,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useProjects } from "@/hooks/use-projects";
import { Footer } from "./footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { data: projects } = useProjects();

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Global Pulse", href: "/dashboard/global-pulse", icon: Globe },
    { name: "Competitor Research", href: "/competitor-research", icon: Search },
    { name: "Content Ideas", href: "/content-ideas", icon: Lightbulb },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/30 backdrop-blur-sm fixed h-full z-30">
          <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D9EC4] to-[#A1C976] flex items-center justify-center shadow-lg shadow-primary/20">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-[#2D9EC4] to-[#A1C976] bg-clip-text text-transparent">VibeSEO</span>
                <span className="text-[10px] font-bold text-[#A1C976] tracking-widest leading-none">BETA</span>
              </div>
            </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform</p>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-white"
                )} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projects</p>
               <Link href="/" className="text-[10px] text-primary hover:underline">View All</Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="px-3 text-sm text-muted-foreground italic">No projects yet</p>
            ) : (
              recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  location === `/projects/${project.id}` 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  <span className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-colors"></span>
                  <span className="truncate">{project.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
               ME
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-white truncate">Admin User</p>
               <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Header Mobile/Desktop */}
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-muted-foreground hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <span className="font-display font-bold text-lg text-white">VibeSEO</span>
            </div>

            <div className="hidden lg:flex items-center w-full max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search projects, keywords..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 text-muted-foreground hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-background"></span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 shadow-2xl animate-in slide-in-from-top-2">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase">Projects</p>
                  {recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {project.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  </div>
  );
}
