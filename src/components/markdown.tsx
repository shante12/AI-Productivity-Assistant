import { Fragment } from "react";

function inline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyBase}-${i}`} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>;
  });
}

/** Minimal, dependency-free markdown renderer for AI output. */
export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5 pl-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
            <span>{inline(item, `li-${blocks.length}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flush();
    if (!line.trim()) return;
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(
        <p
          key={`h-${idx}`}
          className={
            level <= 2
              ? "mt-4 mb-1 font-display text-base font-semibold text-foreground first:mt-0"
              : "mt-3 mb-1 text-sm font-semibold text-foreground first:mt-0"
          }
        >
          {inline(heading[2], `h-${idx}`)}
        </p>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${idx}`} className="my-2 text-sm leading-relaxed text-muted-foreground">
        {inline(line, `p-${idx}`)}
      </p>,
    );
  });
  flush();

  return <div className="max-w-none">{blocks}</div>;
}
