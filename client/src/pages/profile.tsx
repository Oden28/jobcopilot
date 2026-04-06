import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Save,
  Briefcase,
  GraduationCap,
  Code,
  Target,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ["/api/profile"],
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      minSalary: 0,
      remoteOnly: false,
      skills: "",
      preferredRoles: "",
      techStack: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        headline: profile.headline || "",
        summary: profile.summary || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        minSalary: profile.minSalary || 0,
        remoteOnly: profile.remoteOnly || false,
        skills: profile.skills ? JSON.parse(profile.skills).join(", ") : "",
        preferredRoles: profile.preferredRoles
          ? JSON.parse(profile.preferredRoles).join(", ")
          : "",
        techStack: profile.techStack
          ? JSON.parse(profile.techStack).join(", ")
          : "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        skills: JSON.stringify(
          data.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        ),
        preferredRoles: JSON.stringify(
          data.preferredRoles
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        ),
        techStack: JSON.stringify(
          data.techStack
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        ),
      };
      return apiRequest("POST", "/api/profile", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile saved" });
    },
  });

  const skills = profile?.skills ? JSON.parse(profile.skills) : [];
  const experience = profile?.experience ? JSON.parse(profile.experience) : [];
  const education = profile?.education ? JSON.parse(profile.education) : [];
  const preferredRoles = profile?.preferredRoles
    ? JSON.parse(profile.preferredRoles)
    : [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
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
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold" data-testid="text-page-title">
            Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your CV data used for tailored applications
          </p>
        </div>
        <Button
          size="sm"
          onClick={form.handleSubmit((data) => saveMutation.mutate(data))}
          disabled={saveMutation.isPending}
          data-testid="button-save-profile"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Edit form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                  <Input {...form.register("fullName")} data-testid="input-fullname" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input {...form.register("email")} data-testid="input-email" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <Input {...form.register("phone")} data-testid="input-phone" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <Input {...form.register("location")} data-testid="input-location" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Headline</label>
                <Input {...form.register("headline")} data-testid="input-headline" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Summary</label>
                <Textarea rows={4} {...form.register("summary")} data-testid="input-summary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" /> Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </label>
                  <Input {...form.register("linkedinUrl")} data-testid="input-linkedin" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3" /> GitHub
                  </label>
                  <Input {...form.register("githubUrl")} data-testid="input-github" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Portfolio
                  </label>
                  <Input {...form.register("portfolioUrl")} data-testid="input-portfolio" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" /> Job Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Skills (comma separated)
                </label>
                <Textarea rows={2} {...form.register("skills")} data-testid="input-skills" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Preferred Roles (comma separated)
                </label>
                <Input {...form.register("preferredRoles")} data-testid="input-roles" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Tech Stack (comma separated)
                </label>
                <Input {...form.register("techStack")} data-testid="input-techstack" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Min Salary (USD)
                  </label>
                  <Input
                    type="number"
                    {...form.register("minSalary", { valueAsNumber: true })}
                    data-testid="input-salary"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    checked={form.watch("remoteOnly")}
                    onCheckedChange={(checked) => form.setValue("remoteOnly", checked)}
                    data-testid="switch-remote"
                  />
                  <label className="text-xs">Remote only</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Preview */}
        <div className="space-y-4">
          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {experience.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experience.map(
                  (
                    exp: {
                      title: string;
                      company: string;
                      period: string;
                      description: string;
                    },
                    i: number
                  ) => (
                    <div key={i} className="text-xs">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-muted-foreground">
                        {exp.company} &middot; {exp.period}
                      </p>
                      <p className="text-muted-foreground mt-0.5">{exp.description}</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {education.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {education.map(
                  (
                    edu: { degree: string; school: string; year: string },
                    i: number
                  ) => (
                    <div key={i} className="text-xs">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-muted-foreground">
                        {edu.school} &middot; {edu.year}
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {preferredRoles.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Target Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {preferredRoles.map((role: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
