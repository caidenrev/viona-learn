import type { ReactNode } from "react";

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
}

function renderTextWithMarks(node: TiptapNode, key: number): ReactNode {
  let content: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") {
      content = <strong>{content}</strong>;
    } else if (mark.type === "italic") {
      content = <em>{content}</em>;
    } else if (mark.type === "code") {
      content = (
        <code className="px-1.5 py-0.5 rounded bg-[#f0ede9] text-[#8e4b49] font-[family-name:var(--font-jetbrains-mono)] text-sm">
          {content}
        </code>
      );
    } else if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      content = (
        <a
          href={mark.attrs.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8e4b49] underline font-bold break-words"
        >
          {content}
        </a>
      );
    }
  }
  return <span key={key}>{content}</span>;
}

function toYoutubeEmbedUrl(src: string): string | null {
  try {
    const url = new URL(src);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (url.pathname.startsWith("/embed/")) return src;
    }
    return null;
  } catch {
    return null;
  }
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  const children = (node.content ?? []).map((child, idx) =>
    renderNode(child, idx)
  );

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "text":
      return renderTextWithMarks(node, key);
    case "paragraph":
      return (
        <p key={key} className="mb-3 text-[#4a3e3d] leading-relaxed break-words">
          {children.length > 0 ? children : <br />}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      if (level <= 2) {
        return (
          <h2
            key={key}
            className="mt-6 mb-3 font-[family-name:var(--font-gaegu)] text-2xl sm:text-3xl font-bold text-[#4a3e3d]"
          >
            {children}
          </h2>
        );
      }
      return (
        <h3
          key={key}
          className="mt-5 mb-2 font-[family-name:var(--font-gaegu)] text-xl sm:text-2xl font-bold text-[#645495]"
        >
          {children}
        </h3>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="mb-4 pl-6 list-disc space-y-1.5 text-[#4a3e3d]">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="mb-4 pl-6 list-decimal space-y-1.5 text-[#4a3e3d]">
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-4 border-l-4 border-[#FFAAA6] bg-[#fff2f1] px-4 py-3 rounded-r-2xl text-[#534342]"
        >
          {children}
        </blockquote>
      );
    case "callout": {
      const title =
        typeof node.attrs?.title === "string"
          ? node.attrs.title
          : "Catatan Kunci";
      return (
        <div
          key={key}
          className="my-4 rounded-2xl bg-[#FFF3B0]/75 border-2 border-dashed border-[#e2d38b] p-4"
        >
          <div className="font-[family-name:var(--font-mali)] text-sm font-bold text-[#4a3e3d] mb-1">
            {title}
          </div>
          <div className="text-[#534342]">{children}</div>
        </div>
      );
    }
    case "codeBlock": {
      const rawCode = (node.content ?? []).map((c) => c.text ?? "").join("");
      return (
        <pre
          key={key}
          className="my-4 rounded-2xl bg-[#31302d] text-[#f3f0eb] p-4 overflow-x-auto font-[family-name:var(--font-jetbrains-mono)] text-xs sm:text-sm leading-relaxed"
        >
          <code>{rawCode}</code>
        </pre>
      );
    }
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!src) return null;
      return (
        <img
          key={key}
          src={src}
          alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : "Ilustrasi materi"}
          className="my-4 rounded-2xl border-2 border-[#eadfd5] max-w-full h-auto"
        />
      );
    }
    case "youtube": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      const embed = toYoutubeEmbedUrl(src);
      if (!embed) return null;
      return (
        <div
          key={key}
          className="my-4 w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#eadfd5]"
        >
          <iframe
            src={embed}
            title="Video pembelajaran"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
    case "horizontalRule":
      return <hr key={key} className="my-5 border-dashed border-[#eadfd5]" />;
    default:
      return <div key={key}>{children}</div>;
  }
}

export function LessonRenderer({ contentJson }: { contentJson: unknown }) {
  const doc = (contentJson ?? { type: "doc", content: [] }) as TiptapNode;
  return (
    <div className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#4a3e3d]">
      {renderNode(doc, 0)}
    </div>
  );
}
