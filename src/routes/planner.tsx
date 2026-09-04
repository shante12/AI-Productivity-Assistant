import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AiLoadingCard, AiResponseCard, ResponsibleAiNotice } from "@/components/ai-response-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildSystemPrompt } from "@/lib/ai.functions";
import { eventContextString, useEventStore } from "@/lib/event-store";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Planner — EventFlow AI" },
      {
        name: "description",
        content: "Generate an event strategy, planning timeline and budget breakdown from your event brief.",
      },
      { property: "og:title", content: "AI Planner — EventFlow AI" },
      {
        property: "og:description",
        content: "Turn a short brief into a structured, editable event plan you stay in control of.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { state, setEvent, logAi } = useEventStore();
  const { generate, loading } = useAi();
  const [form, setForm] = useState({
    type: state.event.type,
    date: state.event.date,
    location: state.event.location,
    guests: String(state.event.guestTarget),
    budget: `${state.event.currency}${state.event.budget}`,
    theme: state.event.theme,
    preferences: state.event.preferences,
    requirements: state.event.requirements,
  });
  const [plan, setPlan] = useState<string | null>(null);

  const run = async () => {
    if (!form.type.trim() || !form.date) {
      toast.error("Add at least an event type and a date so the plan is realistic.");
      return;
    }
    const system = buildSystemPrompt({
      role: "You are a senior event planning assistant working inside the EventFlow AI dashboard.",
      context: `${eventContextString(state)}\n\nBrief submitted in the planner form:\nType: ${form.type}\nDate: ${form.date}\nLocation: ${form.location}\nGuests: ${form.guests}\nBudget: ${form.budget}\nTheme: ${form.theme}\nPreferences: ${form.preferences}\nSpecial requirements: ${form.requirements}`,
      objective:
        "Produce a complete, practical event plan the organiser can act on immediately and edit by hand.",
      constraints: [
        "Budget figures are planning estimates expressed as percentages plus an amount in the stated currency.",
        "Do not name real venues, vendors or suppliers.",
      ],
      format: `Markdown with exactly these sections:
## Event Strategy
Recommended event format, suggested theme, event objectives, planning priorities.
## Planning Timeline
Subsections: 3-6 months before, 1-2 months before, 2 weeks before, 1 week before, Event day, Post-event. Each a bullet list of concrete tasks.
## Budget Suggestions
A bullet per category (Venue, Catering, Entertainment, Decor, Photography, Marketing, Transportation, Contingency) with percentage and estimated amount, then two short notes on trade-offs.`,
    });

    const text = await generate(system, [
      { role: "user", content: "Generate the full event plan for the brief above." },
    ]);
    if (text) {
      setPlan(text);
      logAi("Generated an event plan in AI Planner");
      toast.success("Plan generated — review and edit before you rely on it");
    }
  };

  return (
    <AppShell
      title="AI Planner"
      description="Describe your event and get a structured strategy, timeline and budget you can edit."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Event brief</h2>
          <p className="mt-1 text-xs text-muted-foreground">Fields prefill from your event details.</p>
          <div className="mt-5 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-type">Event type</Label>
              <Input
                id="p-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Corporate networking evening"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-date">Event date</Label>
                <Input
                  id="p-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-guests">Guests</Label>
                <Input
                  id="p-guests"
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  placeholder="120"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-loc">Location</Label>
                <Input
                  id="p-loc"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Cape Town"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-budget">Budget</Label>
                <Input
                  id="p-budget"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="R150,000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-theme">Theme / style</Label>
              <Input
                id="p-theme"
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                placeholder="Modern and professional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-prefs">Preferences</Label>
              <Textarea
                id="p-prefs"
                rows={3}
                value={form.preferences}
                onChange={(e) => setForm({ ...form, preferences: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-reqs">Special requirements</Label>
              <Textarea
                id="p-reqs"
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              <Sparkles className="size-4" /> {loading ? "Building your plan…" : "Generate event plan"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEvent({
                  type: form.type,
                  date: form.date,
                  location: form.location,
                  guestTarget: Number(form.guests.replace(/\D/g, "")) || state.event.guestTarget,
                  theme: form.theme,
                  preferences: form.preferences,
                  requirements: form.requirements,
                });
                toast.success("Brief saved to your event details");
              }}
            >
              Save brief to event details
            </Button>
          </div>
        </section>

        <div className="space-y-6 lg:col-span-3">
          {loading ? <AiLoadingCard label="Drafting your event plan…" /> : null}

          {!loading && plan ? (
            <AiResponseCard
              title="Your event plan"
              content={plan}
              onChange={setPlan}
              onRegenerate={run}
              onSave={() => toast.success("Plan kept on this page — copy it into your notes or tasks")}
              saveLabel="Keep"
              footer="Estimates are AI-generated planning guidance, not quotes. Confirm costs and availability with suppliers."
            />
          ) : null}

          {!loading && !plan ? (
            <div className="surface-card gradient-ai flex flex-col items-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-ai/10 text-ai">
                <Sparkles className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">No plan generated yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Fill in the brief on the left and EventFlow AI will draft a strategy, a phased timeline
                and a budget breakdown you can edit line by line.
              </p>
            </div>
          ) : null}

          <ResponsibleAiNotice />
        </div>
      </div>
    </AppShell>
  );
}
