# Research Canvas

Build a Local Research Assistant — NotebookLM-Inspired UI

Create a polished, desktop-first research assistant web application designed for serious academic research.

The application will eventually connect to a local Ollama server running Qwen3 8B, so structure the frontend cleanly and modularly so that a local AI backend can be connected later.

1. Core product concept

This is NOT a generic AI chatbot.

The product is a research notebook/workspace where a user can:

Create research notebooks/projects.

Upload and organize academic papers and other documents.

View all sources belonging to a notebook.

Ask questions about one source, selected sources, or the entire notebook.

Compare multiple sources.

Summarize sources.

Extract important findings.

Eventually receive answers with precise citations to the original documents.

Keep research conversations and notes associated with each notebook.

The overall experience should feel closer to NotebookLM, a digital research notebook, or a modern academic literature workspace than ChatGPT.

Do not make the application look like a standard messaging application.

2. Overall layout

Use a three-part desktop layout:

┌──────────────────────────────────────────────────────────────────────┐
│ Logo / Notebook name                              Settings / Profile │
├────────────────┬─────────────────────────────────────────────────────┤
│                │                                                     │
│  NOTEBOOK      │                RESEARCH WORKSPACE                   │
│                │                                                     │
│  Sources       │  Research question / search                        │
│                │                                                     │
│  📄 Paper 1    │  AI research response                              │
│  📄 Paper 2    │                                                     │
│  📄 Paper 3    │  Citations / source references                     │
│                │                                                     │
│  + Add sources │                                                     │
│                │                                                     │
├────────────────┴─────────────────────────────────────────────────────┤
│ Optional contextual controls / status                               │
└──────────────────────────────────────────────────────────────────────┘


Left sidebar

The left sidebar is the primary source-management area.

It should contain:

Notebook section

Current notebook name.

Notebook icon.

Button to create a new notebook.

Dropdown or menu to switch between notebooks.

Example:

RESEARCH

🔬 Carbon Quantum Dots
   12 sources

+ New notebook


Sources section

Display uploaded sources in a clean vertical list.

Each source should show:

PDF/document icon.

Filename/title.

Optional author.

Optional page count.

Selection checkbox.

More-options button.

Example:

SOURCES

☐ 📄 Smith 2025 - CQD Review
☐ 📄 Corrosion Inhibition Study
☐ 📄 Carbon Quantum Dots.pdf
☐ 📄 Experimental Results.pdf


Selected sources should have a subtle visual state.

Include:

+ Add sources

This should be visually prominent but not oversized.

3. Main research workspace

The center of the application should be the primary workspace.

At the top:

Notebook header

Show:

Notebook title.

Short description.

Number of sources.

Last updated date.

Example:

Carbon Quantum Dot Corrosion Research

12 sources · Updated today


Then provide research controls.

4. Research question input

Create a large, elegant research input rather than a conventional chat input.

Placeholder:

"Ask a question about your sources..."

The input should support long research questions.

Include controls for:

Selected sources / All sources.

Search or submit button.

Optional attachment button.

Optional microphone button, but do not implement voice functionality yet.

Example:

┌─────────────────────────────────────────────────────────────┐
│ Ask a question about your sources...                       │
│                                                             │
│                                                             │
│ Sources: All sources                         [Ask →]        │
└─────────────────────────────────────────────────────────────┘


Make this feel like a research query interface, not a Discord/ChatGPT message box.

5. Research answers

When an answer is generated, display it as an academic research response.

Do NOT use large rounded chat bubbles.

Instead, use a clean document-like layout.

Example:

Research finding

Carbon quantum dots appear to influence corrosion
inhibition through several mechanisms...

[1] [2] [3]

────────────────────────────────────

Sources

[1] Smith et al., 2025 — p. 4
[2] Ahmed et al., 2024 — p. 7
[3] Chen et al., 2023 — p. 11


Answers should support:

Headings.

Paragraphs.

Bullet points.

Numbered lists.

Tables.

Mathematical notation where appropriate.

Inline citations.

Source references.

6. Citation system

Design the frontend around a future citation system.

Citations should look like:

...corrosion resistance increased significantly [1].


The [1] should be clickable.

Clicking a citation should eventually open a source viewer showing:

Document title.

Page number.

Relevant excerpt.

Citation number.

Source metadata.

Create the UI components for this now using mock data.

Example source panel:

SOURCE 1

Carbon Quantum Dots for Corrosion Inhibition

Page 7

"Relevant excerpt from the source..."

Open source →


Do not implement real document retrieval yet.

7. Source viewer

Create a source/document viewing experience.

When a user clicks a source:

Open a dedicated source view or large modal/panel.

Show the document title.

Show document metadata.

Show page navigation controls.

Show a large document preview area.

Highlight the cited/relevant passage when possible using mock data.

The future system will replace the mock document with an actual PDF viewer.

The source viewer should feel integrated into the research workspace rather than like a completely separate website.

8. Research tabs

Add a small navigation system near the top of the workspace:

Research     Sources     Notes


Research

Contains:

Questions.

AI responses.

Citations.

Research history.

Sources

Contains:

All uploaded documents.

Search/filter controls.

Source metadata.

Source management.

Notes

Create a research-notes workspace where the user can manually write notes.

Notes should support:

Titles.

Paragraphs.

Bullet points.

Basic formatting.

Saving automatically in the UI.

Do not implement cloud synchronization yet.

9. Research actions

Add a toolbar with useful research actions.

Examples:

Summarize
Compare sources
Find disagreements
Find common findings
Extract methodology
Extract key results
Identify research gaps


These can use mock interactions for now.

The buttons should be designed so they can later send prompts to the local AI backend.

10. Source selection

The user must be able to control which sources the AI uses.

Support:

All sources

● All sources


Selected sources

○ Selected sources (3)


Current source

When viewing a document:

○ This source


Make this selection state obvious before submitting a research question.

11. Notebook management

Create a notebook switcher.

The user should be able to have multiple independent research projects.

Example:

MY NOTEBOOKS

🔬 Carbon Quantum Dots
   12 sources

🧪 Chemistry Literature
   27 sources

⚙ Materials Research
   8 sources

+ New notebook


Each notebook should have its own:

Sources.

Research history.

Notes.

Settings.

Use local mock data for now.

12. Search

Add source searching.

The source list should have:

🔍 Search sources...


Allow filtering by:

Filename/title.

Author.

Type.

Date.

This is frontend-only for now.

13. Upload interface

Create a polished upload dialog.

When the user clicks:

+ Add sources

show:

Add sources

┌──────────────────────────────────────┐
│                                      │
│       Drag & drop files here         │
│                                      │
│       or                             │
│                                      │
│       Browse files                   │
│                                      │
└──────────────────────────────────────┘

Supported:
PDF, TXT, DOCX, CSV

Cancel                         Add


Use mock uploaded files after selection.

Do not build actual document processing yet.

14. Design language

The design should feel:

Academic.

Professional.

Minimal.

Modern.

Calm.

Information-dense without feeling cluttered.

Avoid:

Huge gradients.

Excessive glassmorphism.

Neon colors.

Gaming aesthetics.

Excessive animations.

Giant chatbot bubbles.

Generic AI landing-page aesthetics.

This should look like a serious research application.

Use subtle borders, restrained shadows, clean typography, and strong hierarchy.

15. Color system

Use a restrained neutral interface.

Prefer:

White/off-white main surfaces.

Very light gray secondary surfaces.

Dark text.

One restrained accent color.

Subtle borders.

Support both:

Light mode

Clean paper-like research environment.

Dark mode

Dark gray/charcoal interface with comfortable contrast.

Do not use pure black backgrounds everywhere.

16. Typography

Use a highly readable modern sans-serif font.

Prioritize:

Excellent readability.

Clear hierarchy.

Comfortable line height.

Distinct headings.

Research-document readability.

AI answers should be comfortable to read for long periods.

17. Responsive behavior

The primary target is a laptop/desktop.

However, make it responsive.

On smaller screens:

Collapse the source sidebar into a drawer.

Keep the research workspace usable.

Do not simply shrink every element.

18. Interactions

Add polished but restrained interactions:

Hover states.

Selected-source states.

Active notebook state.

Loading state for AI answers.

Upload progress mockup.

Citation hover preview.

Source preview.

Notebook switching.

Search filtering.

Empty states.

Use realistic mock data so the application looks functional even before the backend exists.

19. Mock research data

Populate the initial interface with a fictional research notebook:

Notebook:

"Carbon Quantum Dots — Corrosion Inhibition"

Sources:

"Carbon Quantum Dots for Corrosion Inhibition.pdf"

"Petcoke-Derived Carbon Quantum Dots.pdf"

"Nanomaterial-Based Corrosion Inhibitors.pdf"

"Experimental Study of CQD Inhibitors.pdf"

"Electrochemical Behavior of Aluminum Alloys.pdf"

Create realistic-looking metadata and mock research answers.

Do not fabricate real scientific citations or present the mock papers as real publications. Clearly treat the initial documents and content as demonstration data.

20. Architecture requirements

Keep the frontend modular.

Create reusable components for:

Sidebar.

NotebookSwitcher.

SourceList.

SourceCard.

SourceSelector.

ResearchInput.

ResearchAnswer.

Citation.

CitationPanel.

SourceViewer.

NotesEditor.

ResearchActions.

UploadDialog.

Settings.

Keep mock data separate from UI components.

Create clear service/API abstraction points so the mock AI implementation can later be replaced with a local Ollama connection.

Do NOT hard-code the future Ollama implementation yet.

21. Backend restriction for this iteration

IMPORTANT:

Do NOT build the actual AI backend yet.

Do NOT add:

Cloud AI APIs.

OpenAI API.

Anthropic API.

Gemini API.

Supabase AI.

LangChain.

Vector databases.

Embedding models.

RAG pipelines.

PDF parsing backend.

Authentication systems.

For this iteration, use mock data and frontend functionality only.

The eventual AI provider will be:

Ollama → Qwen3 8B running locally on the user's Windows laptop.

Design the application so that this can be connected later without rebuilding the UI.

22. Local-first requirement

The long-term application is intended to operate primarily on the user's own computer.

The UI should therefore not assume that documents or research conversations are sent to a cloud AI service.

Do not add unnecessary cloud dependencies.

23. Overall UX goal

The final interface should make the user feel like they opened a digital research notebook, not an AI chat website.

The primary mental model should be:

Notebook
  ↓
Sources
  ↓
Research questions
  ↓
Evidence
  ↓
Citations
  ↓
Notes


rather than:

User
  ↓
Chatbot
  ↓
Message
  ↓
Message
  ↓
Message


Prioritize the research workflow above everything else.

Build the complete frontend with polished mock interactions and realistic demonstration data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/835e8c90-9260-430a-a7f6-a9c982b742e1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
