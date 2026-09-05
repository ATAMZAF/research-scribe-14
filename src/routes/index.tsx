import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/research/TopBar";
import { Sidebar } from "@/components/research/Sidebar";
import { ResearchPanel } from "@/components/research/ResearchPanel";
import { SourcesTab } from "@/components/research/SourcesTab";
import { NotesEditor } from "@/components/research/NotesEditor";
import { CitationPanel } from "@/components/research/CitationPanel";
import { SourceViewer } from "@/components/research/SourceViewer";
import { WorkspaceProvider, useWorkspace } from "@/state/workspace";

const title = "Marginalia — Local Research Notebook";
const description =
  "A local-first academic research workspace: organize sources, ask questions across a notebook, and keep cited findings and notes together.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <TooltipProvider delayDuration={200}>
      <WorkspaceProvider>
        <Workspace />
      </WorkspaceProvider>
    </TooltipProvider>
  );
}

function Workspace() {
  const { notebook, scopeLabel, activeCitation } = useWorkspace();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar onOpenSidebar={() => setDrawer(true)} />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-border lg:block xl:w-80">
          <Sidebar />
        </aside>

        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="w-80 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{notebook.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {notebook.description}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {notebook.sources.length} sources · {notebook.updatedLabel} · Scope: {scopeLabel}
            </p>

            <Tabs defaultValue="research" className="mt-6">
              <TabsList className="bg-surface-strong">
                <TabsTrigger value="research">Research</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="research" className="mt-5">
                <ResearchPanel />
              </TabsContent>
              <TabsContent value="sources" className="mt-5">
                <SourcesTab />
              </TabsContent>
              <TabsContent value="notes" className="mt-5 min-h-[28rem]">
                <NotesEditor />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {activeCitation && <CitationPanel />}
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
        <span>{scopeLabel} in scope</span>
        <span>Local-first · No cloud services connected</span>
      </footer>

      <SourceViewer />
    </div>
  );
}
