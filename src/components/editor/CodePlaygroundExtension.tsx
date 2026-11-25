import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { InlineCodePlayground } from "@/components/playground/InlineCodePlayground";

function CodePlaygroundNodeView({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  return (
    <NodeViewWrapper contentEditable={false}>
      <InlineCodePlayground
        title={String(node.attrs.title ?? "Latihan Koding Interaktif")}
        initialHtml={String(node.attrs.html ?? "")}
        initialCss={String(node.attrs.css ?? "")}
        initialJs={String(node.attrs.js ?? "")}
        onUpdateAttrs={(next) => updateAttributes(next)}
        onDeleteBlock={deleteNode}
      />
    </NodeViewWrapper>
  );
}

export const CodePlaygroundExtension = Node.create({
  name: "codePlayground",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      title: {
        default: "Latihan Koding Interaktif",
      },
      html: {
        default:
          '<div class="kartu">\n  <h3>Belajar Yuk!</h3>\n  <button id="btn">Klik Aku</button>\n  <p id="out">Belum diklik</p>\n</div>',
      },
      css: {
        default:
          '.kartu { background: #fff2f1; border: 2px dashed #FFAAA6; border-radius: 16px; padding: 16px; text-align: center; font-family: sans-serif; }\nbutton { background: #C8B6FF; border: none; border-radius: 999px; padding: 8px 16px; font-weight: bold; cursor: pointer; }',
      },
      js: {
        default:
          'document.getElementById("btn").addEventListener("click", function () {\n  document.getElementById("out").textContent = "Berhasil diklik!";\n  console.log("Tombol berhasil diklik");\n});',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="code-playground"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "code-playground" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodePlaygroundNodeView);
  },
});
