import { useState, useMemo, useCallback, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   SKILL TREE DATA
   ═══════════════════════════════════════════ */
const SKILL_TREE = [
  {
    id: "think", label: "Think", icon: "◆", color: "#E2A735",
    desc: "Validate before you build. Strategy before tactics.",
    branches: [
      { id: "validate", label: "Validation", skills: [
        { id: "vl1", label: "Problem Discovery", evidence: [
          "Interviewed 10+ potential users about their problems",
          "Can articulate the problem in one sentence",
          "Identified a gap competitors aren't filling",
        ]},
        { id: "vl2", label: "Market Sizing", evidence: [
          "Estimated TAM/SAM/SOM for an idea",
          "Identified ideal customer profile (ICP)",
          "Researched pricing benchmarks in my category",
        ]},
        { id: "vl3", label: "MVP & Iteration", evidence: [
          "Shipped an MVP and collected real user feedback",
          "Pivoted or killed a feature based on data",
          "Pre-sold a product before fully building it",
        ]},
      ]},
      { id: "strategy", label: "Strategy", skills: [
        { id: "st1", label: "Pricing & Monetization", evidence: [
          "Chosen a pricing model and can justify why",
          "Tested different price points",
          "Implemented upsells or expansion revenue",
        ]},
        { id: "st2", label: "Metrics & Analytics", evidence: [
          "Track MRR, churn, and LTV regularly",
          "Set up product analytics (Mixpanel, PostHog, etc.)",
          "Made a product decision based on data, not gut feel",
        ]},
        { id: "st3", label: "Retention & Growth", evidence: [
          "Designed an onboarding flow that improves activation",
          "Run a churn analysis and acted on it",
          "Built a feedback loop (surveys, interviews, NPS)",
        ]},
      ]},
    ],
  },
  {
    id: "build", label: "Build", icon: "▲", color: "#3B82F6",
    desc: "Ship fast, ship solid, iterate relentlessly.",
    branches: [
      { id: "ui", label: "UI / Frontend", skills: [
        { id: "ui1", label: "Design", evidence: [
          "Designed a UI from scratch (not a template)",
          "Built a responsive layout that works on mobile",
          "Used a design tool (Figma, Sketch) for mockups",
          "Implemented a component/design system",
        ]},
        { id: "ui2", label: "Architecture", evidence: [
          "Built a SPA with a frontend framework",
          "Handled complex client-side state management",
          "Implemented SSR or SSG for performance/SEO",
          "Optimized a frontend for Core Web Vitals",
        ]},
        { id: "ui3", label: "UX & Accessibility", evidence: [
          "Conducted usability testing with real users",
          "Implemented keyboard nav and screen reader support",
          "Designed an onboarding flow that reduced drop-off",
        ]},
      ]},
      { id: "api", label: "API / Backend", skills: [
        { id: "api1", label: "System Design", evidence: [
          "Designed and built a REST or GraphQL API",
          "Handled async processing (queues, workers, cron)",
          "Designed a system handling 1000+ concurrent users",
          "Integrated third-party APIs (payments, auth, email)",
        ]},
        { id: "api2", label: "Schema / Data", evidence: [
          "Designed a normalized database schema",
          "Written and managed database migrations",
          "Optimized slow queries with indexing",
          "Worked with both SQL and NoSQL databases",
        ]},
        { id: "api3", label: "Auth & Security", evidence: [
          "Implemented authentication (OAuth, JWT, sessions)",
          "Set up role-based access control",
          "Handled input validation and injection prevention",
          "Implemented rate limiting and CSRF protection",
        ]},
      ]},
      { id: "devops", label: "DevOps / Infra", skills: [
        { id: "dev1", label: "Hosting & Deploy", evidence: [
          "Deployed an app to a cloud provider",
          "Configured custom domain with SSL",
          "Used containers (Docker) in production",
          "Set up a CDN for static assets",
        ]},
        { id: "dev2", label: "Observability", evidence: [
          "Set up structured application logging",
          "Configured uptime monitoring and alerting",
          "Debugged a production incident using logs/traces",
        ]},
        { id: "dev3", label: "CI/CD & Testing", evidence: [
          "Written automated tests (unit, integration, e2e)",
          "Set up CI/CD pipeline with tests on every push",
          "Used staging environments before prod deploys",
        ]},
      ]},
      { id: "ai", label: "AI & Automation", skills: [
        { id: "ai1", label: "AI-Assisted Dev", evidence: [
          "Regularly use AI tools to accelerate coding",
          "Integrated an LLM/AI API into a product feature",
          "Built an AI workflow that replaced manual work",
        ]},
        { id: "ai2", label: "Automation", evidence: [
          "Automated a repetitive task with scripts or tools",
          "Built a data pipeline that runs unattended",
          "Set up automated backups or maintenance tasks",
        ]},
      ]},
    ],
  },
  {
    id: "sell", label: "Sell", icon: "●", color: "#10B981",
    desc: "Get attention, build trust, convert strangers to customers.",
    branches: [
      { id: "copy", label: "Copywriting", skills: [
        { id: "cp1", label: "Cold Outreach", evidence: [
          "Sent cold DMs/emails that got replies",
          "A/B tested outreach and improved response rates",
          "Booked a meeting or sale from cold outreach",
        ]},
        { id: "cp2", label: "Email Marketing", evidence: [
          "Set up an email list with a signup form",
          "Written a drip/nurture sequence",
          "Achieved >25% open rates consistently",
          "Driven revenue directly from an email campaign",
        ]},
        { id: "cp3", label: "Landing Pages", evidence: [
          "Written a landing page with clear value prop",
          "Optimized a page for conversion (CTA, social proof)",
          "Achieved a >3% conversion rate on a landing page",
        ]},
      ]},
      { id: "seo", label: "SEO / AEO", skills: [
        { id: "se1", label: "Content SEO", evidence: [
          "Done keyword research and published optimized content",
          "Ranked a page on the first page of Google",
          "Built backlinks intentionally (guest posts, outreach)",
        ]},
        { id: "se2", label: "Technical SEO", evidence: [
          "Optimized site speed, structured data, meta tags",
          "Submitted sitemap and managed Search Console",
          "Fixed crawl errors and improved indexing",
        ]},
        { id: "se3", label: "AI Engine Optimization", evidence: [
          "Understand how LLMs surface recommendations",
          "Optimized content to appear in AI-generated answers",
        ]},
      ]},
      { id: "content", label: "Content & Social", skills: [
        { id: "co1", label: "Short-Form Video", evidence: [
          "Created and published Reels/TikToks/Shorts",
          "Had a video get 10K+ views",
          "Post short-form content on a consistent schedule",
        ]},
        { id: "co2", label: "Long-Form Content", evidence: [
          "Published blog posts, YouTube videos, or podcasts",
          "Built a content backlog with consistent cadence",
          "Repurposed one piece across multiple formats",
        ]},
        { id: "co3", label: "Community", evidence: [
          "Built or manage a community (Discord, Slack, forum)",
          "Have an engaged audience that responds to content",
          "Turned community members into customers",
        ]},
        { id: "co4", label: "Collabs & Partnerships", evidence: [
          "Done a collab (guest post, joint live, podcast swap)",
          "Built a referral or affiliate partnership",
        ]},
      ]},
      { id: "paid", label: "Paid Distribution", skills: [
        { id: "pd1", label: "Paid Ads", evidence: [
          "Run a paid ad campaign (Google, Meta, etc.)",
          "Achieved a positive ROAS on a campaign",
          "Set up retargeting for website visitors",
        ]},
      ]},
    ],
  },
  {
    id: "sustain", label: "Sustain", icon: "■", color: "#EF4444",
    desc: "The unglamorous stuff that keeps you alive and sane.",
    branches: [
      { id: "ops", label: "Ops & Legal", skills: [
        { id: "op1", label: "Business Foundations", evidence: [
          "Registered a business entity",
          "Handle taxes or have a CPA",
          "Have Terms of Service and Privacy Policy live",
          "Track expenses and revenue in a bookkeeping system",
        ]},
        { id: "op2", label: "Customer Support", evidence: [
          "Have a system for handling support requests",
          "Written help docs or a knowledge base",
          "Respond to support within 24 hours consistently",
        ]},
      ]},
      { id: "self", label: "Personal", skills: [
        { id: "ps1", label: "Sustainability", evidence: [
          "Have a weekly routine that protects deep work time",
          "Take regular breaks with boundaries around work hours",
          "Have a personal revenue target I'm working toward",
          "Know which tasks to outsource vs. do myself",
        ]},
      ]},
    ],
  },
];

const ALL_SKILLS = SKILL_TREE.flatMap(p =>
  p.branches.flatMap(b => b.skills.map(s => ({ ...s, pillarId: p.id, branchId: b.id })))
);
const ALL_EVIDENCE = ALL_SKILLS.flatMap(s => s.evidence.map((e, i) => ({ skillId: s.id, idx: i })));
const TOTAL_EVIDENCE = ALL_EVIDENCE.length;

const VERSION = "1.0";
const APP_NAME = "proofwork";

/* ═══════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════ */
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
    const data = checksToExport(checks, "");
    const json = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch { return null; }
}

function decompressFromUrl(str) {
  try {
    const json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
  } catch { return null; }
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function ProofWork() {
  const [checks, setChecks] = useState(() => {
    try { const saved = localStorage.getItem("proofwork:checks"); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("map");
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem("proofwork:notes") || ""; }
    catch { return ""; }
  });
  const [compareData, setCompareData] = useState(null);
  const [compareLabel, setCompareLabel] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const fileRef = useRef(null);
  const compareRef = useRef(null);

  // Auto-save to localStorage
  useEffect(() => {
    try { localStorage.setItem("proofwork:checks", JSON.stringify(checks)); } catch {}
  }, [checks]);

  useEffect(() => {
    try { localStorage.setItem("proofwork:notes", notes); } catch {}
  }, [notes]);

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
          showToast(`Loaded shared snapshot: ${imported.label}`);
        }
      }
    }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

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
    a.download = `proofwork-${getMonthLabel()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded proofwork-${getMonthLabel()}.json`);
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
          setCompareData(null);
          showToast(`Loaded snapshot: ${imported.label}`);
        } else {
          showToast("Invalid file format");
        }
      } catch { showToast("Failed to parse JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Compare ── */
  const handleCompare = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const imported = importChecks(data);
        if (imported) {
          setCompareData(imported.checks);
          setCompareLabel(imported.label);
          setView("compare");
          showToast(`Comparing against: ${imported.label}`);
        } else { showToast("Invalid file format"); }
      } catch { showToast("Failed to parse JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── Share URL ── */
  const handleShare = () => {
    const encoded = compressToUrl(checks);
    if (encoded) {
      const url = `${window.location.origin}${window.location.pathname}#s=${encoded}`;
      navigator.clipboard?.writeText(url).then(() => showToast("Share link copied to clipboard"));
      setShareUrl(url);
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    if (confirm("Clear all checkmarks? Make sure you've exported first.")) {
      setChecks({});
      setNotes("");
      setCompareData(null);
      try { localStorage.removeItem("proofwork:checks"); localStorage.removeItem("proofwork:notes"); } catch {}
      showToast("All progress cleared");
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
    if (!compareData) return { gained: [], lost: [], unchanged: 0 };
    const gained = [];
    const lost = [];
    let unchanged = 0;
    ALL_EVIDENCE.forEach(({ skillId, idx }) => {
      const key = `${skillId}:${idx}`;
      const now = !!checks[key];
      const then = !!compareData[key];
      if (now && !then) gained.push(key);
      else if (!now && then) lost.push(key);
      else if (now && then) unchanged++;
    });
    return { gained, lost, unchanged };
  }, [checks, compareData]);

  /* ═══ RENDER ═══ */
  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060B",
      color: "#C8C8D0",
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: slideUp 0.2s ease-out; }
        ::selection { background: #3B82F644; }
        input[type="file"] { display: none; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 8,
          padding: "10px 20px", fontSize: 12, color: "#10B981", zIndex: 999,
          animation: "toastIn 0.25s ease-out", fontFamily: "inherit",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 14px 60px" }}>
        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
              proofwork
            </h1>
            <span style={{
              fontSize: 9, background: "#1a1a28", color: "#555", padding: "2px 8px",
              borderRadius: 3, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
            }}>v{VERSION}</span>
          </div>
          <p style={{ fontSize: 11, color: "#555", marginTop: 6, lineHeight: 1.6 }}>
            Evidence-based skill tracker for solopreneurs. Don't rate yourself — prove it.
            <br/>Export snapshots monthly. Compare over time. Share your proof.
          </p>
        </div>

        {/* ─── TOOLBAR ─── */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20,
          padding: "12px 14px", background: "#0a0a12", borderRadius: 8,
          border: "1px solid #14141e",
        }}>
          <ToolBtn label="↓ Export" onClick={handleExport} accent="#3B82F6" />
          <ToolBtn label="↑ Load" onClick={() => fileRef.current?.click()} accent="#10B981" />
          <ToolBtn label="⇄ Compare" onClick={() => compareRef.current?.click()} accent="#E2A735" />
          <ToolBtn label="⎘ Share URL" onClick={handleShare} accent="#A855F7" />
          <ToolBtn label="✎ Notes" onClick={() => setShowNotes(!showNotes)} accent={showNotes ? "#fff" : "#666"} />
          <div style={{ flex: 1 }} />
          <ToolBtn label="expand all" onClick={expandAll} accent="#555" subtle />
          <ToolBtn label="collapse" onClick={collapseAll} accent="#555" subtle />
          <ToolBtn label="reset" onClick={handleReset} accent="#EF4444" subtle />
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} />
          <input ref={compareRef} type="file" accept=".json" onChange={handleCompare} />
        </div>

        {/* ─── NOTES ─── */}
        {showNotes && (
          <div className="anim" style={{ marginBottom: 16 }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes for this snapshot — goals, reflections, what you're focusing on..."
              style={{
                width: "100%", minHeight: 72, padding: 12, background: "#0c0c14",
                border: "1px solid #1e1e2e", borderRadius: 6, color: "#aaa",
                fontSize: 12, fontFamily: "inherit", resize: "vertical", outline: "none",
              }}
            />
          </div>
        )}

        {/* ─── SHARE URL DISPLAY ─── */}
        {shareUrl && (
          <div className="anim" style={{
            marginBottom: 16, padding: "10px 14px", background: "#0e0a18",
            border: "1px solid #A855F733", borderRadius: 6, fontSize: 11,
            wordBreak: "break-all", color: "#A855F7", lineHeight: 1.5,
          }}>
            <span style={{ color: "#666" }}>Share link: </span>{shareUrl}
          </div>
        )}

        {/* ─── STATS ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 6, marginBottom: 20,
        }}>
          <StatCard label="Proven" val={`${overallPct}%`} sub={`${totalDone} of ${TOTAL_EVIDENCE}`} color="#fff" big />
          {SKILL_TREE.map(p => (
            <StatCard key={p.id} label={p.label} val={`${getPillarPct(p)}%`} color={p.color} icon={p.icon} />
          ))}
        </div>

        {/* ─── VIEW TABS ─── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[
            { key: "map", label: "Skill Map" },
            { key: "gaps", label: "Gaps" },
            { key: "radar", label: "Radar" },
            ...(compareData ? [{ key: "compare", label: `vs ${compareLabel}` }] : []),
          ].map(t => (
            <button key={t.key} onClick={() => setView(t.key)} style={{
              background: view === t.key ? "#16162a" : "transparent",
              color: view === t.key ? "#fff" : "#444",
              border: `1px solid ${view === t.key ? "#2a2a44" : "transparent"}`,
              borderRadius: 5, padding: "5px 14px", fontSize: 11, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 1, fontFamily: "inherit",
              fontWeight: view === t.key ? 600 : 400,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ MAP VIEW ═══ */}
        {view === "map" && SKILL_TREE.map(pillar => (
          <PillarSection key={pillar.id} pillar={pillar} checks={checks} expanded={expanded}
            toggle={toggle} toggleExpand={toggleExpand} getSkillPct={getSkillPct}
            getBranchPct={getBranchPct} getPillarPct={getPillarPct} />
        ))}

        {/* ═══ GAPS VIEW ═══ */}
        {view === "gaps" && (
          <div className="anim">
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>
              Skills with less than 50% evidence. This is your growth roadmap — focus here.
            </p>
            {gaps.length === 0 ? (
              <p style={{ color: "#10B981", fontSize: 13 }}>No major gaps — you're well-rounded!</p>
            ) : gaps.map((s, i) => {
              const pillar = SKILL_TREE.find(p => p.id === s.pillarId);
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: "#0a0a12",
                  border: `1px solid ${i === 0 ? "#2a1515" : "#14141e"}`,
                  borderRadius: 6, marginBottom: 4,
                }}>
                  <span style={{ fontSize: 10, color: "#333", fontWeight: 700, minWidth: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, color: "#ccc", flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: pillar?.color, opacity: 0.6 }}>
                    {pillar?.icon} {pillar?.label}
                  </span>
                  <MiniBar value={s.pct} color={pillar?.color} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: "right",
                    color: s.pct === 0 ? "#EF4444" : "#E2A735",
                  }}>{s.pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ RADAR VIEW ═══ */}
        {view === "radar" && <RadarChart pillars={SKILL_TREE} getBranchPct={getBranchPct} />}

        {/* ═══ COMPARE VIEW ═══ */}
        {view === "compare" && compareData && (
          <div className="anim">
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20,
            }}>
              <StatCard label="Gained" val={`+${compareDiffs.gained.length}`} color="#10B981" />
              <StatCard label="Lost" val={`-${compareDiffs.lost.length}`} color="#EF4444" />
              <StatCard label="Kept" val={String(compareDiffs.unchanged)} color="#3B82F6" />
            </div>

            <h3 style={{ fontSize: 12, color: "#10B981", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              ✦ Newly proven since {compareLabel}
            </h3>
            {compareDiffs.gained.length === 0 ? (
              <p style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>No new evidence added.</p>
            ) : (
              <div style={{ marginBottom: 20 }}>
                {compareDiffs.gained.map(key => {
                  const [sid, idx] = key.split(":");
                  const skill = ALL_SKILLS.find(s => s.id === sid);
                  return (
                    <div key={key} style={{
                      padding: "6px 12px", fontSize: 12, color: "#10B981",
                      borderLeft: "2px solid #10B98144", marginBottom: 2, marginLeft: 8,
                    }}>
                      <span style={{ color: "#555" }}>{skill?.label}: </span>
                      {skill?.evidence[Number(idx)]}
                    </div>
                  );
                })}
              </div>
            )}

            {compareDiffs.lost.length > 0 && (
              <>
                <h3 style={{ fontSize: 12, color: "#EF4444", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  ✦ Unchecked since {compareLabel}
                </h3>
                <div style={{ marginBottom: 20 }}>
                  {compareDiffs.lost.map(key => {
                    const [sid, idx] = key.split(":");
                    const skill = ALL_SKILLS.find(s => s.id === sid);
                    return (
                      <div key={key} style={{
                        padding: "6px 12px", fontSize: 12, color: "#EF4444",
                        borderLeft: "2px solid #EF444444", marginBottom: 2, marginLeft: 8,
                      }}>
                        <span style={{ color: "#555" }}>{skill?.label}: </span>
                        {skill?.evidence[Number(idx)]}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Per-pillar comparison */}
            <h3 style={{ fontSize: 12, color: "#888", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Pillar breakdown
            </h3>
            {SKILL_TREE.map(pillar => {
              const nowPct = getPillarPct(pillar);
              const oldAll = pillar.branches.flatMap(b => b.skills.flatMap(s => s.evidence.map((_, i) => `${s.id}:${i}`)));
              const oldDone = oldAll.filter(k => compareData[k]).length;
              const oldPct = Math.round((oldDone / oldAll.length) * 100);
              const diff = nowPct - oldPct;
              return (
                <div key={pillar.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 14px", marginBottom: 4,
                  background: "#0a0a12", borderRadius: 6, border: "1px solid #14141e",
                }}>
                  <span style={{ color: pillar.color, fontSize: 14 }}>{pillar.icon}</span>
                  <span style={{ fontSize: 13, color: "#bbb", flex: 1 }}>{pillar.label}</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{oldPct}%</span>
                  <span style={{ fontSize: 11, color: "#555" }}>→</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: pillar.color }}>{nowPct}%</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: "right",
                    color: diff > 0 ? "#10B981" : diff < 0 ? "#EF4444" : "#444",
                  }}>
                    {diff > 0 ? `+${diff}` : diff}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div style={{
          marginTop: 40, paddingTop: 20, borderTop: "1px solid #111",
          fontSize: 10, color: "#333", textAlign: "center", lineHeight: 1.8,
        }}>
          <strong style={{ color: "#444" }}>proofwork</strong> — don't rate yourself, prove it
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
      background: subtle ? "transparent" : "#10101a",
      color: accent, border: `1px solid ${subtle ? "transparent" : accent + "33"}`,
      borderRadius: 5, padding: subtle ? "4px 8px" : "5px 12px",
      fontSize: subtle ? 10 : 11, cursor: "pointer", fontFamily: "inherit",
      fontWeight: 500, letterSpacing: 0.5, whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

function StatCard({ label, val, sub, color, big, icon }) {
  return (
    <div style={{
      background: "#0a0a12", border: "1px solid #14141e", borderRadius: 7,
      padding: big ? "12px 16px" : "10px 14px",
    }}>
      <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 4 }}>
        {icon && <span style={{ color, fontSize: 10 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: big ? 22 : 18, fontWeight: 700, color, marginTop: 3 }}>{val}</div>
      {sub && <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, color, width = 48 }) {
  return (
    <div style={{ width, height: 3, background: "#14141e", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, opacity: 0.7, borderRadius: 2, transition: "width 0.3s" }} />
    </div>
  );
}

function SkillDot({ pct, color }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
      background: pct === 100 ? color : pct > 0 ? color + "44" : "#1a1a24",
      border: `1.5px solid ${pct > 0 ? color + "88" : "#222"}`,
    }} />
  );
}

function PillarSection({ pillar, checks, expanded, toggle, toggleExpand, getSkillPct, getBranchPct, getPillarPct }) {
  const pPct = getPillarPct(pillar);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "14px 0 10px",
        borderBottom: `1px solid ${pillar.color}18`,
      }}>
        <span style={{ fontSize: 14, color: pillar.color }}>{pillar.icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 15, fontWeight: 700, color: pillar.color,
            textTransform: "uppercase", letterSpacing: 2,
          }}>{pillar.label}</span>
          <span style={{ fontSize: 10, color: "#444", marginLeft: 10 }}>{pillar.desc}</span>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 700,
          color: pPct > 60 ? "#10B981" : pPct > 25 ? "#E2A735" : "#444",
        }}>{pPct}%</span>
      </div>

      {pillar.branches.map(branch => {
        const bPct = getBranchPct(branch);
        const isOpen = expanded[branch.id];
        return (
          <div key={branch.id} style={{ marginLeft: 14, borderLeft: `1px solid ${pillar.color}15` }}>
            <button onClick={() => toggleExpand(branch.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 14px", background: isOpen ? "#0c0c16" : "transparent",
              border: "none", borderRadius: "0 5px 5px 0", cursor: "pointer",
              color: "#C8C8D0", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{ fontSize: 13, color: isOpen ? "#eee" : "#888", fontWeight: isOpen ? 600 : 400, flex: 1 }}>
                {branch.label}
              </span>
              <MiniBar value={bPct} color={pillar.color} />
              <span style={{
                fontSize: 11, fontWeight: 600, minWidth: 30, textAlign: "right",
                color: bPct > 60 ? "#10B981" : bPct > 25 ? "#E2A735" : "#444",
              }}>{bPct}%</span>
              <span style={{ color: "#333", fontSize: 11, transform: isOpen ? "rotate(90deg)" : "none", transition: "0.15s" }}>▸</span>
            </button>

            {isOpen && (
              <div className="anim" style={{ padding: "2px 0 6px 14px" }}>
                {branch.skills.map(skill => {
                  const sPct = getSkillPct(skill);
                  const isSkillOpen = expanded[skill.id];
                  const done = skill.evidence.filter((_, i) => checks[`${skill.id}:${i}`]).length;
                  return (
                    <div key={skill.id}>
                      <button onClick={() => toggleExpand(skill.id)} style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "6px 10px", background: isSkillOpen ? "#0a0a14" : "transparent",
                        border: "none", borderRadius: 4, cursor: "pointer",
                        color: "#C8C8D0", fontFamily: "inherit", textAlign: "left",
                      }}>
                        <SkillDot pct={sPct} color={pillar.color} />
                        <span style={{ fontSize: 12, color: isSkillOpen ? "#ddd" : "#999", flex: 1 }}>
                          {skill.label}
                        </span>
                        <span style={{ fontSize: 10, color: "#333" }}>{done}/{skill.evidence.length}</span>
                      </button>
                      {isSkillOpen && (
                        <div className="anim" style={{ padding: "2px 0 4px 26px" }}>
                          {skill.evidence.map((ev, idx) => {
                            const key = `${skill.id}:${idx}`;
                            const checked = !!checks[key];
                            return (
                              <label key={idx} style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "4px 8px", borderRadius: 3, cursor: "pointer",
                                fontSize: 11, lineHeight: 1.6,
                                color: checked ? "#10B981" : "#888",
                                textDecoration: checked ? "line-through" : "none",
                                opacity: checked ? 0.6 : 1,
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
  const size = 360;
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 55;

  const pts = branches.map((b, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct = getBranchPct(b) / 100;
    return {
      b, a,
      x: cx + Math.cos(a) * maxR * pct,
      y: cy + Math.sin(a) * maxR * pct,
      lx: cx + Math.cos(a) * (maxR + 35),
      ly: cy + Math.sin(a) * (maxR + 35),
      fx: cx + Math.cos(a) * maxR,
      fy: cy + Math.sin(a) * maxR,
    };
  });

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[.2, .4, .6, .8, 1].map(r => (
          <circle key={r} cx={cx} cy={cy} r={maxR * r} fill="none" stroke="#14141e" strokeWidth={0.5} />
        ))}
        {pts.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.fx} y2={p.fy} stroke="#14141e" strokeWidth={0.5} />
        ))}
        <path d={path} fill="rgba(59,130,246,0.06)" stroke="#3B82F6" strokeWidth={1.5} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill={p.b.pillar.color} />
            <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
              fill={p.b.pillar.color} fontSize={8} fontWeight={600}
              fontFamily="'IBM Plex Mono', monospace">
              {p.b.label}
            </text>
            <text x={p.lx} y={p.ly + 12} textAnchor="middle" dominantBaseline="middle"
              fill="#444" fontSize={8} fontFamily="'IBM Plex Mono', monospace">
              {getBranchPct(p.b)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
