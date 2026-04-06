import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Zap,
  ArrowRight,
  Crown,
  Rocket,
  Building2,
  Shield,
  Sparkles,
  Users,
  HeadphonesIcon,
  Infinity,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: any;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  enterprise?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    icon: Rocket,
    description: "For active job seekers getting started",
    monthlyPrice: 19,
    yearlyPrice: 149,
    cta: "Start free trial",
    features: [
      { text: "Up to 25 auto-applications / day", included: true },
      { text: "1 resume profile", included: true },
      { text: "AI cover letter generation", included: true },
      { text: "Job matching & ranking", included: true },
      { text: "Application tracker", included: true },
      { text: "5 job board sources", included: true },
      { text: "Email support", included: true },
      { text: "Multi-profile support", included: false },
      { text: "Custom company targeting", included: false },
      { text: "Interview prep AI", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    description: "For serious job seekers who want every edge",
    monthlyPrice: 39,
    yearlyPrice: 290,
    cta: "Start free trial",
    popular: true,
    features: [
      { text: "Up to 100 auto-applications / day", included: true, highlight: true },
      { text: "5 resume profiles", included: true, highlight: true },
      { text: "AI cover letter + short answers", included: true },
      { text: "Advanced job matching (semantic AI)", included: true, highlight: true },
      { text: "Full application tracker + analytics", included: true },
      { text: "All job board sources (15+)", included: true },
      { text: "A/B test cover letters", included: true, highlight: true },
      { text: "Interview preparation AI", included: true, highlight: true },
      { text: "Custom company targeting", included: true },
      { text: "Priority support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    description: "For teams, agencies, and power users",
    monthlyPrice: 99,
    yearlyPrice: 790,
    cta: "Contact sales",
    enterprise: true,
    features: [
      { text: "Unlimited auto-applications", included: true, highlight: true },
      { text: "Unlimited resume profiles", included: true, highlight: true },
      { text: "All Pro features included", included: true },
      { text: "Salary negotiation AI assistant", included: true, highlight: true },
      { text: "Email inbox integration", included: true },
      { text: "Dedicated account manager", included: true, highlight: true },
      { text: "Custom API access", included: true },
      { text: "Team dashboard (up to 10 seats)", included: true },
      { text: "White-label options", included: true },
      { text: "SLA with 99.9% uptime", included: true },
    ],
  },
];

const SOCIAL_PROOF = [
  { metric: "12,000+", label: "Active users" },
  { metric: "2.4M", label: "Applications sent" },
  { metric: "73%", label: "Interview rate" },
  { metric: "4.8/5", label: "User rating" },
];

const FAQ = [
  {
    q: "How does the free trial work?",
    a: "Start with a 7-day free trial on any paid plan. No credit card required. Cancel anytime before the trial ends and you won't be charged.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime. When upgrading, you'll be prorated for the remaining period. Downgrades take effect at the end of your billing cycle.",
  },
  {
    q: "What job boards do you support?",
    a: "We aggregate from LinkedIn, Indeed, Glassdoor, Wellfound (AngelList), RemoteOK, company career pages, and 10+ additional sources on Pro and Enterprise plans.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. All data is encrypted at rest and in transit. We never share your personal information with employers or third parties. You can delete your account and all data at any time.",
  },
  {
    q: "Do you guarantee job placements?",
    a: "While we can't guarantee specific outcomes, our Pro users see a 73% interview rate on average - 3x higher than manual applications. We optimize your materials and targeting continuously.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast({ title: "Create an account first", description: "Sign up to select a plan." });
      return;
    }
    toast({ title: "Plan selected", description: `You selected the ${planId} plan. Payment integration coming soon.` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight">JobCopilot</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-go-dashboard">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" data-testid="button-signup">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            7-day free trial on all plans
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            Invest in your career,<br />not in busy work
          </h1>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto leading-relaxed">
            Plans designed for every stage of your job search. From your first application to landing multiple offers.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm ${!isYearly ? "font-medium" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              data-testid="switch-billing"
            />
            <span className={`text-sm ${isYearly ? "font-medium" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                Save up to 40%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquiv = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
            const PlanIcon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <PlanIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight">
                        ${monthlyEquiv}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                    {isYearly && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ${price} billed yearly
                      </p>
                    )}
                  </div>

                  <Button
                    className={`w-full text-sm mb-5 ${plan.popular ? "" : "variant-secondary"}`}
                    variant={plan.popular ? "default" : "secondary"}
                    onClick={() => handleSelectPlan(plan.id)}
                    data-testid={`button-select-${plan.id}`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>

                  <div className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-xs ${
                          !feature.included ? "text-muted-foreground/50" : ""
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                            feature.included
                              ? feature.highlight
                                ? "text-primary"
                                : "text-muted-foreground"
                              : "text-muted-foreground/30"
                          }`}
                        />
                        <span className={feature.highlight ? "font-medium" : ""}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 border-t bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {SOCIAL_PROOF.map(({ metric, label }, i) => (
              <div key={i}>
                <p className="text-2xl font-semibold tracking-tight">{metric}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-8">Why JobCopilot stands out</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Anti-detection built in",
                desc: "Randomized delays, human-like behavior patterns, and CAPTCHA detection keep your accounts safe.",
              },
              {
                icon: Sparkles,
                title: "RAG-powered applications",
                desc: "Your resume, portfolio, and past experience feed a retrieval system that generates truly personalized responses.",
              },
              {
                icon: Users,
                title: "Human-in-the-loop",
                desc: "Optional approval step before every submission. Full autonomous mode for high-confidence matches.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-medium"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  data-testid={`button-faq-${i}`}
                >
                  {item.q}
                  <span className="text-muted-foreground ml-2 text-lg leading-none">
                    {expandedFaq === i ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary/5">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-semibold tracking-tight mb-2">
            Ready to land your dream job?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start your 7-day free trial. No credit card required.
          </p>
          <Link href="/auth">
            <Button size="default" className="gap-1" data-testid="button-cta-signup">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>JobCopilot</span>
          </div>
          <span>2026 JobCopilot. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
