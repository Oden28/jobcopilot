import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  Wifi,
  DollarSign,
  Gauge,
} from "lucide-react";
import type { Job } from "@shared/schema";

const SOURCE_ICONS: Record<string, string> = {
  linkedin: "LI",
  indeed: "IN",
  glassdoor: "GD",
  wellfound: "WF",
  remoteok: "RO",
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-amber-500"
        : "bg-red-400";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-[10px] w-7 text-right">{score}%</span>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiRequest("PATCH", `/api/jobs/${job.id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/stats"] });
    },
  });

  const requirements = job.requirements
    ? JSON.parse(job.requirements as string)
    : [];

  return (
    <Card className="group" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Source badge */}
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
            {SOURCE_ICONS[job.source] || job.source.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate" data-testid={`text-job-title-${job.id}`}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  )}
                  {job.remote && (
                    <span className="flex items-center gap-1 text-primary">
                      <Wifi className="w-3 h-3" />
                      Remote
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score */}
              {job.matchScore && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                  <span
                    className={`text-sm font-semibold ${
                      job.matchScore >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : job.matchScore >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                    data-testid={`text-match-score-${job.id}`}
                  >
                    {job.matchScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {requirements.slice(0, 5).map((req: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {req}
                  </Badge>
                ))}
              </div>
            )}

            {/* Score Breakdown + Salary */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 space-y-1">
                {job.skillMatch && (
                  <ScoreBar score={job.skillMatch} label="Skills" />
                )}
                {job.seniorityFit && (
                  <ScoreBar score={job.seniorityFit} label="Seniority" />
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {job.salary && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                    <DollarSign className="w-3 h-3" />
                    {job.salary}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    statusMutation.mutate(
                      job.status === "saved" ? "new" : "saved"
                    )
                  }
                  data-testid={`button-save-job-${job.id}`}
                >
                  {job.status === "saved" ? (
                    <BookmarkCheck className="w-4 h-4 text-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => statusMutation.mutate("hidden")}
                  data-testid={`button-hide-job-${job.id}`}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" data-testid={`button-open-job-${job.id}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const filtered = jobs?.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (sourceFilter !== "all" && job.source !== sourceFilter) return false;
    if (statusFilter === "all" && job.status === "hidden") return false;
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const sources = [...new Set(jobs?.map((j) => j.source) || [])];

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div>
        <h1 className="text-lg font-semibold" data-testid="text-page-title">
          Discover Jobs
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filtered?.length || 0} jobs matching your criteria
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search jobs or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
            data-testid="input-search-jobs"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs" data-testid="select-source">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">No jobs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
