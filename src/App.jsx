import React, { useState, useEffect, useRef } from 'react';
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── FONT INJECTION ──────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
}

// ─── CDN MAP ─────────────────────────────────────────────────────────────────
const CDN_MAP = {
  react: "https://esm.sh/react@18.3.1",
  "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
  "react-dom": "https://esm.sh/react-dom@18.3.1",
  "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
  "lucide-react": "https://esm.sh/lucide-react",
  "framer-motion":
    "https://esm.sh/framer-motion?deps=react@18.3.1,react-dom@18.3.1",
  recharts:
    "https://esm.sh/recharts?deps=react@18.3.1,react-dom@18.3.1",
  "class-variance-authority": "https://esm.sh/class-variance-authority",
  clsx: "https://esm.sh/clsx",
  "tailwind-merge": "https://esm.sh/tailwind-merge",
  zod: "https://esm.sh/zod",
  zustand: "https://esm.sh/zustand?deps=react@18.3.1",
  "date-fns": "https://esm.sh/date-fns",
  "react-hook-form":
    "https://esm.sh/react-hook-form?deps=react@18.3.1",
  axios: "https://esm.sh/axios",
  three: "https://esm.sh/three",
  d3: "https://esm.sh/d3",
  lodash: "https://esm.sh/lodash",
  "@tanstack/react-query":
    "https://esm.sh/@tanstack/react-query?deps=react@18.3.1",
  "react-router-dom":
    "https://esm.sh/react-router-dom?deps=react@18.3.1,react-dom@18.3.1",
};

const SHADCN_CDN = "https://cdn.jsdelivr.net/npm/shadcdn/+esm";

// ─── CODE NORMALIZER ─────────────────────────────────────────────────────────
function normalizeCode(rawCode) {
  const trimmed = rawCode.trim().toLowerCase();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) {
    return { isHtml: true, code: rawCode, importMap: null, hasShadcn: false, hasUnknown: false, unknownPackages: [], platform: "html" };
  }

  // Detect platform
  let platform = "gemini";
  if (/from\s+['"]https:\/\/esm\.sh/i.test(rawCode)) platform = "claude";
  else if (/@\/components\/ui/i.test(rawCode)) platform = "gpt-canvas";

  // Extract all import sources
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  const sources = [...new Set([...rawCode.matchAll(importRegex)].map(m => m[1]))];

  const imports = {};
  let hasShadcn = false;
  let hasUnknown = false;
  const unknownPackages = [];
  let hasLibUtils = false;

  for (const src of sources) {
    // Already a URL
    if (src.startsWith("http://") || src.startsWith("https://")) {
      imports[src] = src;
      continue;
    }
    // Relative imports — skip
    if (src.startsWith(".")) continue;
    // @/lib/utils — inline stub
    if (src === "@/lib/utils") { hasLibUtils = true; continue; }
    // shadcn components
    if (src.startsWith("@/components/ui/")) {
      imports[src] = SHADCN_CDN;
      hasShadcn = true;
      continue;
    }
    // @radix-ui scoped
    if (src.startsWith("@radix-ui/")) {
      imports[src] = `https://esm.sh/${src}`;
      continue;
    }
    // Known map
    if (CDN_MAP[src]) {
      imports[src] = CDN_MAP[src];
      continue;
    }
    // Hard guard — @/ paths are LOCAL aliases, NEVER npm packages
    // Without this, @/components/ui/button leaks into Rule E
    // → becomes https://esm.sh/@/components → npm tries @/components@latest → crash
    if (src.startsWith("@/")) continue;

    // Unknown bare specifier fallback
    if (!src.includes("/") || src.startsWith("@")) {
      imports[src] = `https://esm.sh/${src}`;
      unknownPackages.push(src);
      hasUnknown = true;
    }
  }

  // Rewrite imports in code
  let code = rawCode;
  for (const [src, url] of Object.entries(imports)) {
    if (src === url) continue; // already a URL, skip
    code = code.replaceAll(`'${src}'`, `'${url}'`).replaceAll(`"${src}"`, `"${url}"`);
  }

  // Inline @/lib/utils stub
  if (hasLibUtils) {
    code = code.replace(/import\s+\{[^}]+\}\s+from\s+['"]@\/lib\/utils['"]\s*;?/g, "");
    // inject after last import
    const lastImportIdx = [...code.matchAll(/^import .+$/gm)].reduce((last, m) => Math.max(last, m.index + m[0].length), 0);
    const stub = `\n// [Zaploy] @/lib/utils inline\nconst cn = (...inputs) => inputs.flat().filter(Boolean).join(' ');\n`;
    code = code.slice(0, lastImportIdx) + stub + code.slice(lastImportIdx);
  }

  // Handle export default + auto-mount
  const namedMatch = code.match(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*[\({]/);
  const anonMatch = code.match(/export\s+default\s+function\s*[\({]/);
  const varMatch = code.match(/export\s+default\s+([A-Za-z_$][\w$]+)\s*[;\n]/);

  let componentName = "__ZaployRoot__";

  if (namedMatch) {
    componentName = namedMatch[1];
    code = code.replace(/export\s+default\s+function\s+/, "function ");
  } else if (anonMatch) {
    code = code.replace(/export\s+default\s+function\s*/, `function ${componentName} `);
  } else if (varMatch) {
    componentName = varMatch[1];
    code = code.replace(/export\s+default\s+[A-Za-z_$][\w$]+\s*[;\n]/, "");
  }

  // Strip any manual createRoot calls
  code = code.replace(/ReactDOM\.createRoot\([\s\S]*?\)\.render\([\s\S]*?\);?/g, "");

  // Auto-mount
  code += `\n\n// [Zaploy auto-mount]\n(function(){\n  try {\n    const __el = document.getElementById('root');\n    if(!__el) return;\n    ReactDOM.createRoot(__el).render(React.createElement(${componentName}));\n  } catch(e) { console.error('[Zaploy]', e); }\n})();\n`;

  return {
    code,
    importMap: { imports },
    isHtml: false,
    hasShadcn,
    hasUnknown,
    unknownPackages,
    platform,
  };
}

// ─── PREVIEW HTML BUILDER ─────────────────────────────────────────────────────
function buildPreviewHTML({ code, importMap, title = "Preview" }) {
  const importMapJson = JSON.stringify(importMap ?? { imports: {} }, null, 2);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <script type="importmap">${importMapJson}<\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background: white; }
    #root { min-height: 100vh; }
  </style>
  <script>
    (function() {
      window.addEventListener('click', function(e) {
        var a = e.target.closest('a'); if (!a) return;
        var h = a.getAttribute('href') || '';
        if (!h || h === '#' || h.startsWith('#') || h.includes('javascript:')) { e.preventDefault(); e.stopPropagation(); return; }
        if (h.startsWith('http') || h.startsWith('//')) { e.preventDefault(); e.stopPropagation(); window.open(h, '_blank', 'noopener'); }
      }, true);
    })();
  <\/script>
  <script>
    (function() {
      var shown = false;
      function show(msg, src, line) {
        if (shown) return; shown = true;
        var d = document.createElement('div');
        d.style.cssText = 'position:fixed;bottom:12px;right:12px;max-width:420px;background:#0a0f0b;border:1px solid #ccff00;border-radius:10px;padding:14px 18px;font-family:monospace;font-size:12px;line-height:1.5;z-index:99999;word-break:break-word;color:#a3b89a';
        d.innerHTML = '<div style="color:#ccff00;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-family:sans-serif">⚡ Preview Error</div>' + String(msg || 'Unknown error').replace(/</g,'&lt;') + (line ? '<div style="color:#444;font-size:10px;margin-top:4px">Line ' + line + '</div>' : '') + '<button onclick="this.parentElement.remove()" style="position:absolute;top:8px;right:10px;background:none;border:none;color:#ccff00;cursor:pointer;font-size:16px">&times;</button>';
        (document.body || document.documentElement).appendChild(d);
      }
      window.onerror = function(m,s,l){ show(m,s,l); return false; };
      window.addEventListener('unhandledrejection', function(e){ show(e.reason instanceof Error ? e.reason.message : String(e.reason)); });
    })();
  <\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module" data-presets="react">
${code}
  <\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</body>
</html>`;
}

// ─── PLATFORM BADGE ───────────────────────────────────────────────────────────
const PLATFORM_CONFIG = {
  "claude":     { label: "Claude Artifact", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" },
  "gpt-canvas": { label: "GPT Canvas",      color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  "gemini":     { label: "Gemini",          color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
  "html":       { label: "Raw HTML",        color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.2)" },
  "unknown":    { label: "Unknown",         color: "#6b7280", bg: "rgba(107,114,128,0.1)",border: "rgba(107,114,128,0.2)" },
};

// ─── SAMPLE CODES ─────────────────────────────────────────────────────────────
const SAMPLES = {
  gpt: `import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function App() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl text-white">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Early Access</Badge>
          </div>
          <CardTitle className="text-2xl font-bold">Join the waitlist</CardTitle>
          <CardDescription className="text-slate-400">Be first to know when we launch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center py-6 text-green-400 font-medium">
              ✓ You're on the list!
            </div>
          ) : (
            <>
              <Input
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={() => email && setSubmitted(true)}
                className={cn("w-full", email ? "bg-purple-600 hover:bg-purple-700" : "opacity-50 cursor-not-allowed")}
              >
                Request Access
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}`,

  claude: `import { useState, useEffect } from "https://esm.sh/react@18.3.1"
import { motion } from "https://esm.sh/framer-motion?deps=react@18.3.1,react-dom@18.3.1"

export default function App() {
  const [count, setCount] = useState(0)
  const [color, setColor] = useState("#8b5cf6")

  useEffect(() => {
    const colors = ["#8b5cf6","#06b6d4","#10b981","#f97316","#ec4899"]
    setColor(colors[count % colors.length])
  }, [count])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-9xl font-bold"
          style={{ color }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.3 }}
          key={count}
        >
          {count}
        </motion.div>
        <div className="flex gap-4 justify-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setCount(c => c - 1)}
            className="px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            −
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setCount(c => c + 1)}
            className="px-8 py-3 rounded-xl text-black font-semibold"
            style={{ background: color }}
          >
            +
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}`,

  gemini: `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TASKS = [
  { id: 1, text: "Design the UI", done: true },
  { id: 2, text: "Write the logic", done: false },
  { id: 3, text: "Deploy to Zaploy", done: false },
]

export default function App() {
  const [tasks, setTasks] = useState(TASKS)
  const [input, setInput] = useState("")

  const toggle = (id) => setTasks(t => t.map(x => x.id === id ? {...x, done: !x.done} : x))
  const add = () => {
    if (!input.trim()) return
    setTasks(t => [...t, { id: Date.now(), text: input, done: false }])
    setInput("")
  }
  const remove = (id) => setTasks(t => t.filter(x => x.id !== id))
  const done = tasks.filter(t => t.done).length

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-zinc-500 text-sm mt-1">{done}/{tasks.length} complete</p>
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: tasks.length ? (done/tasks.length*100)+'%' : '0%' }} transition={{ type:'spring', stiffness:100 }} />
          </div>
        </div>
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div key={task.id} layout initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] group"
            >
              <button onClick={() => toggle(task.id)} className={['w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-colors', task.done ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'].join(' ')}>
                {task.done && <span className="text-white text-xs">✓</span>}
              </button>
              <span className={\`flex-1 text-sm \${task.done ? 'line-through text-zinc-500' : 'text-zinc-200'}\`}>{task.text}</span>
              <button onClick={() => remove(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all text-xs">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex gap-2 pt-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
            placeholder="Add task..." className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/40" />
          <button onClick={add} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-colors">Add</button>
        </div>
      </div>
    </div>
  )
}`,
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  useFonts();

  const [code, setCode] = useState(SAMPLES.gpt);
  const [result, setResult] = useState(null);
  const [iframeHtml, setIframeHtml] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [viewMode, setViewMode] = useState("split"); // split | editor | preview
  const iframeRef = useRef(null);

  const run = useCallback(() => {
    const normalized = normalizeCode(code);
    setResult(normalized);
    if (normalized.isHtml) {
      setIframeHtml(normalized.code);
    } else {
      setIframeHtml(buildPreviewHTML({ code: normalized.code, importMap: normalized.importMap }));
    }
    setPreviewKey(k => k + 1);
    setActiveTab("preview");
  }, [code]);

  // Auto-run on mount
  useEffect(() => { run(); }, []);

  const loadSample = (key) => { setCode(SAMPLES[key]); setTimeout(run, 50); };

  const platform = result?.platform ?? "unknown";
  const pc = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.unknown;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#09090b", color: "#e4e4e7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ccff00, #84cc16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>⚡</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>Zaploy Preview Tester</span>
          <span style={{ fontSize: 11, color: "#52525b", fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>v1.0</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Sample buttons */}
          {[["gpt", "GPT Canvas"], ["claude", "Claude"], ["gemini", "Gemini"]].map(([k, label]) => (
            <button key={k} onClick={() => loadSample(k)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#71717a", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
          {/* View toggle */}
          {[["split","Split"],["editor","Code"],["preview","Preview"]].map(([v,l]) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "'Outfit', sans-serif", background: viewMode === v ? "rgba(204,255,0,0.1)" : "transparent", border: `1px solid ${viewMode === v ? "rgba(204,255,0,0.2)" : "rgba(255,255,255,0.06)"}`, color: viewMode === v ? "#ccff00" : "#52525b" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* Left — Editor */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div style={{ width: viewMode === "editor" ? "100%" : "50%", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.06)", minWidth: 0 }}>
            {/* Editor toolbar */}
            <div style={{ padding: "0 12px", height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#3f3f46", fontFamily: "'DM Mono', monospace" }}>paste your code here</span>
              <motion.button onClick={run} whileTap={{ scale: 0.95 }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 7, background: "#ccff00", color: "#09090b", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "'Outfit', sans-serif" }}>
                ▶ Run
              </motion.button>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, padding: 16, background: "transparent", color: "#d4d4d8", border: "none", outline: "none", resize: "none",
                fontFamily: "'DM Mono', 'Fira Code', monospace", fontSize: 12.5, lineHeight: 1.7, tabSize: 2,
              }}
              onKeyDown={e => {
                if (e.key === "Tab") { e.preventDefault(); const s = e.target.selectionStart; const v = e.target.value; setCode(v.slice(0, s) + "  " + v.slice(e.target.selectionEnd)); requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }); }
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
              }}
            />
          </div>
        )}

        {/* Right — Preview + Diagnostics */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

            {/* Tabs */}
            <div style={{ padding: "0 12px", height: 40, display: "flex", alignItems: "center", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
              {[["preview", "Preview"], ["diagnostics", "Diagnostics"], ["html", "Generated HTML"]].map(([t, l]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "'Outfit', sans-serif", border: "none", background: activeTab === t ? "rgba(255,255,255,0.08)" : "transparent", color: activeTab === t ? "#e4e4e7" : "#52525b" }}>
                  {l}
                </button>
              ))}

              {result && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color, fontFamily: "'DM Mono', monospace" }}>
                    {pc.label}
                  </span>
                  {result.hasShadcn && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontFamily: "'DM Mono', monospace" }}>
                      shadcn ✓
                    </span>
                  )}
                  {result.hasUnknown && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#eab308", fontFamily: "'DM Mono', monospace" }}>
                      ⚠ unknown pkgs
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              {activeTab === "preview" && (
                <iframe
                  ref={iframeRef}
                  key={previewKey}
                  srcDoc={iframeHtml}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  style={{ width: "100%", height: "100%", border: "none", background: "white" }}
                  title="Preview"
                />
              )}

              {activeTab === "diagnostics" && result && (
                <div style={{ padding: 16, overflowY: "auto", height: "100%", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                  {/* Platform */}
                  <DiagRow label="Platform" value={<span style={{ color: pc.color }}>{pc.label}</span>} />
                  <DiagRow label="Mode" value={result.isHtml ? "Raw HTML (passthrough)" : "JSX/React"} />
                  <DiagRow label="shadcn/ui" value={result.hasShadcn ? <span style={{ color: "#10b981" }}>Detected — mapped to cdn.jsdelivr.net/npm/shadcdn</span> : <span style={{ color: "#52525b" }}>Not used</span>} />
                  <DiagRow label="Unknown packages" value={result.unknownPackages.length > 0 ? <span style={{ color: "#eab308" }}>{result.unknownPackages.join(", ")}</span> : <span style={{ color: "#52525b" }}>None</span>} />

                  <div style={{ marginTop: 16, marginBottom: 8, color: "#52525b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Import Map</div>
                  {result.importMap ? (
                    Object.entries(result.importMap.imports).length > 0
                      ? Object.entries(result.importMap.imports).map(([src, url]) => (
                          <div key={src} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                            <span style={{ color: "#71717a", flexShrink: 0, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{src}</span>
                            <span style={{ color: "#3f3f46" }}>→</span>
                            <span style={{ color: "#6366f1", wordBreak: "break-all" }}>{url}</span>
                          </div>
                        ))
                      : <div style={{ color: "#3f3f46" }}>No imports detected</div>
                  ) : (
                    <div style={{ color: "#3f3f46" }}>HTML mode — no import map</div>
                  )}
                </div>
              )}

              {activeTab === "html" && (
                <pre style={{ margin: 0, padding: 16, overflowY: "auto", height: "100%", fontFamily: "'DM Mono', monospace", fontSize: 11.5, lineHeight: 1.7, color: "#71717a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {iframeHtml}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "6px 16px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#27272a", fontFamily: "'DM Mono', monospace" }}>⌘+Enter to run</span>
        <span style={{ fontSize: 11, color: "#27272a", fontFamily: "'DM Mono', monospace" }}>Tab to indent</span>
        <span style={{ fontSize: 11, color: "#27272a", fontFamily: "'DM Mono', monospace" }}>Load samples from header →</span>
      </div>
    </div>
  );
}

function DiagRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 8, alignItems: "flex-start" }}>
      <span style={{ color: "#3f3f46", width: 140, flexShrink: 0, fontSize: 11 }}>{label}</span>
      <span style={{ color: "#a1a1aa", fontSize: 12 }}>{value}</span>
    </div>
  );
}
