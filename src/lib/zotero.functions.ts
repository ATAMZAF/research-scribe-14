/**
 * Zotero Web API server functions.
 *
 * Credentials are supplied by the user (stored on their device) and proxied
 * here so the API key never crosses the browser's origin boundary in a URL.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credsSchema = z.object({
  libraryType: z.enum(["user", "group"]),
  libraryId: z.string().min(1),
  apiKey: z.string().min(1),
});

const itemsSchema = credsSchema.extend({
  collectionKey: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type ZoteroCollection = { key: string; name: string; numItems: number };

export type ZoteroReference = {
  key: string;
  title: string;
  author: string;
  year: number;
  itemType: string;
  abstract: string;
  publication: string;
  hasPdf: boolean;
  pdfTitle: string | null;
  url: string;
};

const base = "https://api.zotero.org";

async function zoteroFetch(creds: z.infer<typeof credsSchema>, path: string) {
  const prefix = creds.libraryType === "user" ? "users" : "groups";
  const res = await fetch(`${base}/${prefix}/${creds.libraryId}${path}`, {
    headers: {
      "Zotero-API-Version": "3",
      "Zotero-API-Key": creds.apiKey,
    },
  });
  return res;
}

function errorFor(status: number) {
  if (status === 403) return "Zotero rejected these credentials. Check the API key and library ID.";
  if (status === 404) return "That Zotero library could not be found.";
  if (status === 429) return "Zotero is rate limiting requests — try again shortly.";
  return "Could not reach Zotero right now.";
}

export const fetchZoteroCollections = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => credsSchema.parse(data))
  .handler(async ({ data }) => {
    const res = await zoteroFetch(data, "/collections?limit=100");
    if (!res.ok) return { error: errorFor(res.status), collections: [] as ZoteroCollection[] };
    const raw = (await res.json()) as {
      key: string;
      data: { name: string };
      meta?: { numItems?: number };
    }[];
    return {
      error: null as string | null,
      collections: raw.map((c) => ({
        key: c.key,
        name: c.data.name,
        numItems: c.meta?.numItems ?? 0,
      })),
    };
  });

export const fetchZoteroItems = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => itemsSchema.parse(data))
  .handler(async ({ data }) => {
    const limit = data.limit ?? 50;
    const path = data.collectionKey
      ? `/collections/${data.collectionKey}/items/top?limit=${limit}`
      : `/items/top?limit=${limit}`;
    const res = await zoteroFetch(data, path);
    if (!res.ok) return { error: errorFor(res.status), items: [] as ZoteroReference[] };

    type RawItem = {
      key: string;
      data: {
        title?: string;
        creators?: { lastName?: string; name?: string }[];
        date?: string;
        itemType?: string;
        abstractNote?: string;
        publicationTitle?: string;
        url?: string;
      };
      links?: { attachment?: { attachmentType?: string; href?: string; title?: string } };
    };

    const raw = (await res.json()) as RawItem[];
    const items: ZoteroReference[] = raw
      .filter((i) => i.data.itemType !== "attachment" && i.data.itemType !== "note")
      .map((i) => {
        const creators = i.data.creators ?? [];
        const names = creators.map((c) => c.lastName || c.name || "").filter(Boolean);
        const author =
          names.length === 0
            ? "Unknown author"
            : names.length === 1
              ? names[0]!
              : names.length === 2
                ? `${names[0]} & ${names[1]}`
                : `${names[0]} et al.`;
        const yearMatch = /\d{4}/.exec(i.data.date ?? "");
        const attachment = i.links?.attachment;
        return {
          key: i.key,
          title: i.data.title ?? "Untitled item",
          author,
          year: yearMatch ? Number(yearMatch[0]) : 0,
          itemType: i.data.itemType ?? "document",
          abstract: i.data.abstractNote ?? "",
          publication: i.data.publicationTitle ?? "",
          hasPdf: attachment?.attachmentType === "application/pdf",
          pdfTitle: attachment?.title ?? null,
          url: i.data.url ?? "",
        };
      });

    return { error: null as string | null, items };
  });

/**
 * Locate a top-level item's PDF attachment and download the file itself.
 * Returned as base64 so the browser can extract text and render the document.
 */
export const fetchZoteroPdf = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => credsSchema.extend({ itemKey: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const childRes = await zoteroFetch(data, `/items/${data.itemKey}/children`);
    if (!childRes.ok)
      return {
        error: errorFor(childRes.status),
        base64: null as string | null,
        fileName: null as string | null,
      };

    const children = (await childRes.json()) as {
      key: string;
      data: {
        itemType?: string;
        contentType?: string;
        filename?: string;
        title?: string;
        linkMode?: string;
      };
    }[];

    const pdf = children.find(
      (c) => c.data.itemType === "attachment" && c.data.contentType === "application/pdf",
    );
    if (!pdf)
      return {
        error: "No PDF attachment is stored in Zotero for this item.",
        base64: null,
        fileName: null,
      };

    const fileRes = await zoteroFetch(data, `/items/${pdf.key}/file`);
    if (!fileRes.ok) return { error: errorFor(fileRes.status), base64: null, fileName: null };

    const buffer = new Uint8Array(await fileRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buffer.length; i += 8192) {
      binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
    }

    return {
      error: null as string | null,
      base64: btoa(binary),
      fileName: pdf.data.filename ?? pdf.data.title ?? `${data.itemKey}.pdf`,
    };
  });
