import { Fragment } from "react";
import type { AnswerBlock, ResearchEntry } from "@/data/mock";
import { Citation } from "./Citation";
import { useSourceLookup } from "@/state/workspace";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function useInline() {
  const lookup = useSourceLookup();
  return function Inline({ text, entry }: { text: string; entry: ResearchEntry }) {
    const parts = text.split(/(\[\d+\])/g);
    return (
      <>
        {parts.map((part, i) => {
          const m = /^\[(\d+)\]$/.exec(part);
          if (!m) return <Fragment key={i}>{part}</Fragment>;
          const idx = Number(m[1]);
          const citation = entry.citations[idx - 1];
          if (!citation) return <Fragment key={i}>{part}</Fragment>;
          return (
            <Citation
              key={i}
              index={idx}
              citation={citation}
              source={lookup[citation.sourceId]}
            />
          );
        })}
      </>
    );
  };
}

export function ResearchAnswer({ entry }: { entry: ResearchEntry }) {
  const Inline = useInline();
  const lookup = useSourceLookup();

  const renderBlock = (block: AnswerBlock, i: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h3 key={i} className="mt-6 mb-2 text-sm font-semibold tracking-tight first:mt-0">
            {block.text}
          </h3>
        );
      case "paragraph":
        return (
          <p key={i} className="mb-3 font-serif text-[17px] leading-[1.75] text-foreground/90">
            <Inline text={block.text} entry={entry} />
          </p>
        );
      case "bullets":
        return (
          <ul key={i} className="mb-3 space-y-1.5 pl-5">
            {block.items.map((it, j) => (
              <li key={j} className="list-disc font-serif text-[16px] leading-relaxed">
                <Inline text={it} entry={entry} />
              </li>
            ))}
          </ul>
        );
      case "numbered":
        return (
          <ol key={i} className="mb-3 space-y-1.5 pl-5">
            {block.items.map((it, j) => (
              <li key={j} className="list-decimal font-serif text-[16px] leading-relaxed">
                <Inline text={it} entry={entry} />
              </li>
            ))}
          </ol>
        );
      case "table":
        return (
          <div key={i} className="mb-4 overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface">
                  {block.headers.map((h) => (
                    <TableHead key={h} className="text-xs">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.rows.map((row, r) => (
                  <TableRow key={r}>
                    {row.map((cell, c) => (
                      <TableCell key={c} className="text-sm">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case "math":
        return (
          <figure key={i} className="mb-4 rounded-md border border-border bg-surface px-4 py-3">
            <p className="text-center font-mono text-sm">{block.text}</p>
            {block.caption && (
              <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
    }
  };

  return (
    <article className="border-b border-border pb-8">
      <header className="mb-4">
        <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
          {entry.askedAt} · {entry.scopeLabel}
        </p>
        <h2 className="mt-1.5 text-lg leading-snug font-semibold tracking-tight">
          {entry.question}
        </h2>
      </header>

      <div className="max-w-3xl">{entry.blocks.map(renderBlock)}</div>

      {entry.citations.length > 0 && (
        <section className="mt-6 max-w-3xl border-t border-border pt-4">
          <h4 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Sources
          </h4>
          <ol className="mt-2 space-y-1.5">
            {entry.citations.map((c, i) => {
              const src = lookup[c.sourceId];
              if (!src) return null;
              return (
                <li key={c.id} className="flex items-baseline gap-2 text-sm">
                  <Citation index={i + 1} citation={c} source={src} />
                  <span className="text-muted-foreground">
                    <span className="text-foreground">{src.author}</span>, {src.year} — {src.title}{" "}
                    · p. {c.page}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </article>
  );
}
