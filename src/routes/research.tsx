import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AiLoadingCard, AiResponseCard, ResponsibleAiNotice } from "@/components/ai-response-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildSystemPrompt } from "@/lib/ai.functions";
import { eventContextString, useEventStore } from "@/lib/event-store";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — EventFlow AI" },
      {
        name: "description",
        content:
          "Research venues, catering, vendors, budgeting and risk planning with structured AI findings and clear sourcing.",
      },
      { property: "og:title", content: "AI Research Assistant — EventFlow AI" },
      {
        property: "og:description",
        content: "Ask event planning questions and get key findings, recommendations and open questions.",
      },
    ],
  }),
  component: ResearchPage,
});

const CATEGORIES = [
  "Venues",
  "Catering",
  "Entertainment",
  "Decor",
  "Vendors",
  "Budgeting",
  "Guest experience",
  "Sustainability",
  "Event technology",
  "Risk planning",
];

const EXAMPLES = [
  "What should I consider when choosing a venue for a 200-person conference?",
  "What are some sustainable catering ideas for a corporate event?",
  "Create a checklist for evaluating event photographers.",
];

function ResearchPage() {
  const { state, logAi } = useEventStore();
  const { generate, loading } = useAi();
  const [category, setCategory] = useState("Venues");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asked, setAsked] = useState("");

  const run = async (q = question) => {
    if (!q.trim()) {
      toast.error("Type a research question first.");
      return;
    }
    setAsked(q);
    const system = buildSystemPrompt({
      role: "You are an event planning research assistant.",
      context: `${eventContextString(state)}\n\nResearch category: ${category}`,
      objective:
        "Answer the research question with structured, decision-ready analysis the planner can act on.",
      constraints: [
        "Do not invent sources, statistics, prices, reviews or vendor names.",
        "If a figure varies by market, say so and explain what drives the range instead of quoting a number.",
        "Label every recommendation as an AI suggestion based on general event planning practice.",
      ],
      format: `Markdown with exactly these sections:
## Key Findings
## Recommendations
## Pros and Cons
## Questions to Investigate Further
## Sources / Further Reading
In the last section list only the types of authoritative sources to check (e.g. official venue documentation, local licensing authority). State plainly that no live sources were retrieved and that these are AI-generated suggestions, not verified external information.`,
    });
    const text = await generate(system, [{ role: "user", content: q }]);
    if (text) {
      setAnswer(text);
      logAi(`Researched: ${q.slice(0, 60)}`);
      toast.success("Research ready");
    }
  };

  return (
    <AppShell
      title="AI Research Assistant"
      description="Structured research for planning decisions — findings, trade-offs and what to verify next."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface-card p-5 sm:p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Research category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q">Your question</Label>
              <Textarea
                id="q"
                rows={6}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What should I consider when choosing a venue for a 200-person conference?"
              />
            </div>
            <Button className="w-full" onClick={() => run()} disabled={loading}>
              <Search className="size-4" /> {loading ? "Analyzing…" : "Search & analyze"}
            </Button>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Try one of these</p>
              <div className="mt-2 flex flex-col gap-2">
                {EXAMPLES.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setQuestion(e);
                      void run(e);
                    }}
                    className="rounded-lg border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 lg:col-span-3">
          <div className="surface-card flex flex-wrap items-center gap-2 p-4 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-ai/30 bg-ai-surface text-ai">
              AI suggestion
            </Badge>
            <Badge variant="outline">User-provided information</Badge>
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
              Verified external information
            </Badge>
            <span>
              This assistant does not browse the web, so results are AI-generated suggestions only.
            </span>
          </div>

          {loading ? <AiLoadingCard label="Researching your question…" /> : null}

          {!loading && answer ? (
            <AiResponseCard
              title={asked}
              content={answer}
              onChange={setAnswer}
              onRegenerate={() => run(asked)}
              onSave={() => toast.success("Saved to this research session")}
              badgeLabel="AI Suggestion"
              footer="No live sources were retrieved. Verify figures, regulations and vendor claims against authoritative sources."
            />
          ) : null}

          {!loading && !answer ? (
            <div className="surface-card gradient-ai flex flex-col items-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-ai/10 text-ai">
                <BookOpen className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">Ask your first question</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Pick a category and ask anything about planning your event. You'll get key findings,
                recommendations, trade-offs and follow-up questions.
              </p>
              <Sparkles className="mt-4 size-4 text-ai/60" />
            </div>
          ) : null}

          <ResponsibleAiNotice />
        </div>
      </div>
    </AppShell>
  );
}
