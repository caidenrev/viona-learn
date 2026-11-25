"use client";

import { useEffect, useState } from "react";
import { CodeIcon, SparkleIcon } from "@/components/icons/CartoonIcons";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

const STARTER_HTML = `<div class="kartu">
  <span class="badge">BELAJAR YUK!</span>
  <h2>Hitung Semangat Koding</h2>
  <p>Klik tombol di bawah untuk menambah skor:</p>
  <div id="angka" class="counter">0</div>
  <div class="row">
    <button id="minus">-</button>
    <button id="plus">+</button>
  </div>
</div>`;

const STARTER_CSS = `body {
  font-family: sans-serif;
  background: #fcf9f4;
  display: flex;
  justify-content: center;
  padding: 24px;
  color: #4a3e3d;
}
.kartu {
  background: #ffffff;
  border: 2px dashed #eadfd5;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  max-width: 300px;
  width: 100%;
}
.badge {
  background: #FFAAA6;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}
.counter {
  font-size: 36px;
  font-weight: bold;
  background: #FFF3B0;
  border-radius: 16px;
  padding: 12px;
  margin: 12px 0;
}
.row { display: flex; gap: 12px; justify-content: center; }
button {
  width: 44px; height: 44px; border-radius: 999px;
  border: 2px solid #4a3e3d; background: #C8B6FF;
  font-size: 18px; font-weight: bold; cursor: pointer;
}`;

const STARTER_JS = `let count = 0;
const el = document.getElementById("angka");
document.getElementById("plus").addEventListener("click", () => {
  count += 1;
  el.textContent = String(count);
  console.log("Tambah semangat:", count);
});
document.getElementById("minus").addEventListener("click", () => {
  count = Math.max(0, count - 1);
  el.textContent = String(count);
  console.log("Kurangi:", count);
});`;

function buildSrcDoc(html: string, css: string, js: string) {
  const safeJs = js.replace(/<\/script>/gi, "<\\/script>");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}</style>
</head>
<body>
${html}
<script>
(function() {
  const send = (level, args) => {
    window.parent.postMessage({ source: "viona-playground", level, text: args.map(String).join(" ") }, "*");
  };
  const origLog = console.log;
  console.log = (...args) => { send("LOG", args); origLog(...args); };
  window.onerror = (msg) => { send("ERROR", [msg]); };
  try {
    ${safeJs}
  } catch (err) {
    send("ERROR", [err && err.message ? err.message : String(err)]);
  }
})();
</script>
</body>
</html>`;
}

export function CodePlaygroundClient() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [html, setHtml] = useState(STARTER_HTML);
  const [css, setCss] = useState(STARTER_CSS);
  const [js, setJs] = useState(STARTER_JS);
  const [srcDoc, setSrcDoc] = useState(() =>
    buildSrcDoc(STARTER_HTML, STARTER_CSS, STARTER_JS)
  );
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");
  const [logs, setLogs] = useState<Array<{ level: string; text: string }>>([
    { level: "INFO", text: "Playground siap dijalankan di sandbox aman." },
  ]);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (ev.data?.source === "viona-playground") {
        setLogs((prev) => [
          ...prev.slice(-20),
          { level: String(ev.data.level), text: String(ev.data.text) },
        ]);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function runCode() {
    setLogs([{ level: "INFO", text: "Menjalankan kode HTML/CSS/JS..." }]);
    setSrcDoc(buildSrcDoc(html, css, js));
  }

  function resetStarter() {
    setHtml(STARTER_HTML);
    setCss(STARTER_CSS);
    setJs(STARTER_JS);
    setSrcDoc(buildSrcDoc(STARTER_HTML, STARTER_CSS, STARTER_JS));
    setLogs([{ level: "INFO", text: "Kode dikembalikan ke template awal." }]);
  }

  const activeCode =
    activeTab === "html" ? html : activeTab === "css" ? css : js;
  const setActiveCode =
    activeTab === "html" ? setHtml : activeTab === "css" ? setCss : setJs;

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="lilac">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="min-w-0">
            <RibbonTag color="pink" className="mb-2">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>SANDBOX INTERAKTIF</span>
            </RibbonTag>
            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold text-[#4a3e3d]">
              Playground Koding Interaktif
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
              Tulis HTML, CSS, dan JavaScript langsung dan lihat hasilnya di browser secara aman.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SquishyButton type="button" variant="primary" onClick={runCode}>
                <CodeIcon className="w-4 h-4" />
                <span>Jalankan Kode</span>
              </SquishyButton>
              <SquishyButton type="button" variant="outline" onClick={resetStarter}>
                Reset Awal
              </SquishyButton>
            </div>
          </div>
          <StickerImage
            src={STICKERS.playgroundBearLaptop}
            alt="Beruang Laptop"
            className="w-28 h-28 shrink-0"
          />
        </div>
      </WashiCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <WashiCard tapeColor="pink" title="Buku Tulis Editor" className="lg:col-span-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {(
              [
                { id: "html", label: "index.html" },
                { id: "css", label: "style.css" },
                { id: "js", label: "script.js" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full font-[family-name:var(--font-mali)] text-xs font-bold border ${
                  activeTab === t.id
                    ? "bg-[#C8B6FF] text-[#200d4e] border-[#645495]"
                    : "bg-[#faf7f2] text-[#534342] border-[#eadfd5]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            aria-label={`Editor ${activeTab}`}
            rows={15}
            value={activeCode}
            onChange={(e) => setActiveCode(e.target.value)}
            spellCheck={false}
            className="w-full rounded-2xl bg-[#31302d] text-[#f3f0eb] p-4 font-[family-name:var(--font-jetbrains-mono)] text-xs sm:text-sm leading-relaxed focus:outline-none"
          />
        </WashiCard>

        <div className="lg:col-span-6 space-y-6 min-w-0">
          <WashiCard
            tapeColor="mint"
            title="Pratinjau Langsung"
            badge={
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewWidth("desktop")}
                  className={`min-h-[36px] px-3 rounded-full font-[family-name:var(--font-mali)] text-xs font-bold border ${
                    previewWidth === "desktop"
                      ? "bg-[#C6E9EE] border-[#436468]"
                      : "bg-white border-[#eadfd5]"
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewWidth("mobile")}
                  className={`min-h-[36px] px-3 rounded-full font-[family-name:var(--font-mali)] text-xs font-bold border ${
                    previewWidth === "mobile"
                      ? "bg-[#C6E9EE] border-[#436468]"
                      : "bg-white border-[#eadfd5]"
                  }`}
                >
                  Mobile
                </button>
              </div>
            }
          >
            <div className="flex justify-center bg-[#faf7f2] rounded-2xl p-3 border border-[#eadfd5]">
              <iframe
                title="Playground Preview"
                sandbox="allow-scripts"
                srcDoc={srcDoc}
                className={`h-72 rounded-2xl bg-white border border-[#eadfd5] transition-all ${
                  previewWidth === "mobile" ? "w-[320px] max-w-full" : "w-full"
                }`}
              />
            </div>
          </WashiCard>

          <WashiCard tapeColor="yellow" title="Terminal Konsol Siswa">
            <div className="rounded-2xl bg-[#31302d] text-[#f3f0eb] p-4 font-[family-name:var(--font-jetbrains-mono)] text-xs space-y-1.5 max-h-48 overflow-y-auto">
              {logs.map((entry, idx) => (
                <div key={idx} className="break-words">
                  <span className="text-[#FFAAA6] font-bold">[{entry.level}]</span>{" "}
                  <span>{entry.text}</span>
                </div>
              ))}
            </div>
          </WashiCard>
        </div>
      </div>
    </div>
  );
}
