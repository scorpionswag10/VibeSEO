import { normalizeUrl } from "@/lib/normalize";
import { useSettings, useUpdateSettings, useIntegrationsStatus } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings } from "@shared/schema";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, HardDrive, Download, Database, CheckCircle2, XCircle, Mail, Send, ListTodo, Clock } from "lucide-react";
import { format } from "date-fns";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { data: integrationStatus } = useIntegrationsStatus();
  const { toast } = useToast();

  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: [api.settings.getLogs.path],
    queryFn: async () => {
      const res = await fetch(api.settings.getLogs.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
  });

  const { data: dbStats, isLoading: isLoadingStats } = useQuery({
    queryKey: [api.settings.getDbStats.path],
    queryFn: async () => {
      const res = await fetch(api.settings.getDbStats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const handleExport = () => {
    window.open(api.settings.exportCsv.path, "_blank");
    toast({
      title: "Export Started",
      description: "Your CSV file is being downloaded.",
    });
  };

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", api.settings.testEmail.path);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema.partial()),
    defaultValues: {
      notificationEmail: "",
      emailNotifications: true,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        notificationEmail: settings.notificationEmail || "",
        emailNotifications: settings.emailNotifications || false,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: Partial<InsertSettings>) => {
    const normalizedData = {
      ...data,
      notificationEmail: data.notificationEmail ? data.notificationEmail.toLowerCase().trim() : undefined
    };
    updateSettings(normalizedData);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 bg-[#F7F7F7] dark:bg-[#18191A] min-h-screen p-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-[#050505] dark:text-[#E4E6EB] mb-1">Settings</h1>
        <p className="text-[#050505]/70 dark:text-[#B0B3B8]">Manage your application preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border dark:border-white/10 bg-white dark:bg-[#242526] backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#050505] dark:text-[#E4E6EB]">Notifications</CardTitle>
            <CardDescription className="text-[#050505]/70 dark:text-[#B0B3B8]">Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#050505]/5 dark:border-white/10 p-4 bg-[#050505]/5 dark:bg-white/5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-[#050505] dark:text-[#E4E6EB]">Email Alerts</FormLabel>
                        <FormDescription className="text-[#050505]/70 dark:text-[#B0B3B8]">
                          Receive notifications when keywords reach Top 3.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notificationEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#050505] dark:text-[#E4E6EB]">Notification Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} value={field.value || ""} className="bg-background/50 border-[#050505]/10 dark:border-white/10 text-[#050505] dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border dark:border-white/10 bg-white dark:bg-[#242526] backdrop-blur-sm shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#050505] dark:text-[#E4E6EB]">
                <HardDrive className="w-5 h-5 text-primary" />
                Database Stats
              </CardTitle>
              <CardDescription className="text-[#050505]/70 dark:text-[#B0B3B8]">System data usage and storage details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#050505]/5 dark:border-white/10 bg-[#050505]/5 dark:bg-white/5">
                  <p className="text-xs text-[#050505]/70 dark:text-[#B0B3B8] uppercase tracking-wider mb-1">Keywords</p>
                  <p className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                    {isLoadingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : dbStats?.totalKeywords}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#050505]/5 dark:border-white/10 bg-[#050505]/5 dark:bg-white/5">
                  <p className="text-xs text-[#050505]/70 dark:text-[#B0B3B8] uppercase tracking-wider mb-1">History Rows</p>
                  <p className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                    {isLoadingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : dbStats?.totalRankHistory}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-[#050505]/10 dark:border-white/10 hover:bg-[#050505]/5 dark:hover:bg-white/5 text-[#050505] dark:text-[#E4E6EB]"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data to CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border dark:border-white/10 bg-white dark:bg-[#242526] backdrop-blur-sm shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="text-lg text-[#050505] dark:text-[#E4E6EB]">System Status</CardTitle>
              <CardDescription className="text-[#050505]/70 dark:text-[#B0B3B8]">Status of external service integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#050505]/5 dark:border-white/10 bg-[#050505]/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-[#050505] dark:text-[#E4E6EB]">DataForSEO API</p>
                    <p className="text-xs text-[#050505]/70 dark:text-[#B0B3B8]">Ranking data provider</p>
                  </div>
                </div>
                {integrationStatus?.dataForSeo ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Disconnected
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[#050505]/5 dark:border-white/10 bg-[#050505]/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-[#050505] dark:text-[#E4E6EB]">Email Service</p>
                    <p className="text-xs text-[#050505]/70 dark:text-[#B0B3B8]">Resend API</p>
                  </div>
                </div>
                {integrationStatus?.email ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Disconnected
                  </div>
                )}
              </div>

              {integrationStatus?.email && (
                <Button 
                  variant="outline" 
                  className="w-full border-[#050505]/10 dark:border-white/10 hover:bg-[#050505]/5 dark:hover:bg-white/5 text-[#050505] dark:text-[#E4E6EB]"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                >
                  {testEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test Email
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border dark:border-white/10 bg-white dark:bg-[#242526] backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg text-[#050505] dark:text-[#E4E6EB]">Activity Logs</CardTitle>
              </div>
              <CardDescription className="text-[#050505]/70 dark:text-[#B0B3B8]">Real-time list of recent backend actions.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : logs?.length === 0 ? (
                <p className="text-sm text-center py-8 text-[#050505]/70 dark:text-[#B0B3B8]">No recent activity found.</p>
              ) : (
                <div className="space-y-4">
                  {logs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm group">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[#050505] dark:text-[#E4E6EB] font-medium leading-none">{log.message}</p>
                        <div className="flex items-center gap-1 text-xs text-[#050505]/70 dark:text-[#B0B3B8]">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.timestamp), "MMM d, h:mm:ss a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
