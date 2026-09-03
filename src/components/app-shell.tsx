import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Store,
  Users,
  Wand2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { daysUntil, useEventStore } from "@/lib/event-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/event-details", label: "Event Details", icon: CalendarDays },
  { to: "/planner", label: "AI Planner", icon: Wand2, ai: true },
  { to: "/research", label: "AI Research Assistant", icon: Search, ai: true },
  { to: "/emails", label: "Smart Email Generator", icon: Mail, ai: true },
  { to: "/assistant", label: "AI Chatbot", icon: MessageSquare, ai: true },
  { to: "/guests", label: "Guest Management", icon: Users },
  { to: "/budget", label: "Budget", icon: BarChart3 },
  { to: "/vendors", label: "Vendors", icon: Store },
  { to: "/timeline", label: "Timeline", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--color-primary)]"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
            <span className="truncate">{item.label}</span>
            {"ai" in item && item.ai ? (
              <Sparkles className="ml-auto size-3.5 text-ai/70" aria-hidden />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-4">
      <span className="gradient-hero flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft">
        <Sparkles className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-bold">EventFlow AI</span>
        <span className="block text-[11px] text-muted-foreground">Intelligent event planning</span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const { state } = useEventStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const days = daysUntil(state.event.date);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="m-3 rounded-xl border bg-ai-surface/70 p-3">
          <p className="text-xs font-semibold text-ai">Responsible AI</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Always verify AI suggestions before booking, paying, or sending.
          </p>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-lift">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{state.event.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {state.event.type} · {days >= 0 ? `${days} days to go` : "Event completed"}
              </p>
            </div>

            <div className="relative hidden md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, guests, vendors…"
                className="w-56 pl-9 lg:w-72"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-5" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {state.tasks
                  .filter((t) => !t.done)
                  .slice(0, 3)
                  .map((t) => (
                    <DropdownMenuItem key={t.id} className="flex-col items-start gap-0.5">
                      <span className="text-sm">{t.title}</span>
                      <span className="text-xs text-muted-foreground">Due {t.due}</span>
                    </DropdownMenuItem>
                  ))}
                {state.tasks.every((t) => t.done) ? (
                  <DropdownMenuItem disabled>
                    <Check className="size-4" /> You're all caught up
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" asChild aria-label="Settings">
              <Link to="/settings">
                <Settings className="size-5" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      AM
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span>Amara Mitchell</span>
                  <span className="text-xs font-normal text-muted-foreground">Event lead</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/event-details">Event details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  tone?: "primary" | "success" | "warning" | "ai";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    ai: "bg-ai/10 text-ai",
  } as const;
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="secondary">{children}</Badge>;
}
