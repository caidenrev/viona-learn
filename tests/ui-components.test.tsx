import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  WashiCard,
  TanyaHusbandButton,
  SquishyButton,
} from "@/components/ui/PastelPrimitives";
import { AppShell } from "@/components/layout/AppShell";
import { LessonRenderer } from "@/components/editor/LessonRenderer";
import { findEmojiViolations } from "@/lib/emoji-guard";

describe("Kawaii stationery UI primitives", () => {
  it("renders TanyaHusbandButton with dynamic encoded WhatsApp URL", () => {
    const html = renderToStaticMarkup(
      <TanyaHusbandButton
        phone="081234567890"
        courseTitle="React & State"
        moduleTitle="3.2 useEffect"
      />
    );
    expect(html).toContain("https://wa.me/6281234567890?text=");
    expect(html).toContain("Tanya Husband");
    expect(findEmojiViolations(html)).toEqual([]);
  });

  it("renders WashiCard and SquishyButton with zero emojis", () => {
    const html = renderToStaticMarkup(
      <WashiCard tapeColor="pink" title="MY NOTES!">
        <SquishyButton variant="primary">Simpan Catatan</SquishyButton>
      </WashiCard>
    );
    expect(html).toContain("MY NOTES!");
    expect(html).toContain("Simpan Catatan");
    expect(findEmojiViolations(html)).toEqual([]);
  });

  it("renders AppShell with responsive mobile bottom navigation", () => {
    const html = renderToStaticMarkup(
      <AppShell
        role="STUDENT"
        activePath="/workspace"
        streakDays={7}
        userName="Viona"
        avatarUrl="/stickers/hirono.png"
      >
        <div>Konten Utama</div>
      </AppShell>
    );
    expect(html).toContain('aria-label="Navigasi Mobile"');
    expect(html).toContain("/workspace");
    expect(html).toContain("/notes");
    expect(html).toContain("/playground");
    expect(html).toContain("/stats");
    expect(findEmojiViolations(html)).toEqual([]);
  });

  it("renders Tiptap LessonRenderer nodes including callout and codeBlock", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Siklus useEffect" }],
        },
        {
          type: "callout",
          attrs: { title: "Catatan Kunci" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Gunakan dependency array." }],
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "tsx" },
          content: [{ type: "text", text: "const [n, setN] = useState(0);" }],
        },
      ],
    };

    const html = renderToStaticMarkup(<LessonRenderer contentJson={doc} />);
    expect(html).toContain("Siklus useEffect");
    expect(html).toContain("Catatan Kunci");
    expect(html).toContain("const [n, setN] = useState(0);");
    expect(findEmojiViolations(html)).toEqual([]);
  });
});
