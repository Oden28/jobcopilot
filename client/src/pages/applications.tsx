import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Building2,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  applied: "secondary",
  screening: "secondary",
  interview: "default",
  offer: "default",
  rejected: "destructive",
  withdrawn: "secondary",
};

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const newAppSchema = z.object({
  company: z.string().min(1, "Company required"),
  role: z.string().min(1, "Role required"),
  source: z.string().optional(),
  url: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

function ApplicationRow({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Application>) =>
      apiRequest("PATCH", `/api/applications/${app.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/stats"] });
      toast({ title: "Application updated" });
    },
  });

  return (
    <Card data-testid={`card-app-${app.id}`}>
      <CardContent className="p-0">
        {/* Main row */}
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-app-${app.id}`}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted text-xs font-semibold text-muted-foreground flex-shrink-0">
            {app.company.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{app.role}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {app.company}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(app.dateApplied).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {app.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {app.salary}
                </span>
              )}
            </div>
          </div>

          <Badge variant={STATUS_VARIANT[app.status] || "secondary"} className="text-[10px] flex-shrink-0">
            {STATUS_LABEL[app.status] || app.status}
          </Badge>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {app.source && (
                <div>
                  <span className="text-muted-foreground">Source:</span>{" "}
                  <span className="font-medium">{app.source}</span>
                </div>
              )}
              {app.responseDate && (
                <div>
                  <span className="text-muted-foreground">Response:</span>{" "}
                  <span className="font-medium">
                    {new Date(app.responseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {app.nextStep && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Next:</span>{" "}
                  <span className="font-medium">{app.nextStep}</span>
                  {app.nextStepDate && (
                    <span className="text-muted-foreground ml-1">
                      ({new Date(app.nextStepDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })})
                    </span>
                  )}
                </div>
              )}
            </div>

            {app.notes && (
              <div className="text-xs">
                <span className="text-muted-foreground flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3" /> Notes
                </span>
                <p className="text-foreground/80">{app.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Select
                defaultValue={app.status}
                onValueChange={(value) => updateMutation.mutate({ status: value })}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs" data-testid={`select-status-${app.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              {app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-open-app-${app.id}`}>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Applications() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: stats } = useQuery<{
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
  }>({ queryKey: ["/api/applications/stats"] });

  const form = useForm<z.infer<typeof newAppSchema>>({
    resolver: zodResolver(newAppSchema),
    defaultValues: { company: "", role: "", source: "", url: "", salary: "", notes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof newAppSchema>) =>
      apiRequest("POST", "/api/applications", {
        ...data,
        dateApplied: new Date().toISOString(),
        status: "applied",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/stats"] });
      form.reset();
      setDialogOpen(false);
      toast({ title: "Application tracked" });
    },
  });

  const filtered =
    statusFilter === "all"
      ? applications
      : applications?.filter((a) => a.status === statusFilter);

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold" data-testid="text-page-title">
            Applications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track and manage your job applications
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-application">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base">Track New Application</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-3 mt-2"
            >
              <Input
                placeholder="Company"
                {...form.register("company")}
                data-testid="input-company"
              />
              <Input
                placeholder="Role / Position"
                {...form.register("role")}
                data-testid="input-role"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Source" {...form.register("source")} data-testid="input-source" />
                <Input placeholder="Salary" {...form.register("salary")} data-testid="input-salary" />
              </div>
              <Input placeholder="Job URL" {...form.register("url")} data-testid="input-url" />
              <Textarea
                placeholder="Notes (optional)"
                rows={3}
                {...form.register("notes")}
                data-testid="input-notes"
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="button-submit-application"
              >
                {createMutation.isPending ? "Saving..." : "Track Application"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status pills */}
      {stats && (
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "All", count: stats.total },
            { key: "applied", label: "Applied", count: stats.applied },
            { key: "screening", label: "Screening", count: stats.screening },
            { key: "interview", label: "Interview", count: stats.interview },
            { key: "offer", label: "Offer", count: stats.offer },
            { key: "rejected", label: "Rejected", count: stats.rejected },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              data-testid={`button-filter-${key}`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Application list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Plus className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">No applications</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start tracking your applications
          </p>
        </div>
      )}
    </div>
  );
}
