"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { common, createLowlight } from "lowlight";
import { useRef, useState } from "react";
import { CalloutExtension } from "@/components/editor/CalloutExtension";

const lowlight = createLowlight(common);

export function RichTextEditor({
  initialContent,
  onChange,
  onUploadImage,
}: {
  initialContent: Record<string, unknown>;
  onChange: (doc: Record<string, unknown>) => void;
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl border-2 border-[#eadfd5] max-w-full h-auto my-3",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#8e4b49] underline font-bold",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-2xl overflow-hidden my-3",
        },
      }),
      CalloutExtension,
    ],
    content: initialContent,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] p-4 focus:outline-none font-[family-name:var(--font-patrick-hand)] text-lg leading-relaxed text-[#4a3e3d]",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[300px] rounded-2xl border-2 border-[#eadfd5] bg-white p-4 text-[#8d6e63]">
        Menyiapkan editor materi...
      </div>
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage || !editor) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addLink() {
    if (!editor) return;
    const url = window.prompt("Masukkan URL tautan:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  function addYoutube() {
    if (!editor) return;
    const url = window.prompt("Masukkan URL video YouTube:");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  function addCallout() {
    if (!editor) return;
    const title = window.prompt("Judul kotak catatan:", "Catatan Kunci") ?? "Catatan Kunci";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "callout",
        attrs: { title },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Tulis ringkasan atau tips penting di sini." }],
          },
        ],
      })
      .run();
  }

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded-xl font-[family-name:var(--font-mali)] text-xs font-bold min-h-[36px] border transition-colors ${
      active
        ? "bg-[#FFAAA6] text-[#4a3e3d] border-[#8e4b49]"
        : "bg-white text-[#534342] border-[#eadfd5] hover:bg-[#f6f3ee]"
    }`;

  return (
    <div className="rounded-2xl border-2 border-[#eadfd5] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-[#f6f3ee] border-b border-[#eadfd5]">
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          List
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Kode
        </button>
        <button type="button" className={btnClass(false)} onClick={addCallout}>
          Callout
        </button>
        <button type="button" className={btnClass(editor.isActive("link"))} onClick={addLink}>
          Link
        </button>
        <button type="button" className={btnClass(false)} onClick={addYoutube}>
          YouTube
        </button>
        {onUploadImage && (
          <>
            <button
              type="button"
              className={btnClass(false)}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Mengunggah..." : "Gambar"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
