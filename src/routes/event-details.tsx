import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { ResponsibleAiNotice } from "@/components/ai-response-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEventStore } from "@/lib/event-store";

export const Route = createFileRoute("/event-details")({
  head: () => ({
    meta: [
      { title: "Event Details — EventFlow AI" },
      {
        name: "description",
        content: "Set your event name, date, location, guest target, budget and requirements.",
      },
      { property: "og:title", content: "Event Details — EventFlow AI" },
      {
        property: "og:description",
        content: "The single source of truth EventFlow AI uses for every suggestion it makes.",
      },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { state, setEvent } = useEventStore();
  const [draft, setDraft] = useState(state.event);
  const [saving, setSaving] = useState(false);

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Your event needs a name before you can save.");
      return;
    }
    setSaving(true);
    setEvent(draft);
    setTimeout(() => {
      setSaving(false);
      toast.success("Event details saved");
    }, 350);
  };

  return (
    <AppShell
      title="Event Details"
      description="These details give every AI feature the context it needs. Keep them current."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-card p-5 sm:p-6 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event type</Label>
              <Input id="type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Event date</Label>
              <Input
                id="date"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Expected guests</Label>
              <Input
                id="guests"
                type="number"
                min={0}
                value={draft.guestTarget}
                onChange={(e) => setDraft({ ...draft, guestTarget: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Total budget</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                value={draft.budget}
                onChange={(e) => setDraft({ ...draft, budget: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency symbol</Label>
              <Input
                id="currency"
                maxLength={3}
                value={draft.currency}
                onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="theme">Theme / style</Label>
              <Input id="theme" value={draft.theme} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prefs">Preferences</Label>
              <Textarea
                id="prefs"
                rows={3}
                value={draft.preferences}
                onChange={(e) => setDraft({ ...draft, preferences: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reqs">Special requirements</Label>
              <Textarea
                id="reqs"
                rows={3}
                placeholder="Accessibility, dietary, security, cultural or legal requirements"
                value={draft.requirements}
                onChange={(e) => setDraft({ ...draft, requirements: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={save} disabled={saving}>
              <Save className="size-4" /> {saving ? "Saving…" : "Save details"}
            </Button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface-card p-5">
            <h2 className="font-display text-base font-semibold">How this is used</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• The AI Planner builds strategy, timeline and budget splits from these fields.</li>
              <li>• The Email Generator personalises drafts with your event name and date.</li>
              <li>• The chatbot keeps this context through the whole conversation.</li>
            </ul>
            <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Everything you enter here is treated as user-provided information and is never presented
              as verified external data.
            </p>
          </section>
          <ResponsibleAiNotice compact />
        </div>
      </div>
    </AppShell>
  );
}
