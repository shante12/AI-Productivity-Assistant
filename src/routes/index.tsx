import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/app-shell";
import { AiBadge, ResponsibleAiNotice } from "@/components/ai-response-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  daysUntil,
  formatCurrency,
  uid,
  useEventStore,
  type Priority,
  type Task,
} from "@/lib/event-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EventFlow AI" },
      {
        name: "description",
        content:
          "Track event progress, budget, guests and tasks at a glance in your EventFlow AI planning dashboard.",
      },
      { property: "og:title", content: "Dashboard — EventFlow AI" },
      {
        property: "og:description",
        content: "Your AI-assisted event command centre: progress, budget, guests and upcoming tasks.",
      },
    ],
  }),
  component: DashboardPage,
});

const priorityStyles: Record<Priority, string> = {
  high: "border-destructive/30 bg-destructive/10 text-destructive",
  medium: "border-warning/40 bg-warning/15 text-warning-foreground",
  low: "border-border bg-muted text-muted-foreground",
};

function DashboardPage() {
  const { state, update } = useEventStore();
  const { event, tasks, guests, budgetItems, aiActivity } = state;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", priority: "medium" as Priority, due: "" });

  const spent = useMemo(() => budgetItems.reduce((s, i) => s + i.actual, 0), [budgetItems]);
  const confirmed = guests.filter((g) => g.rsvp === "Confirmed").length;
  const completion = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
  const days = daysUntil(event.date);
  const budgetPct = event.budget ? Math.min(100, Math.round((spent / event.budget) * 100)) : 0;

  const deadlines = useMemo(
    () => tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4),
    [tasks],
  );

  const openDialog = (task?: Task) => {
    setEditing(task ?? null);
    setForm(
      task
        ? { title: task.title, priority: task.priority, due: task.due }
        : { title: "", priority: "medium", due: "" },
    );
    setDialogOpen(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) {
      toast.error("Give the task a short name so you can recognise it later.");
      return;
    }
    if (editing) {
      update({ tasks: tasks.map((t) => (t.id === editing.id ? { ...t, ...form } : t)) });
      toast.success("Task updated");
    } else {
      update({ tasks: [...tasks, { id: uid(), done: false, ...form, due: form.due || event.date }] });
      toast.success("Task added");
    }
    setDialogOpen(false);
  };

  return (
    <AppShell
      title="Dashboard"
      description="Everything about your event in one place, with AI ready to help on the next step."
      action={
        <Button asChild>
          <Link to="/planner">
            <Sparkles className="size-4" /> Generate a plan
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="gradient-hero relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-lift sm:p-8">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge variant="secondary" className="mb-3 bg-white/15 text-primary-foreground">
                {event.type}
              </Badge>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{event.name}</h2>
              <p className="mt-2 text-sm opacity-90">
                {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {event.location}
              </p>
            </div>
            <div className="rounded-xl bg-white/12 px-5 py-4 backdrop-blur">
              <p className="text-xs tracking-wide uppercase opacity-80">Countdown</p>
              <p className="font-display text-3xl font-bold">
                {days >= 0 ? days : 0} <span className="text-base font-medium">days</span>
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Event progress"
            value={`${completion}% complete`}
            hint={`${tasks.filter((t) => t.done).length} of ${tasks.length} tasks done`}
            icon={TrendingUp}
          />
          <StatCard
            label="Budget"
            value={`${formatCurrency(spent, event.currency)} / ${formatCurrency(event.budget, event.currency)}`}
            hint={`${budgetPct}% of budget used`}
            icon={DollarSign}
            tone="success"
          />
          <StatCard
            label="Guests"
            value={`${confirmed} confirmed`}
            hint={`${guests.length} on the list · target ${event.guestTarget}`}
            icon={Users}
            tone="ai"
          />
          <StatCard
            label="Days remaining"
            value={`${days >= 0 ? days : 0} days`}
            hint={days >= 0 ? "Until event day" : "Event has passed"}
            icon={CalendarClock}
            tone="warning"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="surface-card lg:col-span-2">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <h2 className="font-display text-base font-semibold">Upcoming tasks</h2>
                <p className="text-xs text-muted-foreground">Tick items off as your plan progresses.</p>
              </div>
              <Button size="sm" onClick={() => openDialog()}>
                <Plus className="size-4" /> Add task
              </Button>
            </header>

            {tasks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CheckCircle2 className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">No tasks yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your first task, or let the AI Planner build a full timeline for you.
                </p>
                <Button className="mt-4" size="sm" onClick={() => openDialog()}>
                  <Plus className="size-4" /> Add task
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={(checked) => {
                        update({
                          tasks: tasks.map((t) => (t.id === task.id ? { ...t, done: Boolean(checked) } : t)),
                        });
                        if (checked) toast.success(`"${task.title}" completed`);
                      }}
                      aria-label={`Mark ${task.title} complete`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${task.done ? "text-muted-foreground line-through" : ""}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">Due {task.due}</p>
                    </div>
                    <Badge variant="outline" className={`hidden capitalize sm:inline-flex ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openDialog(task)} aria-label="Edit task">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(task.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            <section className="surface-card p-5">
              <h2 className="font-display text-base font-semibold">Progress overview</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Task completion</span>
                    <span className="font-medium text-foreground">{completion}%</span>
                  </div>
                  <Progress value={completion} />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Budget used</span>
                    <span className="font-medium text-foreground">{budgetPct}%</span>
                  </div>
                  <Progress value={budgetPct} />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>RSVPs confirmed</span>
                    <span className="font-medium text-foreground">
                      {event.guestTarget ? Math.round((confirmed / event.guestTarget) * 100) : 0}%
                    </span>
                  </div>
                  <Progress value={event.guestTarget ? (confirmed / event.guestTarget) * 100 : 0} />
                </div>
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="font-display text-base font-semibold">Upcoming deadlines</h2>
              {deadlines.length ? (
                <ul className="mt-3 space-y-3">
                  {deadlines.map((t) => (
                    <li key={t.id} className="flex items-start gap-3">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.due} · {t.priority} priority
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No open deadlines. Nice work.</p>
              )}
            </section>

            <section className="surface-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">Recent AI activity</h2>
                <AiBadge label="AI" />
              </div>
              {aiActivity.length ? (
                <ul className="mt-3 space-y-3">
                  {aiActivity.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing yet. Try the{" "}
                  <Link to="/planner" className="text-primary underline-offset-2 hover:underline">
                    AI Planner
                  </Link>{" "}
                  or{" "}
                  <Link to="/assistant" className="text-primary underline-offset-2 hover:underline">
                    AI Chatbot
                  </Link>
                  .
                </p>
              )}
            </section>
          </div>
        </div>

        <ResponsibleAiNotice />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "Add task"}</DialogTitle>
            <DialogDescription>Keep your plan moving with clear owners and dates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Confirm final headcount with caterer"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-due">Deadline</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTask} disabled={!form.title.trim()}>
              {editing ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the task from your plan. You can always add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep task</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                update({ tasks: tasks.filter((t) => t.id !== deleteId) });
                setDeleteId(null);
                toast.success("Task deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
