import { BookOpen, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "./Settings";
import { useWorkspace } from "@/state/workspace";

export function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { notebook } = useWorkspace();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 lg:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open sources"
      >
        <PanelLeft className="size-4" />
      </Button>
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Marginalia</span>
      </div>
      <span className="hidden h-4 w-px bg-border sm:block" />
      <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
        {notebook.name}
      </p>
      <div className="ml-auto flex items-center gap-1">
        <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground md:flex">
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          Local model not connected
        </span>
        <Settings />
        <Avatar className="size-7">
          <AvatarFallback className="text-[11px]">RN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
