import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Clock,
  Shield,
  Bell,
  Zap,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SettingsState {
  autoApplyEnabled: boolean;
  autoApplyThreshold: string;
  maxAppsPerDay: string;
  scanInterval: string;
  humanInLoop: boolean;
  respectRobotsTxt: boolean;
  antiDetection: boolean;
  emailNotifications: boolean;
  dailyDigest: boolean;
  llmProvider: string;
}

const DEFAULTS: SettingsState = {
  autoApplyEnabled: false,
  autoApplyThreshold: "80",
  maxAppsPerDay: "50",
  scanInterval: "6",
  humanInLoop: true,
  respectRobotsTxt: true,
  antiDetection: true,
  emailNotifications: true,
  dailyDigest: true,
  llmProvider: "openai",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);

  const { data: savedSettings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings({
        autoApplyEnabled: savedSettings.autoApplyEnabled === "true",
        autoApplyThreshold: savedSettings.autoApplyThreshold || "80",
        maxAppsPerDay: savedSettings.maxAppsPerDay || "50",
        scanInterval: savedSettings.scanInterval || "6",
        humanInLoop: savedSettings.humanInLoop !== "false",
        respectRobotsTxt: savedSettings.respectRobotsTxt !== "false",
        antiDetection: savedSettings.antiDetection !== "false",
        emailNotifications: savedSettings.emailNotifications !== "false",
        dailyDigest: savedSettings.dailyDigest !== "false",
        llmProvider: savedSettings.llmProvider || "openai",
      });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        await apiRequest("POST", "/api/settings", {
          key,
          value: String(value),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full max-w-2xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold" data-testid="text-page-title">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure automation and system preferences
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save-settings"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Automation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="w-4 h-4" /> Auto-Apply Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Auto-Apply</p>
              <p className="text-xs text-muted-foreground">
                Automatically submit applications above confidence threshold
              </p>
            </div>
            <Switch
              checked={settings.autoApplyEnabled}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, autoApplyEnabled: c }))
              }
              data-testid="switch-auto-apply"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Human-in-the-Loop</p>
              <p className="text-xs text-muted-foreground">
                Require approval before each submission
              </p>
            </div>
            <Switch
              checked={settings.humanInLoop}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, humanInLoop: c }))
              }
              data-testid="switch-human-loop"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Confidence Threshold (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.autoApplyThreshold}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    autoApplyThreshold: e.target.value,
                  }))
                }
                data-testid="input-threshold"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Max Applications / Day
              </label>
              <Input
                type="number"
                min={1}
                max={200}
                value={settings.maxAppsPerDay}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, maxAppsPerDay: e.target.value }))
                }
                data-testid="input-max-apps"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanning */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> Job Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Scan Interval (hours)
            </label>
            <Select
              value={settings.scanInterval}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, scanInterval: v }))
              }
            >
              <SelectTrigger className="w-full" data-testid="select-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every hour</SelectItem>
                <SelectItem value="3">Every 3 hours</SelectItem>
                <SelectItem value="6">Every 6 hours</SelectItem>
                <SelectItem value="12">Every 12 hours</SelectItem>
                <SelectItem value="24">Once a day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Model */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              LLM Provider
            </label>
            <Select
              value={settings.llmProvider}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, llmProvider: v }))
              }
            >
              <SelectTrigger className="w-full" data-testid="select-llm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="local">Local (Ollama)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" /> Safety & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Respect robots.txt</p>
              <p className="text-xs text-muted-foreground">
                Comply with platform access rules
              </p>
            </div>
            <Switch
              checked={settings.respectRobotsTxt}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, respectRobotsTxt: c }))
              }
              data-testid="switch-robots"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Anti-Detection Mode</p>
              <p className="text-xs text-muted-foreground">
                Randomize delays and mimic human behavior
              </p>
            </div>
            <Switch
              checked={settings.antiDetection}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, antiDetection: c }))
              }
              data-testid="switch-anti-detect"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified on status changes
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, emailNotifications: c }))
              }
              data-testid="switch-email"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily Digest</p>
              <p className="text-xs text-muted-foreground">
                Summary of new jobs and application updates
              </p>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={(c) =>
                setSettings((s) => ({ ...s, dailyDigest: c }))
              }
              data-testid="switch-digest"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
