import { useState, useMemo, useCallback, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   SKILL TREE DATA
   ═══════════════════════════════════════════ */
const SKILL_TREE = [
  {
    id: "think", label: "Think", icon: "◆", color: "#E8A040",
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
    id: "build", label: "Build", icon: "▲", color: "#818CF8",
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
    id: "sell", label: "Sell", icon: "●", color: "#34D399",
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
    id: "sustain", label: "Sustain", icon: "■", color: "#FB7185",
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
const APP_NAME = "skillsmap";

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
export default function SkillsMap() {
  const [checks, setChecks] = useState(() => {
    try { const saved = localStorage.getItem("skillsmap:checks"); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("map");
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem("skillsmap:notes") || ""; }
    catch { return ""; }
  });
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const fileRef = useRef(null);
  const compareRefA = useRef(null);
  const compareRefB = useRef(null);

  // Auto-save to localStorage
  useEffect(() => {
    try { localStorage.setItem("skillsmap:checks", JSON.stringify(checks)); } catch {}
  }, [checks]);

  useEffect(() => {
    try { localStorage.setItem("skillsmap:notes", notes); } catch {}
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
    a.download = `skillsmap-${getMonthLabel()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded skillsmap-${getMonthLabel()}.json`);
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
          showToast(`Loaded snapshot: ${imported.label}`);
        } else {
          showToast("Invalid file format");
        }
      } catch { showToast("Failed to parse JSON"); }
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
          showToast(`Loaded snapshot ${slot}: ${imported.label}`);
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
      setCompareA(null);
      setCompareB(null);
      try { localStorage.removeItem("skillsmap:checks"); localStorage.removeItem("skillsmap:notes"); } catch {}
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
    <div style={{
      minHeight: "100vh",
      background: "#110F0D",
      color: "#EDEBE8",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastSlide { from { opacity:0; transform:translate(-50%,16px); } to { opacity:1; transform:translate(-50%,0); } }
        @keyframes subtlePulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        .fade-up { animation: fadeUp 0.25s ease-out both; }
        ::selection { background: #E8A04044; }
        input[type="file"] { display: none; }
        button { font-family: inherit; }
        button:focus-visible { outline: 2px solid #E8A040; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #332F2B; border-radius: 3px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#1A1816", border: "1px solid #E8A04033", borderRadius: 10,
          padding: "11px 22px", fontSize: 12, color: "#E8A040", zIndex: 999,
          animation: "toastSlide 0.3s ease-out", fontFamily: "inherit",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,160,64,0.08)",
          letterSpacing: 0.3,
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#EDEBE8", letterSpacing: "-1px",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}>
              skillsmap
            </h1>
            <span style={{
              fontSize: 9, background: "#1A1816", color: "#807B75", padding: "3px 9px",
              borderRadius: 4, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
              border: "1px solid #252220",
            }}>v{VERSION}</span>
          </div>
          <p style={{ fontSize: 11, color: "#807B75", marginTop: 8, lineHeight: 1.7 }}>
            Evidence-based skill tracker for solopreneurs. Don't rate yourself — prove it.
            <br/>Export snapshots monthly. Compare over time. Share your proof.
          </p>
        </div>

        {/* ─── TOOLBAR ─── */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22,
          padding: "12px 14px", background: "#1A1816", borderRadius: 10,
          border: "1px solid #252220",
        }}>
          <ToolBtn label="Export" onClick={handleExport} accent="#818CF8" />
          <ToolBtn label="Load" onClick={() => fileRef.current?.click()} accent="#34D399" />
          <ToolBtn label="Share URL" onClick={handleShare} accent="#E8A040" />
          <ToolBtn label="Notes" onClick={() => setShowNotes(!showNotes)} accent={showNotes ? "#EDEBE8" : "#807B75"} />
          <div style={{ flex: 1 }} />
          <ToolBtn label="expand all" onClick={expandAll} accent="#807B75" subtle />
          <ToolBtn label="collapse" onClick={collapseAll} accent="#807B75" subtle />
          <ToolBtn label="reset" onClick={handleReset} accent="#FB7185" subtle />
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
                width: "100%", minHeight: 76, padding: 14, background: "#1A1816",
                border: "1px solid #252220", borderRadius: 8, color: "#A8A29E",
                fontSize: 12, fontFamily: "inherit", resize: "vertical", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#E8A04055"}
              onBlur={e => e.target.style.borderColor = "#252220"}
            />
          </div>
        )}

        {/* ─── SHARE URL DISPLAY ─── */}
        {shareUrl && (
          <div className="fade-up" style={{
            marginBottom: 18, padding: "11px 16px", background: "#1A1816",
            border: "1px solid #E8A04022", borderRadius: 8, fontSize: 11,
            wordBreak: "break-all", color: "#E8A040", lineHeight: 1.5,
          }}>
            <span style={{ color: "#807B75" }}>Share link: </span>{shareUrl}
          </div>
        )}

        {/* ─── STATS ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8, marginBottom: 22,
        }}>
          <StatCard label="Proven" val={`${overallPct}%`} sub={`${totalDone} of ${TOTAL_EVIDENCE}`} color="#EDEBE8" big />
          {SKILL_TREE.map(p => (
            <StatCard key={p.id} label={p.label} val={`${getPillarPct(p)}%`} color={p.color} icon={p.icon} />
          ))}
        </div>

        {/* ─── VIEW TABS ─── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
          {[
            { key: "map", label: "Skill Map" },
            { key: "gaps", label: "Gaps" },
            { key: "radar", label: "Radar" },
            { key: "compare", label: "Compare" },
          ].map(t => (
            <button key={t.key} onClick={() => setView(t.key)} style={{
              background: view === t.key ? "#252220" : "transparent",
              color: view === t.key ? "#EDEBE8" : "#807B75",
              border: `1px solid ${view === t.key ? "#332F2B" : "transparent"}`,
              borderRadius: 6, padding: "6px 16px", fontSize: 11, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 1, fontFamily: "inherit",
              fontWeight: view === t.key ? 600 : 400,
              transition: "all 0.15s",
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
          <div className="fade-up">
            <p style={{ fontSize: 12, color: "#807B75", marginBottom: 18, lineHeight: 1.6 }}>
              Skills with less than 50% evidence. This is your growth roadmap — focus here.
            </p>
            {gaps.length === 0 ? (
              <p style={{ color: "#34D399", fontSize: 13 }}>No major gaps — you're well-rounded!</p>
            ) : gaps.map((s, i) => {
              const pillar = SKILL_TREE.find(p => p.id === s.pillarId);
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", background: "#1A1816",
                  border: `1px solid ${i === 0 ? "#3D2020" : "#252220"}`,
                  borderRadius: 8, marginBottom: 5,
                }}>
                  <span style={{ fontSize: 10, color: "#807B75", fontWeight: 700, minWidth: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, color: "#EDEBE8", flex: 1, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: pillar?.color, opacity: 0.7 }}>
                    {pillar?.icon} {pillar?.label}
                  </span>
                  <MiniBar value={s.pct} color={pillar?.color} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: "right",
                    color: s.pct === 0 ? "#FB7185" : "#E8A040",
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
            {/* Upload zones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <CompareDropZone
                label="Snapshot A"
                sublabel="Before"
                data={compareA}
                onUpload={() => compareRefA.current?.click()}
                onClear={() => setCompareA(null)}
                color="#818CF8"
              />
              <CompareDropZone
                label="Snapshot B"
                sublabel="After"
                data={compareB}
                onUpload={() => compareRefB.current?.click()}
                onClear={() => setCompareB(null)}
                color="#E8A040"
              />
            </div>
            <input ref={compareRefA} type="file" accept=".json" onChange={(e) => handleCompareFile(e, "A")} />
            <input ref={compareRefB} type="file" accept=".json" onChange={(e) => handleCompareFile(e, "B")} />

            {/* Prompt when not ready */}
            {(!compareA || !compareB) && (
              <p style={{ fontSize: 12, color: "#807B75", textAlign: "center", padding: "20px 0", lineHeight: 1.7 }}>
                Upload two exported snapshots to compare your progress over time.
              </p>
            )}

            {/* Results when both loaded */}
            {compareDiffs && (
              <>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24,
                }}>
                  <StatCard label="Gained" val={`+${compareDiffs.gained.length}`} color="#34D399" />
                  <StatCard label="Lost" val={`-${compareDiffs.lost.length}`} color="#FB7185" />
                  <StatCard label="Kept" val={String(compareDiffs.unchanged)} color="#818CF8" />
                </div>

                <h3 style={{
                  fontSize: 12, color: "#34D399", marginBottom: 12, letterSpacing: 1,
                  textTransform: "uppercase", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
                }}>
                  New in {compareB.label}
                </h3>
                {compareDiffs.gained.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#807B75", marginBottom: 24 }}>No new evidence between snapshots.</p>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    {compareDiffs.gained.map(key => {
                      const [sid, idx] = key.split(":");
                      const skill = ALL_SKILLS.find(s => s.id === sid);
                      return (
                        <div key={key} style={{
                          padding: "7px 14px", fontSize: 12, color: "#34D399",
                          borderLeft: "2px solid #34D39944", marginBottom: 2, marginLeft: 8,
                        }}>
                          <span style={{ color: "#807B75" }}>{skill?.label}: </span>
                          {skill?.evidence[Number(idx)]}
                        </div>
                      );
                    })}
                  </div>
                )}

                {compareDiffs.lost.length > 0 && (
                  <>
                    <h3 style={{
                      fontSize: 12, color: "#FB7185", marginBottom: 12, letterSpacing: 1,
                      textTransform: "uppercase", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
                    }}>
                      Removed since {compareA.label}
                    </h3>
                    <div style={{ marginBottom: 24 }}>
                      {compareDiffs.lost.map(key => {
                        const [sid, idx] = key.split(":");
                        const skill = ALL_SKILLS.find(s => s.id === sid);
                        return (
                          <div key={key} style={{
                            padding: "7px 14px", fontSize: 12, color: "#FB7185",
                            borderLeft: "2px solid #FB718544", marginBottom: 2, marginLeft: 8,
                          }}>
                            <span style={{ color: "#807B75" }}>{skill?.label}: </span>
                            {skill?.evidence[Number(idx)]}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Per-pillar comparison */}
                <h3 style={{
                  fontSize: 12, color: "#A8A29E", marginBottom: 12, letterSpacing: 1,
                  textTransform: "uppercase", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
                }}>
                  Pillar breakdown
                </h3>
                {SKILL_TREE.map(pillar => {
                  const allKeys = pillar.branches.flatMap(b => b.skills.flatMap(s => s.evidence.map((_, i) => `${s.id}:${i}`)));
                  const aDone = allKeys.filter(k => compareA.checks[k]).length;
                  const bDone = allKeys.filter(k => compareB.checks[k]).length;
                  const aPct = Math.round((aDone / allKeys.length) * 100);
                  const bPct = Math.round((bDone / allKeys.length) * 100);
                  const diff = bPct - aPct;
                  return (
                    <div key={pillar.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", marginBottom: 5,
                      background: "#1A1816", borderRadius: 8, border: "1px solid #252220",
                    }}>
                      <span style={{ color: pillar.color, fontSize: 14 }}>{pillar.icon}</span>
                      <span style={{
                        fontSize: 13, color: "#EDEBE8", flex: 1,
                        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500,
                      }}>{pillar.label}</span>
                      <span style={{ fontSize: 11, color: "#807B75" }}>{aPct}%</span>
                      <span style={{ fontSize: 11, color: "#807B75" }}>→</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: pillar.color }}>{bPct}%</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: "right",
                        color: diff > 0 ? "#34D399" : diff < 0 ? "#FB7185" : "#807B75",
                      }}>
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
          marginTop: 48, paddingTop: 24, borderTop: "1px solid #252220",
          fontSize: 10, color: "#807B75", textAlign: "center", lineHeight: 1.9,
        }}>
          <strong style={{ color: "#A8A29E", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, letterSpacing: "-0.3px" }}>skillsmap</strong> — don't rate yourself, prove it
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
      background: subtle ? "transparent" : "#252220",
      color: accent, border: `1px solid ${subtle ? "transparent" : "#332F2B"}`,
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
      background: "#1A1816", border: "1px solid #252220", borderRadius: 10,
      padding: big ? "14px 18px" : "12px 16px",
      borderLeft: `3px solid ${color}33`,
    }}>
      <div style={{
        fontSize: 10, color: "#807B75", textTransform: "uppercase", letterSpacing: 1.2,
        display: "flex", alignItems: "center", gap: 5,
        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600,
      }}>
        {icon && <span style={{ color, fontSize: 10 }}>{icon}</span>}{label}
      </div>
      <div style={{
        fontSize: big ? 24 : 20, fontWeight: 700, color, marginTop: 4,
        fontFamily: "'Bricolage Grotesque', sans-serif",
      }}>{val}</div>
      {sub && <div style={{ fontSize: 10, color: "#807B75", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, color, width = 48 }) {
  return (
    <div style={{ width, height: 4, background: "#252220", borderRadius: 2, overflow: "hidden" }}>
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
      background: pct === 100 ? color : pct > 0 ? color + "44" : "#252220",
      border: `1.5px solid ${pct > 0 ? color + "88" : "#3D3835"}`,
      transition: "all 0.2s",
      boxShadow: pct === 100 ? `0 0 8px ${color}44` : "none",
    }} />
  );
}

function CompareDropZone({ label, sublabel, data, onUpload, onClear, color }) {
  return (
    <div
      onClick={data ? undefined : onUpload}
      style={{
        padding: data ? "18px 20px" : "28px 20px",
        border: `2px dashed ${data ? color + "55" : "#332F2B"}`,
        borderRadius: 12,
        background: data ? color + "08" : "#1A1816",
        textAlign: "center",
        cursor: data ? "default" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {data ? (
        <div>
          <div style={{ fontSize: 10, color: "#807B75", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 700, color,
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}>
            {data.label}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
            marginTop: 10, background: "transparent", border: `1px solid #332F2B`,
            color: "#807B75", fontSize: 10, padding: "4px 12px", borderRadius: 5,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            Remove
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 22, color: "#332F2B", marginBottom: 6, fontWeight: 300 }}>+</div>
          <div style={{ fontSize: 12, color: "#A8A29E", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 10, color: "#807B75", marginTop: 4 }}>{sublabel} — click to upload JSON</div>
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
            textTransform: "uppercase", letterSpacing: 2,
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}>{pillar.label}</span>
          <span style={{ fontSize: 10, color: "#807B75", marginLeft: 12 }}>{pillar.desc}</span>
        </div>
        <span style={{
          fontSize: 22, fontWeight: 700,
          color: pPct > 60 ? "#34D399" : pPct > 25 ? "#E8A040" : "#807B75",
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}>{pPct}%</span>
      </div>

      {pillar.branches.map(branch => {
        const bPct = getBranchPct(branch);
        const isOpen = expanded[branch.id];
        return (
          <div key={branch.id} style={{ marginLeft: 16, borderLeft: `1px solid ${pillar.color}18` }}>
            <button onClick={() => toggleExpand(branch.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 14px", background: isOpen ? "#1A1816" : "transparent",
              border: "none", borderRadius: "0 8px 8px 0", cursor: "pointer",
              color: "#EDEBE8", fontFamily: "inherit", textAlign: "left",
              transition: "background 0.15s",
            }}>
              <span style={{
                fontSize: 13, color: isOpen ? "#EDEBE8" : "#A8A29E", fontWeight: isOpen ? 600 : 400, flex: 1,
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}>
                {branch.label}
              </span>
              <MiniBar value={bPct} color={pillar.color} />
              <span style={{
                fontSize: 11, fontWeight: 600, minWidth: 30, textAlign: "right",
                color: bPct > 60 ? "#34D399" : bPct > 25 ? "#E8A040" : "#807B75",
              }}>{bPct}%</span>
              <span style={{
                color: "#807B75", fontSize: 11,
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
                        padding: "7px 10px", background: isSkillOpen ? "#1A1816" : "transparent",
                        border: "none", borderRadius: 6, cursor: "pointer",
                        color: "#EDEBE8", fontFamily: "inherit", textAlign: "left",
                        transition: "background 0.15s",
                      }}>
                        <SkillDot pct={sPct} color={pillar.color} />
                        <span style={{ fontSize: 12, color: isSkillOpen ? "#EDEBE8" : "#A8A29E", flex: 1 }}>
                          {skill.label}
                        </span>
                        <span style={{ fontSize: 10, color: "#807B75" }}>{done}/{skill.evidence.length}</span>
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
                                color: checked ? "#34D399" : "#A8A29E",
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
            <stop offset="0%" stopColor="#E8A040" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8A040" stopOpacity="0.02" />
          </radialGradient>
        </defs>
        {[.2, .4, .6, .8, 1].map(r => (
          <circle key={r} cx={cx} cy={cy} r={maxR * r} fill="none" stroke="#252220" strokeWidth={0.5} />
        ))}
        {pts.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.fx} y2={p.fy} stroke="#252220" strokeWidth={0.5} />
        ))}
        <path d={path} fill="url(#radarFill)" stroke="#E8A040" strokeWidth={1.5} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill={p.b.pillar.color} />
            <circle cx={p.x} cy={p.y} r={6} fill={p.b.pillar.color} opacity={0.15} />
            <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
              fill={p.b.pillar.color} fontSize={8} fontWeight={600}
              fontFamily="'Bricolage Grotesque', sans-serif">
              {p.b.label}
            </text>
            <text x={p.lx} y={p.ly + 13} textAnchor="middle" dominantBaseline="middle"
              fill="#807B75" fontSize={8} fontFamily="'JetBrains Mono', monospace">
              {getBranchPct(p.b)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
