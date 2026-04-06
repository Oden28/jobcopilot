import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  TrendingUp,
  Send,
  Trophy,
  ArrowRight,
  Clock,
  Target,
  Zap,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "wouter";
import type { Application, ActivityLogEntry } from "@shared/schema";
import { useEffect } from "react";

const STATUS_COLORS: Record<string, string> = {
  applied: "hsl(220, 65%, 48%)",
  screening: "hsl(43, 74%, 49%)",
  interview: "hsl(160, 60%, 36%)",
  offer: "hsl(280, 55%, 50%)",
  rejected: "hsl(0, 72%, 51%)",
  withdrawn: "hsl(215, 10%, 46%)",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export default function Dashboard() {
  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });

  const { data: appStats, isLoading: statsLoading } = useQuery<{
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
    responseRate: number;
    interviewRate: number;
  }>({ queryKey: ["/api/applications/stats"] });

  const { data: jobStats } = useQuery<{
    total: number;
    new: number;
    saved: number;
    sources: Record<string, number>;
  }>({ queryKey: ["/api/jobs/stats"] });

  const { data: recentApps } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: activity } = useQuery<ActivityLogEntry[]>({
    queryKey: ["/api/activity"],
  });

  // Auto-seed on first load if no data
  useEffect(() => {
    if (appStats && appStats.total === 0 && jobStats && jobStats.total === 0) {
      seedMutation.mutate();
    }
  }, [appStats, jobStats]);

  const pieData = appStats
    ? [
        { name: "Applied", value: appStats.applied, color: STATUS_COLORS.applied },
        { name: "Screening", value: appStats.screening, color: STATUS_COLORS.screening },
        { name: "Interview", value: appStats.interview, color: STATUS_COLORS.interview },
        { name: "Offer", value: appStats.offer, color: STATUS_COLORS.offer },
        { name: "Rejected", value: appStats.rejected, color: STATUS_COLORS.rejected },
      ].filter((d) => d.value > 0)
    : [];

  const sourceData = jobStats
    ? Object.entries(jobStats.sources).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: value,
      }))
    : [];

  const upcomingSteps = recentApps
    ?.filter((a) => a.nextStep && a.nextStepDate)
    .sort((a, b) => (a.nextStepDate! > b.nextStepDate! ? 1 : -1))
    .slice(0, 4);

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-1">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Applications</p>
                <p className="text-xl font-semibold mt-1" data-testid="text-total-apps">
                  {appStats?.total || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-1">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Response Rate</p>
                <p className="text-xl font-semibold mt-1" data-testid="text-response-rate">
                  {appStats?.responseRate || 0}%
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-1">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Interview Rate</p>
                <p className="text-xl font-semibold mt-1" data-testid="text-interview-rate">
                  {appStats?.interviewRate || 0}%
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                <Target className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-1">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Offers</p>
                <p className="text-xl font-semibold mt-1" data-testid="text-offers">
                  {appStats?.offer || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
                <Trophy className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Send className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jobs by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sourceData} barSize={24}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Search className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No jobs discovered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Steps */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-sm font-medium">Upcoming Steps</CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm" data-testid="button-view-all-apps">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingSteps && upcomingSteps.length > 0 ? (
              <div className="space-y-3">
                {upcomingSteps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-start gap-3 text-sm"
                    data-testid={`card-upcoming-${app.id}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted flex-shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{app.nextStep}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.company} &middot; {app.role}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.nextStepDate
                          ? new Date(app.nextStepDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                      {STATUS_LABELS[app.status] || app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming steps</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-sm font-medium">Job Discovery</CardTitle>
            <Link href="/jobs">
              <Button variant="ghost" size="sm" data-testid="button-discover-jobs">
                Explore <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold" data-testid="text-total-jobs">
                    {jobStats?.total || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Total Jobs</p>
                </div>
                <div className="text-center p-3 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold" data-testid="text-new-jobs">
                    {jobStats?.new || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">New</p>
                </div>
                <div className="text-center p-3 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold" data-testid="text-saved-jobs">
                    {jobStats?.saved || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Saved</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5 border border-primary/10">
                <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-medium">Auto-apply ready</p>
                  <p className="text-muted-foreground">
                    {jobStats?.new || 0} jobs match your criteria
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
