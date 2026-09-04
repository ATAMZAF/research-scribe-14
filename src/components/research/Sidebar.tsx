import { NotebookSwitcher } from "./NotebookSwitcher";
import { SourceList } from "./SourceList";

export function Sidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 bg-sidebar p-3">
      <div>
        <h2 className="mb-2 px-1 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Research
        </h2>
        <NotebookSwitcher />
      </div>
      <SourceList />
    </div>
  );
}
