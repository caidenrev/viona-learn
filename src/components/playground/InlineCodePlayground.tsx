"use client";

import { useEffect, useId, useState } from "react";
import { CodeIcon } from "@/components/icons/CartoonIcons";
import { RibbonTag, SquishyButton } from "@/components/ui/PastelPrimitives";
import { buildPlaygroundSrcDoc } from "@/lib/playground-srcdoc";

export function InlineCodePlayground({
  title = "Latihan Koding Interaktif",
  initialHtml = '<div class="box">Halo! Coba ubah teks ini</div>',
  initialCss = ".box { padding: 14px; border-radius: 14px; background: #FFAAA6; color: #4a3e3d; font-family: sans-serif; font-weight: bold; text-align: center; }",
  initialJs = 'console.log("Playground siap!");',
  onUpdateAttrs,
  onDeleteBlock,
}: {
  title?: string;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onUpdateAttrs?: (attrs: {
    title: string;
    html: string;
    css: string;
    js: string;
  }) => void;
  onDeleteBlock?: () => void;
}) {
  const instanceId = useId();
  const [blockTitle, setBlockTitle] = useState(title);
  const [tab, setTab] = useState<"html" | "css" | "js">("html");
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [srcDoc, setSrcDoc] = useState(() =>
    buildPlaygroundSrcDoc(initialHtml, initialCss, initialJs, instanceId)
  );
  const [logs, setLogs] = useState<Array<{ level: string; text: string }>>([]);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (
        ev.data?.source === "viona-playground" &&
        ev.data?.instanceId === instanceId
      ) {
        setLogs((prev) => [
          ...prev.slice(-10),
          { level: String(ev.data.level), text: String(ev.data.text) },
        ]);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [instanceId]);

  function runCode() {
    setLogs([]);
    setSrcDoc(buildPlaygroundSrcDoc(html, css, js, instanceId));
  }

  function resetCode() {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
    setLogs([]);
    setSrcDoc(
      buildPlaygroundSrcDoc(initialHtml, initialCss, initialJs, instanceId)
    );
  }

  function handleCodeChange(nextValue: string) {
    const nextHtml = tab === "html" ? nextValue : html;
    const nextCss = tab === "css" ? nextValue : css;
    const nextJs = tab === "js" ? nextValue : js;
    if (tab === "html") setHtml(nextValue);
    if (tab === "css") setCss(nextValue);
    if (tab === "js") setJs(nextValue);
    onUpdateAttrs?.({
      title: blockTitle,
      html: nextHtml,
      css: nextCss,
      js: nextJs,
    });
  }

  const activeValue = tab === "html" ? html : tab === "css" ? css : js;

  return (
    <div className="my-5 rounded-3xl bg-[#faf7f2] border-2 border-dashed border-[#C8B6FF] p-4 sm:p-5 shadow-sm min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <RibbonTag color="lilac">
            <CodeIcon className="w-3.5 h-3.5" />
            <span>Code Playground</span>
          </RibbonTag>
          {onUpdateAttrs ? (
            <input
              type="text"
              value={blockTitle}
              onChange={(e) => {
                setBlockTitle(e.target.value);
                onUpdateAttrs({ title: e.target.value, html, css, js });
              }}
              aria-label="Judul Code Playground"
              className="min-w-0 w-full sm:w-auto sm:flex-1 min-h-[36px] rounded-xl bg-white border border-[#eadfd5] px-2.5 font-[family-name:var(--font-gaegu)] text-xl font-bold text-[#4a3e3d]"
            />
          ) : (
            <h4 className="font-[family-name:var(--font-gaegu)] text-xl font-bold text-[#4a3e3d] break-words">
              {blockTitle}
            </h4>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SquishyButton
            type="button"
            variant="primary"
            onClick={runCode}
            className="px-3.5 py-1.5 text-xs"
          >
            <span>Jalankan Kode</span>
          </SquishyButton>
          {!onUpdateAttrs && (
            <SquishyButton
              type="button"
              variant="outline"
              onClick={resetCode}
              className="px-3 py-1.5 text-xs"
            >
              <span>Reset</span>
            </SquishyButton>
          )}
          {onDeleteBlock && (
            <button
              type="button"
              onClick={onDeleteBlock}
              className="min-h-[36px] px-3 rounded-full bg-[#ffdad6] text-[#93000a] font-[family-name:var(--font-mali)] text-xs font-bold"
            >
              Hapus Blok
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        <div className="flex flex-col min-w-0">
          <div className="flex gap-1.5 mb-2">
            {(["html", "css", "js"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`min-h-[36px] px-3 rounded-full font-[family-name:var(--font-mali)] text-xs font-bold border ${
                  tab === t
                    ? "bg-[#C8B6FF] text-[#200d4e] border-[#645495]"
                    : "bg-white text-[#534342] border-[#eadfd5]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <textarea
            rows={7}
            spellCheck={false}
            aria-label={`Kode ${tab.toUpperCase()}`}
            value={activeValue}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full flex-1 rounded-2xl bg-[#31302d] text-[#f3f0eb] p-3 font-[family-name:var(--font-jetbrains-mono)] text-xs leading-relaxed focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#534342] pt-1">
            Hasil Langsung:
          </div>
          <iframe
            title={`Pratinjau ${blockTitle}`}
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className="w-full min-h-[240px] sm:min-h-[260px] rounded-2xl bg-white border border-[#eadfd5]"
          />
          {logs.length > 0 && (
            <div className="rounded-xl bg-[#31302d] text-[#f3f0eb] px-3 py-2 font-[family-name:var(--font-jetbrains-mono)] text-[11px] max-h-20 overflow-y-auto">
              {logs.map((item, i) => (
                <div key={i} className="break-words">
                  <span className="text-[#FFAAA6]">[{item.level}]</span> {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
