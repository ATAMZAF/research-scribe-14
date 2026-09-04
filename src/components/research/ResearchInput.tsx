import { useState } from "react";
import { ArrowRight, Mic, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceSelector } from "./SourceSelector";
import { useWorkspace } from "@/state/workspace";

export function ResearchInput() {
  const { ask, pendingQuestion } = useWorkspace();
  const [value, setValue] = useState("");
  const busy = pendingQuestion !== null;

  const submit = () => {
    const q = value.trim();
    if (!q || busy) return;
    setValue("");
    void ask(q);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs focus-within:border-primary/50">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={3}
        placeholder="Ask a question about your sources..."
        className="min-h-24 w-full resize-y bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
        <SourceSelector />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Attach a file">
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach to question</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled
                aria-label="Dictate question"
              >
                <Mic className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice input — coming later</TooltipContent>
          </Tooltip>
          <Button onClick={submit} disabled={!value.trim() || busy} className="ml-1">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Ask
            {!busy && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
