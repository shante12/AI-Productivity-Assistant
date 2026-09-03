import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

export function AiBadge({ label = "AI Generated", className }: { label?: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-ai/30 bg-ai-surface text-ai text-[11px] font-medium tracking-wide",
        className,
      )}
    >
      <Sparkles className="size-3" /> {label}
    </Badge>
  );
}

export function AiLoadingCard({ label = "Generating…" }: { label?: string }) {
  return (
    <div className="surface-card gradient-ai animate-in fade-in p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-ai">
        <Sparkles className="size-4 animate-pulse" /> {label}
      </div>
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-10/12" />
      </div>
    </div>
  );
}

type Props = {
  title: string;
  content: string;
  onChange?: (next: string) => void;
  onRegenerate?: () => void;
  onSave?: (content: string) => void;
  saveLabel?: string;
  footer?: React.ReactNode;
  badgeLabel?: string;
};

export function AiResponseCard({
  title,
  content,
  onChange,
  onRegenerate,
  onSave,
  saveLabel = "Save",
  footer,
  badgeLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(content);
    setEditing(false);
    setFeedback(null);
  }, [content]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked copying. Select the text and copy manually.");
    }
  };

  return (
    <section className="surface-card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-ai-surface/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          <AiBadge label={badgeLabel} />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button size="sm" variant="ghost" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="hidden sm:inline">Copy</span>
          </Button>
          {onChange ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (editing) {
                  onChange(draft);
                  toast.success("Changes applied");
                }
                setEditing(!editing);
              }}
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">{editing ? "Done" : "Edit"}</span>
            </Button>
          ) : null}
          {onRegenerate ? (
            <Button size="sm" variant="ghost" onClick={onRegenerate}>
              <RefreshCw className="size-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          ) : null}
          {onSave ? (
            <Button size="sm" variant="secondary" onClick={() => onSave(content)}>
              <Save className="size-4" /> {saveLabel}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="px-4 py-4 sm:px-5">
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-72 font-mono text-xs leading-relaxed"
          />
        ) : (
          <Markdown content={content} />
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3 sm:px-5">
        <p className="max-w-xl text-xs text-muted-foreground">
          {footer ?? "AI-generated content should be reviewed for accuracy and personalization before use."}
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={feedback === "up" ? "secondary" : "ghost"}
            onClick={() => {
              setFeedback("up");
              toast.success("Thanks — marked as helpful");
            }}
          >
            <ThumbsUp className="size-4" /> Helpful
          </Button>
          <Button
            size="sm"
            variant={feedback === "down" ? "secondary" : "ghost"}
            onClick={() => {
              setFeedback("down");
              toast("Noted — try Regenerate for a different take");
            }}
          >
            <ThumbsDown className="size-4" /> Not helpful
          </Button>
        </div>
      </footer>
    </section>
  );
}

export function ResponsibleAiNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="surface-card gradient-ai p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-ai" />
        <h4 className="font-display text-sm font-semibold">Responsible AI Notice</h4>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        EventFlow AI provides suggestions and generated content to assist with event planning.
        AI-generated information may contain errors, omissions, or outdated information. Verify
        important details, prices, availability, legal requirements, safety information, and vendor
        credentials independently before making decisions.
      </p>
      {!compact ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          EventFlow AI does not replace professional, legal, financial, safety, or other expert
          advice, and accuracy is never guaranteed.
        </p>
      ) : null}
    </aside>
  );
}
