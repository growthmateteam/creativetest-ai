import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Check, X, Upload, Shield, Zap, Target, CheckCircle2, FolderTree, Building2, TrendingUp, Trophy, Crosshair, Rocket, ShoppingBag, HelpCircle, ArrowRight } from "lucide-react";

const Section = ({ id, label, title, sub, children, className = "" }: {
  id?: string;
  label: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`mx-auto max-w-[1100px] px-10 py-16 ${className}`}>
    <div className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
      {label}
      <span className="h-px w-10 bg-primary/50" />
    </div>
    <h2 className="mb-3 max-w-[700px] font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.2] tracking-tight text-foreground">
      {title}
    </h2>
    {sub && <p className="mb-9 max-w-[540px] text-[0.95rem] leading-[1.7] text-muted-foreground">{sub}</p>}
    {children}
  </section>
);

const Index = () => {
  const [sessions, setSessions] = useState(4);
  const [spend, setSpend] = useState(2000);
  const [wastePct, setWastePct] = useState(15);

  const calc = useMemo(() => {
    const wastePerMonth = Math.round((spend * wastePct) / 100);
    const wastePerYear = wastePerMonth * 12;
    const cost = spend <= 1000 ? 49 : spend <= 5000 ? 99 : 199;
    const roi = Math.round(wastePerYear / (cost * 12));
    return { wastePerMonth, wastePerYear, cost, roi };
  }, [sessions, spend, wastePct]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-body text-foreground">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border/60 bg-background/85 px-6 py-5 backdrop-blur-xl md:px-14">
        <div className="font-display text-[1.35rem] font-extrabold tracking-tight">
          Creative<span className="bg-gradient-primary bg-clip-text text-transparent">Test.ai</span>
        </div>
        <ul className="hidden items-center gap-9 md:flex">
          <li><a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How it works</a></li>
          <li><a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a></li>
          <li><a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a></li>
        </ul>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg border border-border/80 px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-accent/10">
            Log in
          </Link>
          <Link to="/login" className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-90">
            Start free →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-10 pb-14 pt-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-[-20%] z-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse at center, hsl(var(--secondary) / 0.18) 0%, hsl(var(--primary) / 0.1) 40%, transparent 70%)" }} />

        <div className="relative z-10 mb-5 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.8rem] font-medium tracking-wider text-primary-glow" style={{ animationDelay: "0.1s" }}>
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-success shadow-[0_0_6px_hsl(var(--success))]" />
          For agencies and business owners running Facebook ads
        </div>

        <h1 className="relative z-10 mb-4 max-w-[860px] animate-fade-in-up font-display text-[clamp(2.6rem,5.5vw,4.8rem)] font-bold leading-[1.15] tracking-tight" style={{ animationDelay: "0.2s" }}>
          Launch Facebook ads in bulk<br />
          without <span className="bg-gradient-primary bg-clip-text text-transparent">accidentally wasting</span> your budget.
        </h1>

        <p className="relative z-10 mb-8 max-w-[540px] animate-fade-in-up text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.65] text-muted-foreground" style={{ animationDelay: "0.3s" }}>
          Upload up to 50 creatives at once, apply your saved settings template, and push everything live in one click — with the right settings locked in every time. No manual configuration. No missed toggles. No budget down the drain.
        </p>

        <div className="relative z-10 mb-10 flex animate-fade-in-up flex-wrap justify-center gap-3" style={{ animationDelay: "0.4s" }}>
          <Link to="/login" className="rounded-[10px] bg-gradient-primary px-9 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-95">
            Start Your Free Trial →
          </Link>
          <a href="#how-it-works" className="rounded-[10px] border border-border bg-card/60 px-9 py-4 text-base font-semibold text-foreground transition-colors hover:bg-card">
            See how it works
          </a>
        </div>

        <div className="relative z-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground" style={{ animationDelay: "0.5s" }}>
          {["50 creatives launched in one session", "Right settings, guaranteed every launch", "Free 7-day trial · No credit card"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 bg-primary/20">
                <Check className="h-2.5 w-2.5 text-primary-glow" strokeWidth={3} />
              </span>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT MOCKUP */}
      <div className="relative mx-auto max-w-[1100px] px-10 pb-16">
        <div className="pointer-events-none absolute left-1/2 top-[30%] h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, hsl(var(--secondary) / 0.12) 0%, transparent 70%)" }} />
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
          <div className="flex items-center gap-2 border-b border-border/60 bg-foreground/5 px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_85%_67%)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(40_98%_60%)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140_70%_47%)]" />
            <span className="ml-3 text-xs text-muted-foreground">CreativeTest.ai — New Launch Session</span>
          </div>
          <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-[220px_1fr]">
            <div className="hidden flex-col gap-1 border-r border-border/60 py-6 md:flex">
              <div className="px-5 pb-5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">My Account</div>
              {[
                { name: "Dashboard", active: false },
                { name: "New Launch", active: true },
                { name: "My Templates", active: false },
                { name: "Launch Log", active: false },
              ].map((item) => (
                <div key={item.name} className={`flex cursor-pointer items-center gap-2.5 border-l-[3px] px-5 py-2.5 text-[0.82rem] transition-colors ${item.active ? "border-primary bg-primary/10 text-primary-glow" : "border-transparent text-muted-foreground"}`}>
                  <span className="h-3.5 w-3.5 rounded-sm bg-current opacity-60" />
                  {item.name}
                </div>
              ))}
              <div className="mt-5 px-3">
                <div className="rounded-[10px] border border-primary/20 bg-primary/10 p-3.5">
                  <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-primary-glow">Active Template</div>
                  <div className="mb-1 text-[0.8rem] font-semibold text-foreground">Book-a-Call Funnel</div>
                  <div className="text-[0.72rem] text-muted-foreground">All settings pre-loaded ✓</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-7">
              <div className="flex items-center justify-between">
                <div className="font-display text-[1.1rem] font-bold text-foreground">Launch Session — April 22, 2026</div>
                <div className="rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs text-primary-glow">⚡ Template Applied</div>
              </div>

              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-7 text-center">
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/15">
                  <Upload className="h-5 w-5 text-primary-glow" />
                </div>
                <div className="text-[0.85rem] text-muted-foreground"><strong className="text-primary-glow">Drop up to 50 files here</strong> or click to browse</div>
                <div className="mt-1 text-[0.78rem] text-muted-foreground">Images & videos accepted · Uploading in background while you configure</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[0.82rem] text-muted-foreground">12 files uploaded — drag to select & assign</div>
                <div className="flex items-center gap-1.5 text-[0.78rem] text-success">
                  <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-success" />
                  All settings locked in
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative flex aspect-square items-end justify-center gap-0.5 overflow-hidden rounded-lg border border-border/60 p-3"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))" }}>
                    {[12, 18, 8, 14, 10].map((h, j) => (
                      <span key={j} className="w-1 rounded-sm bg-primary-glow/60" style={{ height: `${h + (i % 3) * 2}px` }} />
                    ))}
                    <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success text-[8px] text-success-foreground">✓</span>
                  </div>
                ))}
                {[5, 6].map((i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-lg border border-border/60 bg-card opacity-50 text-muted-foreground">⏳</div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-center">
                {[
                  { label: "Headline", value: "From template ✓", color: "text-primary-glow" },
                  { label: "Advantage+", value: "All OFF ✓", color: "text-destructive" },
                  { label: "Placements", value: "FB + IG only ✓", color: "text-primary-glow" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 text-[0.72rem] text-muted-foreground">{s.label}</div>
                    <div className={`text-[0.78rem] font-semibold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <button className="w-full rounded-[10px] bg-gradient-primary px-6 py-3 font-display text-[0.9rem] font-bold text-primary-foreground shadow-glow">
                🚀 Send to Facebook Ads Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-y-6 px-10 py-8 text-center md:grid-cols-4">
          {[
            { v: "50", l: "ads launched per session" },
            { v: "1", l: "click to push to Ads Manager" },
            { v: "0", l: "manual enhancement toggles" },
            { v: "4hrs", l: "saved per launch, on average" },
          ].map((s, i) => (
            <div key={s.l} className={`px-5 ${i < 3 ? "md:border-r md:border-border/60" : ""}`}>
              <div className="bg-gradient-primary bg-clip-text font-display text-[2.2rem] font-extrabold leading-none text-transparent">{s.v}</div>
              <div className="mt-1.5 text-[0.82rem] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <Section label="Who It's For" title="If you're launching Facebook ads, this was built for you." sub="CreativeTest.ai fits anywhere Facebook's manual setup is slowing you down or costing you money.">
        <div className="mt-9 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Building2, title: "Business owners running their own ads", desc: "You're not a media buyer — but you're responsible for the results. CreativeTest.ai locks in the right settings so you launch confidently without needing to know every toggle Facebook hides.", tags: ["No expertise needed", "Settings protected", "Budget defended"] },
            { icon: TrendingUp, title: "High-spend accounts testing lots of creatives", desc: "When you're spending $10k–$100k/mo and iterating through 30–50 creatives per cycle, manual configuration isn't a workflow — it's a liability. One wrong setting at scale is expensive.", tags: ["50 creatives per session", "Zero configuration drift", "Built for volume"] },
            { icon: Trophy, title: "Agencies managing multiple client accounts", desc: "Per-account templates mean every client launches with their exact settings — never crossed, never misconfigured. Your team ships faster, your standards stay consistent, and launch days stop being all-hands events.", tags: ["Per-client templates", "Team roles & access", "Launch log"] },
            { icon: Crosshair, title: "Solo media buyers handling multiple accounts", desc: "You know what good settings look like — but reconfiguring from scratch every launch is time you don't have. Templates mean you set your standard once and trust it every time, even across five different accounts.", tags: ["Multiple ad accounts", "Save hours per launch", "Settings you trust"] },
            { icon: Zap, title: "Lead gen businesses running book-a-call or webinar funnels", desc: "Your funnel has specific requirements — pixel events, conversion settings, attribution windows. CreativeTest.ai stores your exact funnel setup as a template and applies it perfectly to every batch you launch.", tags: ["Book-a-call funnels", "Webinar funnels", "Pixel & attribution locked"] },
            { icon: ShoppingBag, title: "E-commerce brands testing creative at scale", desc: "Constant creative refresh means constant launches. CreativeTest.ai eliminates the setup bottleneck — so your team can test more, learn faster, and never lose a week's data to a misconfigured ad set.", tags: ["Fast creative iteration", "Bulk launches", "Clean data every time"] },
          ].map(({ icon: Icon, title, desc, tags }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/35">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-100" />
              <Icon className="mb-3.5 h-7 w-7 text-primary-glow" />
              <div className="mb-2.5 font-display text-[1.05rem] font-bold text-foreground">{title}</div>
              <div className="mb-4 text-[0.87rem] leading-[1.65] text-muted-foreground">{desc}</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[0.72rem] font-semibold text-primary-glow">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* BEFORE / AFTER */}
      <Section label="The Problem" title="Manual ad setup wastes hours. Facebook's defaults waste your budget." sub="Two separate problems. Both solved in the same workflow.">
        <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              after: false,
              chip: "✕ What you're dealing with today",
              items: [
                ["50 ads configured one by one.", "Facebook Ads Manager wasn't built for bulk. Every ad requires the same repetitive clicks — and 50 chances to mis-toggle something that quietly drains your budget."],
                ["Advantage+ enhancements are on by default.", "Facebook enables AI rewrites of your headline, auto-added sitelinks, and creative changes — without asking. Most people never notice until the money's gone."],
                ["Audience Network burns budget on junk traffic.", "Your ads run on third-party apps and low-quality sites by default. The spend shows in Facebook. The results don't show in your business."],
                ["Every launch, you're hoping nothing was missed.", "A wrong URL. A tracking parameter missing. An enhancement left on. These mistakes don't announce themselves — they just run until someone notices."],
              ],
              footer: "Hours lost + budget wasted",
            },
            {
              after: true,
              chip: "✓ How CreativeTest.ai works",
              items: [
                ["Upload 50 creatives at once, in the background.", "Drag and drop your entire batch. Files upload while you configure — no waiting, no one-by-one."],
                ["Apply your template. Every setting locks in instantly.", "Headline, copy, URL, Advantage+ states, placements, attribution, pixel — applied across all ads in one click from your saved template."],
                ["Placements and enhancements controlled precisely.", "Audience Network off. Advantage+ off. Attribution set correctly. Your budget goes where it should — not where Facebook wants it."],
                ["Pre-send validation catches every gap before launch.", "Missing headline, wrong URL, empty creative slot — flagged before anything reaches Ads Manager. You launch knowing it's right."],
              ],
              footer: "~20 min · settings protected",
            },
          ].map((c) => (
            <div key={c.chip} className={`rounded-2xl border p-7 ${c.after ? "border-primary/30 bg-primary/5" : "border-border/60 bg-card"}`}>
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] ${c.after ? "border border-primary/30 bg-primary/15 text-primary-glow" : "border border-border/60 bg-foreground/5 text-muted-foreground"}`}>
                {c.chip}
              </div>
              <div className="flex flex-col gap-3.5">
                {c.items.map(([h, d]) => (
                  <div key={h} className="flex items-start gap-3 text-[0.88rem] leading-[1.5]">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${c.after ? "border-primary/30 bg-primary/15 text-primary-glow" : "border-destructive/30 bg-destructive/15 text-destructive"}`}>
                      {c.after ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <div className={c.after ? "text-foreground" : "text-muted-foreground"}>
                      <strong className="text-foreground">{h}</strong> {d}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 rounded-xl border px-5 py-4 ${c.after ? "border-primary/20 bg-primary/10" : "border-border/60 bg-foreground/5"}`}>
                <div className={`font-display text-[1.4rem] font-extrabold leading-none ${c.after ? "bg-gradient-primary bg-clip-text text-transparent" : "text-destructive"}`}>
                  {c.footer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <div id="how-it-works" className="border-y border-border/60 bg-card/40 py-20">
        <Section label="How It Works" title="From drag-and-drop to live in Ads Manager." className="!py-0">
          <div className="relative mt-9 grid grid-cols-1 md:grid-cols-4">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden h-px md:block"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4) 20%, hsl(var(--secondary) / 0.4) 80%, transparent)" }} />
            {[
              { n: 1, active: true, title: "Connect your ad account", desc: "Connect via Facebook OAuth. Your pages, pixels, and ad accounts load automatically. Takes about 2 minutes." },
              { n: 2, active: false, title: "Save your template once", desc: "Set your campaign structure, copy, Advantage+ states, placements, and attribution. Save it. Every launch after uses it automatically." },
              { n: 3, active: false, title: "Upload & apply in bulk", desc: "Drag up to 50 creatives into the upload zone. Apply your template. Every ad inherits the right settings instantly — all 50 at once." },
              { n: 4, active: false, title: "Launch with confidence", desc: "One click sends everything to Ads Manager. Real-time status per ad. You know exactly what's live and exactly how it's configured." },
            ].map((s) => (
              <div key={s.n} className="relative px-5 text-center">
                <div className={`relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border bg-card font-display text-[1.1rem] font-extrabold text-primary-glow ${s.active ? "border-primary/50 shadow-glow" : "border-primary/30"}`}>
                  {s.n}
                </div>
                <div className="mb-2 font-display text-[0.95rem] font-bold text-foreground">{s.title}</div>
                <div className="text-[0.82rem] leading-[1.6] text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* FEATURES */}
      <Section id="features" label="Features" title="Built for bulk launches. Built to protect your budget." sub="Every feature solves one of two things: the grind of manual configuration, or the risk of Facebook's defaults quietly draining your spend.">
        <div className="mt-9 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Upload, title: "Bulk upload — 50 creatives at once", desc: "Drag and drop up to 50 images or videos simultaneously. Upload runs in the background while you configure settings — no waiting, no one-by-one." },
            { icon: Shield, title: "Advantage+ enhancements — all off", desc: "Facebook enables AI rewrites, auto sitelinks, and creative changes by default. CreativeTest.ai turns them all off via template — your ad runs exactly as you made it, every time." },
            { icon: Zap, title: "Templates — apply settings to all 50 ads in one click", desc: "Save your headline, copy, URL, pixel, placements, attribution, and every enhancement state in a template. Apply to your entire batch instantly. No per-ad configuration." },
            { icon: Target, title: "Placements locked to FB + Instagram only", desc: "Audience Network, Messenger, and Threads disabled automatically. Your budget goes where your customers are — not spread across low-quality third-party traffic." },
            { icon: CheckCircle2, title: "Pre-send validation — nothing launches broken", desc: "Before anything reaches Facebook, every required field is checked — headline, URL, creative, description. Missing or incorrect? Flagged and blocked before send, not after spend." },
            { icon: FolderTree, title: "Shell campaigns — structure before creatives", desc: "Build your campaign and adsets with all settings and copy pre-filled before creatives arrive. Save as a shell, come back on launch day, drop in the files, and go." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:border-secondary/40">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Icon className="h-5 w-5 text-primary-glow" />
              </div>
              <div className="mb-2 font-display text-base font-bold text-foreground">{title}</div>
              <div className="text-[0.87rem] leading-[1.65] text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* CALCULATOR */}
      <div className="border-y border-border/60" style={{ background: "linear-gradient(180deg, transparent, hsl(var(--primary) / 0.04) 30%, hsl(var(--secondary) / 0.04) 70%, transparent)" }}>
        <Section label="The Real Cost" title="Wrong settings don't just waste time. They waste budget.">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {[
                { label: "Launch sessions per month", value: sessions, display: sessions, set: setSessions, min: 1, max: 12, step: 1 },
                { label: "Monthly ad spend (USD)", value: spend, display: `$${spend.toLocaleString()}`, set: setSpend, min: 500, max: 20000, step: 500 },
                { label: "Estimated waste from bad settings", value: wastePct, display: `${wastePct}%`, set: setWastePct, min: 5, max: 40, step: 5 },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[0.85rem] font-medium text-muted-foreground">
                    {s.label}
                    <span className="font-semibold text-primary-glow">{s.display}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={(e) => s.set(parseInt(e.target.value))}
                    className="h-1 w-full cursor-pointer appearance-none rounded-sm bg-foreground/10 accent-primary
                      [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-primary [&::-webkit-slider-thumb]:shadow-glow" />
                </div>
              ))}
              <div className="rounded-xl border border-primary/20 bg-primary/8 px-4 py-3.5 text-[0.84rem] leading-[1.6] text-muted-foreground">
                <strong className="text-primary-glow">15% is conservative.</strong> Audience Network alone can drain 20–30% of a budget on low-quality clicks. Add open attribution windows and enabled Advantage+ creative changes, and the real figure is often higher.
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-[20px] border border-primary/20 bg-card p-8">
              <div className="font-display text-[0.8rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">Estimated monthly budget exposure</div>
              {[
                { l: "Budget at risk per month", v: `$${calc.wastePerMonth.toLocaleString()}/mo` },
                { l: "Budget at risk per year", v: `$${calc.wastePerYear.toLocaleString()}/yr` },
                { l: "Budget protected with CreativeTest.ai", v: `$${calc.wastePerYear.toLocaleString()}/yr` },
                { l: "Cost of CreativeTest.ai", v: `$${calc.cost}/mo` },
              ].map((s, i, arr) => (
                <div key={s.l} className={`flex items-baseline justify-between pb-4 ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}>
                  <div className="text-[0.88rem] text-muted-foreground">{s.l}</div>
                  <div className="bg-gradient-primary bg-clip-text font-display text-[1.4rem] font-extrabold text-transparent">{s.v}</div>
                </div>
              ))}
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3.5">
                <div className="mb-1 text-[0.78rem] text-muted-foreground">Your ROI</div>
                <div className="bg-gradient-primary bg-clip-text font-display text-[1.5rem] font-extrabold text-transparent">{calc.roi}x return on investment</div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: "linear-gradient(180deg, transparent, hsl(var(--card) / 0.8) 20%, hsl(var(--card) / 0.8) 80%, transparent)" }} className="py-20">
        <Section label="What Users Say" title="Agencies and business owners running cleaner launches." className="!py-0">
          <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { quote: `"We were spending 4–5 hours every launch day just configuring ads. With CreativeTest.ai, that's 20 minutes. We've launched more in the last month than the previous quarter."`, name: "Marcus R.", role: "Founder, Growth Lab Media · $200k/mo spend", initials: "MR" },
              { quote: `"I had no idea Audience Network was running until I dug into where my clicks were coming from. CreativeTest.ai would have caught that from day one. I didn't know what I didn't know — and it was costing me."`, name: "Tom N.", role: "Business owner · Home services", initials: "TN" },
              { quote: `"I used to dread launch days. Manually disabling every Advantage+ toggle across 50 ads is maddening. Now I actually trust the settings are right every single time. That peace of mind is worth it alone."`, name: "Sarah L.", role: "Head of Paid Media, Apex Agency · 18 clients", initials: "SL" },
            ].map((t) => (
              <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/30">
                <div className="text-[0.85rem] tracking-[2px] text-warning">★★★★★</div>
                <div className="flex-1 text-[0.9rem] leading-[1.7] text-muted-foreground">{t.quote}</div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-xs font-semibold text-primary-glow">{t.initials}</div>
                  <div>
                    <div className="text-[0.88rem] font-semibold text-foreground">{t.name}</div>
                    <div className="text-[0.78rem] text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* FAQ */}
      <Section label="Common Questions" title="A few things you're probably wondering.">
        <div className="mt-9 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {[
            ["What exactly are Advantage+ enhancements and why do they matter?", "Advantage+ enhancements are Facebook features — AI-generated headlines, sitelinks, creative alterations — that Facebook enables by default. They're designed to increase spend and optimise for Facebook's goals, not yours. CreativeTest.ai turns them all off via template, automatically, on every ad."],
            ["Can't I just turn these settings off myself in Ads Manager?", "You can — but you have to find and toggle each setting individually, for every single ad. At 50 creatives, that's hundreds of manual actions per launch. Miss one, it runs. With CreativeTest.ai, your template handles it all in one click, every time."],
            ["Does this work for agencies managing multiple client accounts?", "Yes. You can connect multiple ad accounts and create separate templates per client or funnel type. Each template stores the exact settings for that account — so switching between clients never means reconfiguring from scratch."],
            ["Does this work with my existing Facebook ad account?", "Yes. You connect via Facebook OAuth — no shared logins. CreativeTest.ai pushes directly to your existing campaigns and adsets in Ads Manager using the standard Facebook Marketing API. Nothing changes about your account structure."],
            ["What happens to my ads after they're launched?", "CreativeTest.ai is a launch tool. Once your ads are live, all management — pausing, editing, budget changes — happens directly in Facebook Ads Manager as normal. No double-managing anything."],
            ["Do I need media buying expertise to use this?", "No. Set up your template once — or have a media buyer do it for you — and every future launch applies those settings automatically. You bring the creatives and copy. The template handles the technical configuration."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/30">
              <div className="mb-2.5 flex items-start gap-2.5 font-display text-[0.95rem] font-bold text-foreground">
                <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/15 p-1">
                  <HelpCircle className="h-3.5 w-3.5 text-secondary" />
                </span>
                {q}
              </div>
              <div className="pl-8 text-[0.87rem] leading-[1.65] text-muted-foreground">{a}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" label="Pricing" title="Straightforward pricing. No usage surprises." sub="Every tier includes unlimited templates, full settings control, and the complete launch experience. You pay for volume — nothing else.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { tier: "Starter", price: "$49", period: "/ month", featured: false, features: ["Up to 200 ads/month", "1 ad account", "2 team members", "Unlimited templates", "Launch log & audit trail", "Shell campaigns"] },
            { tier: "Growth", price: "$99", period: "/ month · up to 500 ads/month", featured: true, features: ["Up to 500 ads/month", "5 ad accounts", "5 team members", "Unlimited templates", "Launch log & audit trail", "Shell campaigns"] },
            { tier: "Agency", price: "$199", period: "/ month · unlimited ads & accounts", featured: false, features: ["Unlimited ads/month", "Unlimited ad accounts", "Up to 15 team members", "Unlimited templates", "Launch log & audit trail", "Priority support"] },
          ].map((p) => (
            <div key={p.tier} className={`relative rounded-2xl border p-8 ${p.featured ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border/60 bg-card"}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">Most Popular</div>
              )}
              <div className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{p.tier}</div>
              <div className="font-display text-5xl font-extrabold text-foreground">{p.price}</div>
              <div className="mb-5 mt-1 text-sm text-muted-foreground">{p.period}</div>
              <div className="mb-6 h-px bg-border/60" />
              <ul className="mb-7 flex flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[0.88rem] text-foreground/90">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-2.5 w-2.5 text-primary-glow" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className={`flex items-center justify-center rounded-[10px] px-6 py-3 text-sm font-semibold transition-all ${p.featured ? "bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5" : "border border-border bg-transparent text-foreground hover:bg-accent/10"}`}>
                Start free trial
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-[0.85rem] text-muted-foreground">
          All plans include a 7-day free trial. No credit card required to start. Cancel anytime.
        </div>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden px-10 py-24 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, hsl(var(--secondary) / 0.15) 0%, transparent 70%)" }} />
        <div className="relative z-10 mx-auto max-w-[620px]">
          <h2 className="mb-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.2] tracking-tight">
            Bulk launches. Right settings.<br />Every single time.
          </h2>
          <p className="mb-8 text-base leading-[1.7] text-muted-foreground">
            Stop configuring ads one by one and hoping nothing was missed. CreativeTest.ai handles the bulk upload and locks in the right settings — so your budget goes where it should and your launch days stop being a grind.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-primary px-9 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-95">
              Start Your Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="rounded-[10px] border border-border bg-card/60 px-9 py-4 text-base font-semibold text-foreground transition-colors hover:bg-card">
              See a 2-min demo
            </a>
          </div>
          <div className="mt-4 text-[0.82rem] text-muted-foreground">7-day free trial · No credit card required · Live in 2 minutes</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-border/60 px-6 py-10 md:px-14">
        <div className="font-display text-lg font-extrabold tracking-tight">
          Creative<span className="bg-gradient-primary bg-clip-text text-transparent">Test.ai</span>
        </div>
        <ul className="flex flex-wrap gap-7">
          <li><a href="#features" className="text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground">Features</a></li>
          <li><a href="#pricing" className="text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground">Pricing</a></li>
          <li><Link to="/privacy" className="text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>
        </ul>
        <div className="text-[0.82rem] text-muted-foreground">© 2026 CreativeTest.ai. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Index;
