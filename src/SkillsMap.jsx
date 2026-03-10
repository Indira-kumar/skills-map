import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import SKILL_TREE from "./skillsmap.config.json";

/* ═══════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════ */
const THEME = {
  colors: {
    bg:          "#110F0D",
    surface:     "#1A1816",
    elevated:    "#252220",
    border:      "#252220",
    borderStrong:"#332F2B",
    borderFaint: "#3D3835",
    text:        "#EDEBE8",
    textMid:     "#A8A29E",
    textMuted:   "#807B75",
    accent:      "#E8A040",
    success:     "#34D399",
    danger:      "#FB7185",
    info:        "#818CF8",
  },
  fonts: {
    mono:    "'JetBrains Mono', 'Fira Code', monospace",
    display: "'Bricolage Grotesque', sans-serif",
  },
};

const C = THEME.colors;
const F = THEME.fonts;

/* ═══════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════ */
const S = {
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
  },
  heading: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: F.display,
    fontWeight: 700,
    marginBottom: 12,
  },
  displayFont: {
    fontFamily: F.display,
  },
  diffItem: {
    padding: "7px 14px",
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 8,
  },
};

/* ═══════════════════════════════════════════
   DERIVED DATA
   ═══════════════════════════════════════════ */
const ALL_SKILLS = SKILL_TREE.flatMap(p =>
  p.branches.flatMap(b => b.skills.map(s => ({ ...s, pillarId: p.id, branchId: b.id })))
);
const ALL_EVIDENCE = ALL_SKILLS.flatMap(s => s.evidence.map((_, i) => ({ skillId: s.id, idx: i })));
const TOTAL_EVIDENCE = ALL_EVIDENCE.length;

const VERSION = "1.0";
const APP_NAME = "skillsmap";

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function pctColor(pct) {
  if (pct > 60) return C.success;
  if (pct > 25) return C.accent;
  return C.textMuted;
}

function diffColor(diff) {
  if (diff > 0) return C.success;
  if (diff < 0) return C.danger;
  return C.textMuted;
}

function getMonthLabel() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function checksToExport(checks, notes) {
  return {
    _meta: { app: APP_NAME, version: VERSION, exported: new Date().toISOString(), label: getMonthLabel() },
    checks: Object.keys(checks).filter(k => checks[k]),
    notes: notes || "",
  };
}

function importChecks(data) {
  if (!data || !data.checks || !Array.isArray(data.checks)) return null;
  const c = {};
  data.checks.forEach(k => { c[k] = true; });
  return { checks: c, notes: data.notes || "", label: data._meta?.label || "unknown" };
}

function compressToUrl(checks) {
  try {
    const json = JSON.stringify(checksToExport(checks, ""));
    return btoa(unescape(encodeURIComponent(json)));
  } catch { return null; }
}

function decompressFromUrl(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch { return null; }
}

/* ═══════════════════════════════════════════
   useLocalStorage HOOK
   ═══════════════════════════════════════════ */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return typeof initialValue === "string" ? raw : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {}
  }, [key, value]);

  const remove = useCallback(() => {
    try { localStorage.removeItem(key); } catch {}
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove];
}

/* ═══════════════════════════════════════════
   CSS (injected once)
   ═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translate(-50%,16px); } to { opacity:1; transform:translate(-50%,0); } }
  .fade-up { animation: fadeUp 0.25s ease-out both; }
  ::selection { background: ${C.accent}44; }
  input[type="file"] { display: none; }
  button { font-family: inherit; }
  button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 3px; }
`;

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function SkillsMap() {
  const [checks, setChecks, clearChecks] = useLocalStorage("skillsmap:checks", {});
  const [notes, setNotes, clearNotes] = useLocalStorage("skillsmap:notes", "");
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("map");
  const [toast, setToast] = useState(null);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  const fileRef = useRef(null);
  const compareRefA = useRef(null);
  const compareRefB = useRef(null);

  // Load from URL hash on mount (overrides localStorage)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith("s=")) {
      const data = decompressFromUrl(hash.slice(2));
      if (data) {
        const imported = importChecks(data);
        if (imported) {
          setChecks(imported.checks);
          setNotes(imported.notes);
          showToastMsg(`Loaded shared snapshot: ${imported.label}`);
        }
      }
    }
  }, []);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggle = useCallback((skillId, idx) => {
    const key = `${skillId}:${idx}`;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    setShareUrl(null);
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = useCallback(() => {
    const allIds = {};
    SKILL_TREE.forEach(p => p.branches.forEach(b => {
      allIds[b.id] = true;
      b.skills.forEach(s => { allIds[s.id] = true; });
    }));
    setExpanded(allIds);
  }, []);

  const collapseAll = useCallback(() => setExpanded({}), []);

  /* ── Metrics ── */
  const getSkillPct = useCallback((skill) => {
    const done = skill.evidence.filter((_, i) => checks[`${skill.id}:${i}`]).length;
    return Math.round((done / skill.evidence.length) * 100);
  }, [checks]);

  const getBranchPct = useCallback((branch) => {
    const all = branch.skills.flatMap(s => s.evidence.map((_, i) => `${s.id}:${i}`));
    if (!all.length) return 0;
    return Math.round((all.filter(k => checks[k]).length / all.length) * 100);
  }, [checks]);

  const getPillarPct = useCallback((pillar) => {
    const all = pillar.branches.flatMap(b => b.skills.flatMap(s => s.evidence.map((_, i) => `${s.id}:${i}`)));
    if (!all.length) return 0;
    return Math.round((all.filter(k => checks[k]).length / all.length) * 100);
  }, [checks]);

  const totalDone = ALL_EVIDENCE.filter(e => checks[`${e.skillId}:${e.idx}`]).length;
  const overallPct = Math.round((totalDone / TOTAL_EVIDENCE) * 100);

  /* ── Export ── */
  const handleExport = () => {
    const data = checksToExport(checks, notes);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillsmap-${getMonthLabel()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMsg(`Downloaded skillsmap-${getMonthLabel()}.json`);
  };

  /* ── Import ── */
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const imported = importChecks(data);
        if (imported) {
          setChecks(imported.checks);
          setNotes(imported.notes);
          showToastMsg(`Loaded snapshot: ${imported.label}`);
        } else {
          showToastMsg("Invalid file format");
        }
      } catch { showToastMsg("Failed to parse JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Compare file upload ── */
  const handleCompareFile = (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const imported = importChecks(data);
        if (imported) {
          const payload = { checks: imported.checks, label: imported.label };
          if (slot === "A") setCompareA(payload);
          else setCompareB(payload);
          showToastMsg(`Loaded snapshot ${slot}: ${imported.label}`);
        } else { showToastMsg("Invalid file format"); }
      } catch { showToastMsg("Failed to parse JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Share URL ── */
  const handleShare = () => {
    const encoded = compressToUrl(checks);
    if (encoded) {
      const url = `${window.location.origin}${window.location.pathname}#s=${encoded}`;
      navigator.clipboard?.writeText(url).then(() => showToastMsg("Share link copied to clipboard"));
      setShareUrl(url);
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    if (confirm("Clear all checkmarks? Make sure you've exported first.")) {
      clearChecks();
      clearNotes();
      setCompareA(null);
      setCompareB(null);
      showToastMsg("All progress cleared");
    }
  };

  /* ── Gaps ── */
  const gaps = useMemo(() => {
    return ALL_SKILLS
      .map(s => ({ ...s, pct: getSkillPct(s) }))
      .filter(s => s.pct < 50)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 10);
  }, [checks, getSkillPct]);

  /* ── Compare diffs ── */
  const compareDiffs = useMemo(() => {
    if (!compareA || !compareB) return null;
    const gained = [];
    const lost = [];
    let unchanged = 0;
    ALL_EVIDENCE.forEach(({ skillId, idx }) => {
      const key = `${skillId}:${idx}`;
      const inA = !!compareA.checks[key];
      const inB = !!compareB.checks[key];
      if (inB && !inA) gained.push(key);
      else if (inA && !inB) lost.push(key);
      else if (inA && inB) unchanged++;
    });
    return { gained, lost, unchanged };
  }, [compareA, compareB]);

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: F.mono }}>
      <style>{GLOBAL_CSS}</style>

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          ...S.card, border: `1px solid ${C.accent}33`,
          padding: "11px 22px", fontSize: 12, color: C.accent, zIndex: 999,
          animation: "toastSlide 0.3s ease-out", fontFamily: "inherit",
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${C.accent}14`,
          letterSpacing: 0.3,
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-1px", fontFamily: F.display }}>
              skillsmap
            </h1>
            <span style={{
              fontSize: 9, background: C.surface, color: C.textMuted, padding: "3px 9px",
              borderRadius: 4, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
              border: `1px solid ${C.border}`,
            }}>v{VERSION}</span>
            <a
              href="https://github.com/Indira-kumar/skills-map"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 10, color: C.textMuted, textDecoration: "none",
                padding: "3px 10px", borderRadius: 4, fontWeight: 600,
                border: `1px solid ${C.border}`, background: C.surface,
                letterSpacing: 0.5, transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.target.style.color = C.text; e.target.style.borderColor = C.textMuted; }}
              onMouseLeave={e => { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border; }}
            ><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{ verticalAlign: "-1px", marginRight: 5 }}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a>
          </div>
          <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
            Evidence-based skill tracker for solopreneurs. Don't rate yourself — prove it.
            <br/>Export snapshots monthly. Compare over time. Share your proof.
          </p>
        </div>

        {/* ─── TOOLBAR ─── */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22,
          padding: "12px 14px", ...S.card,
        }}>
          <ToolBtn label="Export" onClick={handleExport} accent={C.info} />
          <ToolBtn label="Load" onClick={() => fileRef.current?.click()} accent={C.success} />
          <ToolBtn label="Share URL" onClick={handleShare} accent={C.accent} />
          <ToolBtn label="Notes" onClick={() => setShowNotes(!showNotes)} accent={showNotes ? C.text : C.textMuted} />
          <div style={{ flex: 1 }} />
          <ToolBtn label="expand all" onClick={expandAll} accent={C.textMuted} subtle />
          <ToolBtn label="collapse" onClick={collapseAll} accent={C.textMuted} subtle />
          <ToolBtn label="reset" onClick={handleReset} accent={C.danger} subtle />
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} />
        </div>

        {/* ─── NOTES ─── */}
        {showNotes && (
          <div className="fade-up" style={{ marginBottom: 18 }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes for this snapshot — goals, reflections, what you're focusing on..."
              style={{
                width: "100%", minHeight: 76, padding: 14, background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid,
                fontSize: 12, fontFamily: "inherit", resize: "vertical", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = `${C.accent}55`}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        )}

        {/* ─── SHARE URL ─── */}
        {shareUrl && (
          <div className="fade-up" style={{
            marginBottom: 18, padding: "11px 16px", ...S.card,
            border: `1px solid ${C.accent}22`,
            fontSize: 11, wordBreak: "break-all", color: C.accent, lineHeight: 1.5,
          }}>
            <span style={{ color: C.textMuted }}>Share link: </span>{shareUrl}
          </div>
        )}

        {/* ─── STATS ─── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8, marginBottom: 22,
        }}>
          <StatCard label="Proven" val={`${overallPct}%`} sub={`${totalDone} of ${TOTAL_EVIDENCE}`} color={C.text} big />
          {SKILL_TREE.map(p => (
            <StatCard key={p.id} label={p.label} val={`${getPillarPct(p)}%`} color={p.color} icon={p.icon} />
          ))}
        </div>

        {/* ─── VIEW TABS ─── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
          {["map", "gaps", "radar", "compare"].map(key => {
            const labels = { map: "Skill Map", gaps: "Gaps", radar: "Radar", compare: "Compare" };
            const active = view === key;
            return (
              <button key={key} onClick={() => setView(key)} style={{
                background: active ? C.elevated : "transparent",
                color: active ? C.text : C.textMuted,
                border: `1px solid ${active ? C.borderStrong : "transparent"}`,
                borderRadius: 6, padding: "6px 16px", fontSize: 11, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1, fontFamily: "inherit",
                fontWeight: active ? 600 : 400, transition: "all 0.15s",
              }}>
                {labels[key]}
              </button>
            );
          })}
        </div>

        {/* ═══ MAP VIEW ═══ */}
        {view === "map" && SKILL_TREE.map(pillar => (
          <PillarSection key={pillar.id} pillar={pillar} checks={checks} expanded={expanded}
            toggle={toggle} toggleExpand={toggleExpand} getSkillPct={getSkillPct}
            getBranchPct={getBranchPct} getPillarPct={getPillarPct} />
        ))}

        {/* ═══ GAPS VIEW ═══ */}
        {view === "gaps" && (
          <div className="fade-up">
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18, lineHeight: 1.6 }}>
              Skills with less than 50% evidence. This is your growth roadmap — focus here.
            </p>
            {gaps.length === 0 ? (
              <p style={{ color: C.success, fontSize: 13 }}>No major gaps — you're well-rounded!</p>
            ) : gaps.map((s, i) => {
              const pillar = SKILL_TREE.find(p => p.id === s.pillarId);
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", ...S.card,
                  border: `1px solid ${i === 0 ? "#3D2020" : C.border}`,
                  marginBottom: 5,
                }}>
                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, minWidth: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, color: C.text, flex: 1, ...S.displayFont, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: pillar?.color, opacity: 0.7 }}>
                    {pillar?.icon} {pillar?.label}
                  </span>
                  <MiniBar value={s.pct} color={pillar?.color} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: "right",
                    color: s.pct === 0 ? C.danger : C.accent,
                  }}>{s.pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ RADAR VIEW ═══ */}
        {view === "radar" && <RadarChart pillars={SKILL_TREE} getBranchPct={getBranchPct} />}

        {/* ═══ COMPARE VIEW ═══ */}
        {view === "compare" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <CompareDropZone
                label="Snapshot A" sublabel="Before" data={compareA} color={C.info}
                onUpload={() => compareRefA.current?.click()}
                onClear={() => setCompareA(null)}
              />
              <CompareDropZone
                label="Snapshot B" sublabel="After" data={compareB} color={C.accent}
                onUpload={() => compareRefB.current?.click()}
                onClear={() => setCompareB(null)}
              />
            </div>
            <input ref={compareRefA} type="file" accept=".json" onChange={(e) => handleCompareFile(e, "A")} />
            <input ref={compareRefB} type="file" accept=".json" onChange={(e) => handleCompareFile(e, "B")} />

            {!compareDiffs && (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", padding: "20px 0", lineHeight: 1.7 }}>
                Upload two exported snapshots to compare your progress over time.
              </p>
            )}

            {compareDiffs && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
                  <StatCard label="Gained" val={`+${compareDiffs.gained.length}`} color={C.success} />
                  <StatCard label="Lost" val={`-${compareDiffs.lost.length}`} color={C.danger} />
                  <StatCard label="Kept" val={String(compareDiffs.unchanged)} color={C.info} />
                </div>

                <h3 style={{ ...S.heading, color: C.success }}>New in {compareB.label}</h3>
                {compareDiffs.gained.length === 0 ? (
                  <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>No new evidence between snapshots.</p>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    {compareDiffs.gained.map(key => <DiffItem key={key} itemKey={key} color={C.success} />)}
                  </div>
                )}

                {compareDiffs.lost.length > 0 && (
                  <>
                    <h3 style={{ ...S.heading, color: C.danger }}>Removed since {compareA.label}</h3>
                    <div style={{ marginBottom: 24 }}>
                      {compareDiffs.lost.map(key => <DiffItem key={key} itemKey={key} color={C.danger} />)}
                    </div>
                  </>
                )}

                <h3 style={{ ...S.heading, color: C.textMid }}>Pillar breakdown</h3>
                {SKILL_TREE.map(pillar => {
                  const allKeys = pillar.branches.flatMap(b => b.skills.flatMap(s => s.evidence.map((_, i) => `${s.id}:${i}`)));
                  const aPct = Math.round((allKeys.filter(k => compareA.checks[k]).length / allKeys.length) * 100);
                  const bPct = Math.round((allKeys.filter(k => compareB.checks[k]).length / allKeys.length) * 100);
                  const diff = bPct - aPct;
                  return (
                    <div key={pillar.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", marginBottom: 5, ...S.card,
                    }}>
                      <span style={{ color: pillar.color, fontSize: 14 }}>{pillar.icon}</span>
                      <span style={{ fontSize: 13, color: C.text, flex: 1, ...S.displayFont, fontWeight: 500 }}>{pillar.label}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{aPct}%</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>→</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: pillar.color }}>{bPct}%</span>
                      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: "right", color: diffColor(diff) }}>
                        {diff > 0 ? `+${diff}` : diff}%
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`,
          fontSize: 10, color: C.textMuted, textAlign: "center", lineHeight: 1.9,
        }}>
          <strong style={{ color: C.textMid, ...S.displayFont, fontWeight: 700, letterSpacing: "-0.3px" }}>skillsmap</strong> — don't rate yourself, prove it
          <br/>Export monthly as JSON → Compare snapshots → Track real growth
          <br/>Pure client-side. Your data never leaves your browser.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function ToolBtn({ label, onClick, accent, subtle }) {
  return (
    <button onClick={onClick} style={{
      background: subtle ? "transparent" : C.elevated,
      color: accent,
      border: `1px solid ${subtle ? "transparent" : C.borderStrong}`,
      borderRadius: 6, padding: subtle ? "4px 10px" : "6px 14px",
      fontSize: subtle ? 10 : 11, cursor: "pointer", fontFamily: "inherit",
      fontWeight: 500, letterSpacing: 0.3, whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

function StatCard({ label, val, sub, color, big, icon }) {
  return (
    <div style={{
      ...S.card, padding: big ? "14px 18px" : "12px 16px",
      borderLeft: `3px solid ${color}33`,
    }}>
      <div style={{
        fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.2,
        display: "flex", alignItems: "center", gap: 5, ...S.displayFont, fontWeight: 600,
      }}>
        {icon && <span style={{ color, fontSize: 10 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: big ? 24 : 20, fontWeight: 700, color, marginTop: 4, ...S.displayFont }}>{val}</div>
      {sub && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, color, width = 48 }) {
  return (
    <div style={{ width, height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        width: `${value}%`, height: "100%", background: color, opacity: 0.8,
        borderRadius: 2, transition: "width 0.3s ease",
      }} />
    </div>
  );
}

function SkillDot({ pct, color }) {
  return (
    <div style={{
      width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
      background: pct === 100 ? color : pct > 0 ? color + "44" : C.elevated,
      border: `1.5px solid ${pct > 0 ? color + "88" : C.borderFaint}`,
      transition: "all 0.2s",
      boxShadow: pct === 100 ? `0 0 8px ${color}44` : "none",
    }} />
  );
}

function DiffItem({ itemKey, color }) {
  const [sid, idx] = itemKey.split(":");
  const skill = ALL_SKILLS.find(s => s.id === sid);
  return (
    <div style={{ ...S.diffItem, color, borderLeft: `2px solid ${color}44` }}>
      <span style={{ color: C.textMuted }}>{skill?.label}: </span>
      {skill?.evidence[Number(idx)]}
    </div>
  );
}

function CompareDropZone({ label, sublabel, data, onUpload, onClear, color }) {
  return (
    <div
      onClick={data ? undefined : onUpload}
      style={{
        padding: data ? "18px 20px" : "28px 20px",
        border: `2px dashed ${data ? color + "55" : C.borderStrong}`,
        borderRadius: 12, background: data ? color + "08" : C.surface,
        textAlign: "center", cursor: data ? "default" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {data ? (
        <div>
          <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color, ...S.displayFont }}>{data.label}</div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
            marginTop: 10, background: "transparent", border: `1px solid ${C.borderStrong}`,
            color: C.textMuted, fontSize: 10, padding: "4px 12px", borderRadius: 5,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            Remove
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 22, color: C.borderStrong, marginBottom: 6, fontWeight: 300 }}>+</div>
          <div style={{ fontSize: 12, color: C.textMid, ...S.displayFont, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{sublabel} — click to upload JSON</div>
        </div>
      )}
    </div>
  );
}

function PillarSection({ pillar, checks, expanded, toggle, toggleExpand, getSkillPct, getBranchPct, getPillarPct }) {
  const pPct = getPillarPct(pillar);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "16px 0 12px",
        borderBottom: `1px solid ${pillar.color}20`,
      }}>
        <span style={{ fontSize: 15, color: pillar.color }}>{pillar.icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 16, fontWeight: 800, color: pillar.color,
            textTransform: "uppercase", letterSpacing: 2, ...S.displayFont,
          }}>{pillar.label}</span>
          <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 12 }}>{pillar.desc}</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: pctColor(pPct), ...S.displayFont }}>{pPct}%</span>
      </div>

      {pillar.branches.map(branch => {
        const bPct = getBranchPct(branch);
        const isOpen = expanded[branch.id];
        return (
          <div key={branch.id} style={{ marginLeft: 16, borderLeft: `1px solid ${pillar.color}18` }}>
            <button onClick={() => toggleExpand(branch.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 14px", background: isOpen ? C.surface : "transparent",
              border: "none", borderRadius: "0 8px 8px 0", cursor: "pointer",
              color: C.text, fontFamily: "inherit", textAlign: "left",
              transition: "background 0.15s",
            }}>
              <span style={{
                fontSize: 13, color: isOpen ? C.text : C.textMid, fontWeight: isOpen ? 600 : 400, flex: 1,
                ...S.displayFont,
              }}>
                {branch.label}
              </span>
              <MiniBar value={bPct} color={pillar.color} />
              <span style={{ fontSize: 11, fontWeight: 600, minWidth: 30, textAlign: "right", color: pctColor(bPct) }}>
                {bPct}%
              </span>
              <span style={{
                color: C.textMuted, fontSize: 11,
                transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s",
              }}>▸</span>
            </button>

            {isOpen && (
              <div className="fade-up" style={{ padding: "2px 0 8px 16px" }}>
                {branch.skills.map(skill => {
                  const sPct = getSkillPct(skill);
                  const isSkillOpen = expanded[skill.id];
                  const done = skill.evidence.filter((_, i) => checks[`${skill.id}:${i}`]).length;
                  return (
                    <div key={skill.id}>
                      <button onClick={() => toggleExpand(skill.id)} style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "7px 10px", background: isSkillOpen ? C.surface : "transparent",
                        border: "none", borderRadius: 6, cursor: "pointer",
                        color: C.text, fontFamily: "inherit", textAlign: "left",
                        transition: "background 0.15s",
                      }}>
                        <SkillDot pct={sPct} color={pillar.color} />
                        <span style={{ fontSize: 12, color: isSkillOpen ? C.text : C.textMid, flex: 1 }}>
                          {skill.label}
                        </span>
                        <span style={{ fontSize: 10, color: C.textMuted }}>{done}/{skill.evidence.length}</span>
                      </button>
                      {isSkillOpen && (
                        <div className="fade-up" style={{ padding: "2px 0 6px 28px" }}>
                          {skill.evidence.map((ev, idx) => {
                            const key = `${skill.id}:${idx}`;
                            const checked = !!checks[key];
                            return (
                              <label key={idx} style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "5px 10px", borderRadius: 5, cursor: "pointer",
                                fontSize: 11, lineHeight: 1.6,
                                color: checked ? C.success : C.textMid,
                                textDecoration: checked ? "line-through" : "none",
                                opacity: checked ? 0.65 : 1,
                                transition: "all 0.15s",
                              }}>
                                <input type="checkbox" checked={checked} onChange={() => toggle(skill.id, idx)}
                                  style={{ accentColor: pillar.color, marginTop: 3, cursor: "pointer", flexShrink: 0 }} />
                                {ev}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({ pillars, getBranchPct }) {
  const branches = pillars.flatMap(p => p.branches.map(b => ({ ...b, pillar: p })));
  const n = branches.length;
  const size = 380;
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 60;

  const pts = branches.map((b, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct = getBranchPct(b) / 100;
    return {
      b, a,
      x: cx + Math.cos(a) * maxR * pct,
      y: cy + Math.sin(a) * maxR * pct,
      lx: cx + Math.cos(a) * (maxR + 38),
      ly: cy + Math.sin(a) * (maxR + 38),
      fx: cx + Math.cos(a) * maxR,
      fy: cy + Math.sin(a) * maxR,
    };
  });

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="fade-up" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0.02" />
          </radialGradient>
        </defs>
        {[.2, .4, .6, .8, 1].map(r => (
          <circle key={r} cx={cx} cy={cy} r={maxR * r} fill="none" stroke={C.border} strokeWidth={0.5} />
        ))}
        {pts.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.fx} y2={p.fy} stroke={C.border} strokeWidth={0.5} />
        ))}
        <path d={path} fill="url(#radarFill)" stroke={C.accent} strokeWidth={1.5} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill={p.b.pillar.color} />
            <circle cx={p.x} cy={p.y} r={6} fill={p.b.pillar.color} opacity={0.15} />
            <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
              fill={p.b.pillar.color} fontSize={8} fontWeight={600} fontFamily={F.display}>
              {p.b.label}
            </text>
            <text x={p.lx} y={p.ly + 13} textAnchor="middle" dominantBaseline="middle"
              fill={C.textMuted} fontSize={8} fontFamily={F.mono}>
              {getBranchPct(p.b)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
