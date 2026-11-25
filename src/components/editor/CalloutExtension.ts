import { Node, mergeAttributes } from "@tiptap/core";

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      title: {
        default: "Catatan Kunci",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class:
          "my-4 rounded-2xl bg-[#FFF3B0]/70 border-2 border-dashed border-[#e2d38b] p-4",
      }),
      0,
    ];
  },
});
