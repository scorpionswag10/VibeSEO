import { useSettings, useUpdateSettings, useIntegrationsStatus } from "@/hooks/use-settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Mail, Database, Send } from "lucide-react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { data: integrationStatus } = useIntegrationsStatus();
  const { toast } = useToast();

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
    updateSettings(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 bg-white/5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-white">Email Alerts</FormLabel>
                        <FormDescription>
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
                      <FormLabel>Notification Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} value={field.value || ""} className="bg-background/50 border-white/10" />
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

        <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl h-fit">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>Status of external service integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-white">DataForSEO API</p>
                  <p className="text-xs text-muted-foreground">Ranking data provider</p>
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

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Service</p>
                  <p className="text-xs text-muted-foreground">Resend API</p>
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
                className="w-full border-white/10 hover:bg-white/5"
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
      </div>
    </div>
  );
}
