/**
 * DEMONSTRATION DATA ONLY.
 * The notebooks, documents, authors and excerpts below are fictional and are
 * used purely to populate the interface before a local AI backend exists.
 * Nothing here should be treated as a real scientific publication.
 */

export type SourceKind = "pdf" | "txt" | "docx" | "csv";

export interface Source {
  id: string;
  title: string;
  fileName: string;
  author: string;
  year: number;
  pages: number;
  kind: SourceKind;
  addedAt: string;
  excerpt: string;
  /** Mock page-by-page text used by the source viewer. */
  pageText: string[];
}

export interface CitationRef {
  id: string;
  sourceId: string;
  page: number;
  excerpt: string;
}

export type AnswerBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "math"; text: string; caption?: string };

export interface ResearchEntry {
  id: string;
  question: string;
  scopeLabel: string;
  askedAt: string;
  blocks: AnswerBlock[];
  citations: CitationRef[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  description: string;
  updatedLabel: string;
  sources: Source[];
  history: ResearchEntry[];
  notes: Note[];
}

const page = (title: string, n: number) =>
  Array.from({ length: n }, (_, i) =>
    [
      `${title} — page ${i + 1}`,
      "",
      "This is demonstration text standing in for the real document body. Once a local document pipeline is connected, the original page content will be rendered here with layout, figures and tables preserved.",
      "",
      "Measured samples were prepared under controlled conditions and evaluated using the procedure described in the preceding section. Values reported below are illustrative placeholders rather than experimental results.",
      "",
      "The discussion continues on the following page, where the observed trends are related back to the proposed mechanism and compared with the reference series.",
    ].join("\n"),
  );

const cqdSources: Source[] = [
  {
    id: "s1",
    title: "Carbon Quantum Dots for Corrosion Inhibition",
    fileName: "Carbon Quantum Dots for Corrosion Inhibition.pdf",
    author: "Demo Author A (sample)",
    year: 2025,
    pages: 18,
    kind: "pdf",
    addedAt: "2026-08-21",
    excerpt:
      "Adsorption of the dot surface functional groups onto the metal interface is proposed as the dominant protective mechanism in the demonstration dataset.",
    pageText: page("Carbon Quantum Dots for Corrosion Inhibition", 18),
  },
  {
    id: "s2",
    title: "Petcoke-Derived Carbon Quantum Dots",
    fileName: "Petcoke-Derived Carbon Quantum Dots.pdf",
    author: "Demo Author B (sample)",
    year: 2024,
    pages: 24,
    kind: "pdf",
    addedAt: "2026-08-23",
    excerpt:
      "A low-temperature synthesis route is described, yielding dots with a narrow size distribution in this illustrative example.",
    pageText: page("Petcoke-Derived Carbon Quantum Dots", 24),
  },
  {
    id: "s3",
    title: "Nanomaterial-Based Corrosion Inhibitors",
    fileName: "Nanomaterial-Based Corrosion Inhibitors.pdf",
    author: "Demo Author C (sample)",
    year: 2023,
    pages: 31,
    kind: "pdf",
    addedAt: "2026-08-25",
    excerpt:
      "A comparative overview of inhibitor families, presented here as placeholder content for interface demonstration.",
    pageText: page("Nanomaterial-Based Corrosion Inhibitors", 31),
  },
  {
    id: "s4",
    title: "Experimental Study of CQD Inhibitors",
    fileName: "Experimental Study of CQD Inhibitors.pdf",
    author: "Demo Author D (sample)",
    year: 2025,
    pages: 14,
    kind: "pdf",
    addedAt: "2026-08-28",
    excerpt:
      "Weight-loss and electrochemical measurements are reported side by side in this fictional study summary.",
    pageText: page("Experimental Study of CQD Inhibitors", 14),
  },
  {
    id: "s5",
    title: "Electrochemical Behavior of Aluminum Alloys",
    fileName: "Electrochemical Behavior of Aluminum Alloys.pdf",
    author: "Demo Author E (sample)",
    year: 2022,
    pages: 27,
    kind: "pdf",
    addedAt: "2026-09-01",
    excerpt:
      "Polarization behaviour across alloy series is discussed; all figures shown are demonstration placeholders.",
    pageText: page("Electrochemical Behavior of Aluminum Alloys", 27),
  },
];

const seededEntry: ResearchEntry = {
  id: "e1",
  question: "How do carbon quantum dots influence corrosion inhibition?",
  scopeLabel: "All sources",
  askedAt: "Today, 09:24",
  blocks: [
    { type: "heading", text: "Research finding" },
    {
      type: "paragraph",
      text: "Across the demonstration set, carbon quantum dots are described as acting through several complementary mechanisms rather than a single protective effect [1]. The dominant account is interfacial adsorption, with secondary contributions from barrier-film formation and localized surface passivation [2].",
    },
    {
      type: "bullets",
      items: [
        "Surface adsorption of oxygen- and nitrogen-containing functional groups at active metal sites [1]",
        "Formation of a thin physical barrier that limits electrolyte access [3]",
        "Suppression of localized pitting on aluminium substrates [5]",
      ],
    },
    { type: "heading", text: "Reported inhibition efficiency" },
    {
      type: "table",
      headers: ["Source", "Concentration", "Reported efficiency", "Method"],
      rows: [
        ["Demo Author A", "50 ppm", "88%", "Weight loss"],
        ["Demo Author D", "100 ppm", "93%", "EIS"],
        ["Demo Author E", "100 ppm", "81%", "Polarization"],
      ],
    },
    {
      type: "math",
      text: "IE (%) = (CR₀ − CR) / CR₀ × 100",
      caption: "Inhibition efficiency as defined in the demonstration sources.",
    },
    { type: "heading", text: "Caveats" },
    {
      type: "numbered",
      items: [
        "Measurement conditions differ between the sources, so efficiencies are not directly comparable [4].",
        "Long-term stability of the protective layer is not addressed in this set.",
        "All content shown here is demonstration data, not real published findings.",
      ],
    },
  ],
  citations: [
    {
      id: "c1",
      sourceId: "s1",
      page: 4,
      excerpt:
        "Adsorption at the metal interface is identified as the leading protective mechanism in this sample document.",
    },
    {
      id: "c2",
      sourceId: "s2",
      page: 7,
      excerpt:
        "Barrier-film behaviour is described following deposition of the dot layer in this sample document.",
    },
    {
      id: "c3",
      sourceId: "s3",
      page: 11,
      excerpt:
        "Comparative table of inhibitor families, included here as placeholder content.",
    },
    {
      id: "c4",
      sourceId: "s4",
      page: 6,
      excerpt:
        "Test conditions vary between the reported series, limiting direct comparison.",
    },
    {
      id: "c5",
      sourceId: "s5",
      page: 13,
      excerpt:
        "Pitting suppression on aluminium substrates is noted in this demonstration excerpt.",
    },
  ],
};

export const mockNotebooks: Notebook[] = [
  {
    id: "nb1",
    name: "Carbon Quantum Dots — Corrosion Inhibition",
    icon: "🔬",
    description:
      "Demonstration notebook exploring how carbon quantum dots are described as corrosion inhibitors.",
    updatedLabel: "Updated today",
    sources: cqdSources,
    history: [seededEntry],
    notes: [
      {
        id: "n1",
        title: "Working hypothesis",
        body: "Adsorption appears to be the shared mechanism across the demo set.\n\n- Check whether efficiency scales with concentration\n- Note that test conditions differ between documents\n- Remember: all current content is demonstration data",
        updatedAt: "Today",
      },
    ],
  },
  {
    id: "nb2",
    name: "Chemistry Literature",
    icon: "🧪",
    description: "General reading queue for the demonstration workspace.",
    updatedLabel: "Updated 3 days ago",
    sources: cqdSources.slice(0, 2).map((s, i) => ({ ...s, id: `nb2-${i}` })),
    history: [],
    notes: [],
  },
  {
    id: "nb3",
    name: "Materials Research",
    icon: "⚙️",
    description: "Placeholder notebook for materials-side references.",
    updatedLabel: "Updated last week",
    sources: cqdSources.slice(2, 4).map((s, i) => ({ ...s, id: `nb3-${i}` })),
    history: [],
    notes: [],
  },
];

export const researchActions = [
  { id: "summarize", label: "Summarize", prompt: "Summarize the selected sources." },
  { id: "compare", label: "Compare sources", prompt: "Compare the selected sources." },
  {
    id: "disagreements",
    label: "Find disagreements",
    prompt: "Where do the selected sources disagree?",
  },
  {
    id: "common",
    label: "Find common findings",
    prompt: "What findings are shared across the selected sources?",
  },
  {
    id: "methodology",
    label: "Extract methodology",
    prompt: "Extract the methodology used in the selected sources.",
  },
  {
    id: "results",
    label: "Extract key results",
    prompt: "Extract the key results from the selected sources.",
  },
  {
    id: "gaps",
    label: "Identify research gaps",
    prompt: "Identify research gaps across the selected sources.",
  },
] as const;
