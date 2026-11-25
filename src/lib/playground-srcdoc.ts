/**
 * Builds a sandboxed HTML document for client-side HTML/CSS/JS execution.
 * Each playground instance tags its console bridge messages with instanceId.
 */
export function buildPlaygroundSrcDoc(
  html: string,
  css: string,
  js: string,
  instanceId = "default"
): string {
  const safeJs = js.replace(/<\/script>/gi, "<\\/script>");
  const safeId = JSON.stringify(instanceId);
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
  var id = ${safeId};
  var send = function(level, args) {
    window.parent.postMessage({ source: "viona-playground", instanceId: id, level: level, text: args.map(String).join(" ") }, "*");
  };
  var origLog = console.log;
  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    send("LOG", args);
    origLog.apply(console, args);
  };
  window.onerror = function(msg) { send("ERROR", [msg]); };
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
