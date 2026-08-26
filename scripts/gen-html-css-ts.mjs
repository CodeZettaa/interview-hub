/**
 * Generates HTML, CSS, and TypeScript interview question banks (100 each).
 * Run: node scripts/gen-html-css-ts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "data", "questions");

const TYPES = [
  "concept",
  "comparison",
  "scenario",
  "debugging",
  "architecture",
  "coding",
  "output",
  "best-practice",
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function q(question, shortAnswer, detailedAnswer, extras = {}) {
  return { question, shortAnswer, detailedAnswer, ...extras };
}

function expand(category, categorySlug, idPrefix, items) {
  return { category, categorySlug, idPrefix, seeds: items };
}

function writeBank(tech, categoryFiles) {
  const dir = path.join(root, tech);
  fs.mkdirSync(dir, { recursive: true });
  let total = 0;
  const hist = { fresh: 0, junior: 0, mid: 0, senior: 0, lead: 0 };
  const catCounts = {};

  for (const file of categoryFiles) {
    const questions = file.seeds.map((seed, idx) => {
      const n = String(idx + 1).padStart(3, "0");
      const difficulty = seed.difficulty;
      if (!difficulty || !(difficulty in hist)) {
        throw new Error(`Missing/invalid difficulty on ${file.idPrefix}-${n}`);
      }
      hist[difficulty]++;
      return {
        id: `${file.idPrefix}-${n}`,
        technology: tech,
        category: file.category,
        categorySlug: file.categorySlug,
        slug: seed.slug || slugify(seed.question),
        question: seed.question,
        shortAnswer: seed.shortAnswer,
        detailedAnswer: seed.detailedAnswer,
        ...(seed.example ? { example: seed.example } : {}),
        ...(seed.interviewTip ? { interviewTip: seed.interviewTip } : {}),
        ...(seed.commonMistake ? { commonMistake: seed.commonMistake } : {}),
        difficulty,
        type: seed.type || TYPES[idx % TYPES.length],
        tags: seed.tags || [file.categorySlug],
      };
    });
    total += questions.length;
    catCounts[file.categorySlug] = questions.length;
    fs.writeFileSync(
      path.join(dir, `${file.categorySlug}.json`),
      JSON.stringify(questions, null, 2) + "\n",
      "utf8",
    );
  }

  console.log(`\n${tech}: ${total} questions`);
  console.log("  categories:", catCounts);
  console.log("  difficulty:", hist);
  if (total !== 100) throw new Error(`${tech} expected 100, got ${total}`);
  const expected = { fresh: 15, junior: 25, mid: 25, senior: 25, lead: 10 };
  for (const [k, v] of Object.entries(expected)) {
    if (hist[k] !== v) {
      throw new Error(`${tech} ${k}: expected ${v}, got ${hist[k]}`);
    }
  }
  return { total, hist, catCounts };
}

// ─── helpers to stamp difficulties in order across a flat list ───
function stampDiffs(items, order) {
  if (items.length !== order.length) {
    throw new Error(`stampDiffs length mismatch ${items.length} vs ${order.length}`);
  }
  return items.map((item, i) => ({ ...item, difficulty: order[i] }));
}

/** Build ~15/25/25/25/10 pattern for n=100 */
function defaultDiffOrder() {
  return [
    ...Array(15).fill("fresh"),
    ...Array(25).fill("junior"),
    ...Array(25).fill("mid"),
    ...Array(25).fill("senior"),
    ...Array(10).fill("lead"),
  ];
}

function interleaveDiffs(categoryLengths) {
  // Round-robin assign from defaultDiffOrder so each category gets a mix
  const pool = defaultDiffOrder();
  const buckets = categoryLengths.map(() => []);
  let i = 0;
  for (const d of pool) {
    // find next bucket that still needs items
    let tries = 0;
    while (buckets[i].length >= categoryLengths[i] && tries < categoryLengths.length) {
      i = (i + 1) % categoryLengths.length;
      tries++;
    }
    buckets[i].push(d);
    i = (i + 1) % categoryLengths.length;
  }
  return buckets;
}

// ============================================================================
// HTML — 8 cats × (13+13+13+12+12+13+12+12) = 100
// ============================================================================
const htmlCats = [
  ["Semantics", "semantics", "html-semantics", 13],
  ["Accessibility", "accessibility", "html-accessibility", 13],
  ["Forms", "forms", "html-forms", 13],
  ["Media", "media", "html-media", 12],
  ["SEO", "seo", "html-seo", 12],
  ["APIs", "apis", "html-apis", 13],
  ["Performance", "performance", "html-performance", 12],
  ["Security", "security", "html-security", 12],
];

const htmlSeeds = {
  semantics: [
    q("What does semantic HTML mean, and why do interviewers care?", "Using elements for meaning (header, nav, main, article) rather than only divs for layout.", "Semantic tags communicate document structure to browsers, assistive tech, and crawlers. They improve accessibility tree quality, default keyboard behavior, and SEO signals. Layout still uses CSS; semantics describe role. Prefer button over clickable divs, and lists for list content.", { interviewTip: "Tie semantics to a11y + SEO, not just clean code.", commonMistake: "Thinking semantic HTML replaces ARIA entirely.", tags: ["semantics", "a11y"], type: "concept", slug: "what-is-semantic-html" }),
    q("When should you use <section> vs <article> vs <div>?", "<article> is self-contained content; <section> is a thematic grouping; <div> is a meaningless styling/scripting hook.", "Use article for posts, cards, or widgets that make sense alone. Use section when a heading groups related content. Use div when you need a box with no semantic meaning. Overusing section without headings is an anti-pattern.", { type: "comparison", tags: ["semantics"], slug: "section-vs-article-vs-div" }),
    q("What is the difference between <header>, <head>, and heading elements?", "<head> is metadata; <header> is introductory page/section chrome; h1–h6 define outline hierarchy.", "head lives in the document head and holds title, meta, links. header can appear in body for branding/nav or section intros. Heading levels should form a logical outline — don't skip levels for styling.", { type: "comparison", slug: "header-vs-head-vs-headings" }),
    q("Why is a single <main> landmark important?", "It marks the primary content once per page so AT users can skip chrome.", "Screen readers expose landmarks. Multiple mains confuse navigation. Hide repeated chrome outside main. Pair with skip links for keyboard users.", { type: "concept", tags: ["a11y", "landmarks"], slug: "single-main-landmark" }),
    q("How do you structure a blog post with semantic HTML?", "article containing header (title/meta), optional nav for TOC, sections with headings, footer for author/related.", "Keep one h1 for the page title. Nest sections under article. Use time with datetime for publish dates. Avoid wrapping the entire site in article.", { type: "scenario", slug: "blog-post-semantic-structure" }),
    q("What is the HTML outline and how do browsers treat heading levels?", "Authors should use heading levels for hierarchy; the historic outline algorithm is not reliably used by browsers/AT.", "In practice, use visual and accessibility-friendly heading order. Don't rely on sectioning roots to reset heading ranks. Tools and AT mostly follow explicit h1–h6.", { type: "concept", slug: "html-outline-heading-levels" }),
    q("When is <aside> appropriate?", "For tangentially related content — sidebars, pull quotes, related links — not primary flow.", "If removing aside breaks the main story, it probably shouldn't be aside. Site-global sidebars may be better as complementary landmarks with care.", { type: "best-practice", slug: "when-to-use-aside" }),
    q("Explain <nav> usage — one or many?", "Use nav for major navigation blocks; multiple navs are fine if labeled.", "Primary site nav, TOC, and pagination can each be nav. Distinguish with aria-label. Don't wrap every link list in nav.", { type: "best-practice", slug: "nav-usage-one-or-many" }),
    q("What are phrasing vs flow content, and why does it matter?", "Content categories constrain valid nesting — e.g. p cannot contain block-level flow like div.", "Invalid nesting causes browsers to fix the DOM unexpectedly. Knowing categories prevents mysterious layout bugs and hydration mismatches.", { type: "debugging", slug: "phrasing-vs-flow-content" }),
    q("How would you mark up a FAQ for accessibility and SEO?", "Use headings + content, or details/summary; consider FAQ schema in JSON-LD carefully.", "Ensure keyboard access and visible focus. Don't fake accordions with non-button controls. Prefer progressive enhancement.", { type: "scenario", slug: "faq-markup-a11y-seo" }),
    q("What is the role of <figure> and <figcaption>?", "Associate media with a caption as a single unit.", "Useful for images, diagrams, code samples. Caption can be before/after media. Improves semantics vs orphaned text under an image.", { type: "concept", slug: "figure-and-figcaption" }),
    q("When should you use <address>?", "For contact information for the nearest article or body author — not every postal address on the page.", "Misusing address for arbitrary locations is common. It's specifically contact info for the document/section author.", { type: "best-practice", slug: "when-to-use-address" }),
    q("Design a semantic layout for a dashboard with app chrome and widgets.", "banner/header + nav + main containing complementary widgets as sections/articles; avoid landmark spam.", "Name regions. Keep one main. Self-contained widgets can be articles. Prefer headings inside widgets for AT navigation.", { type: "architecture", slug: "semantic-dashboard-layout" }),
  ],
  accessibility: [
    q("What makes an accessible name for a control?", "Visible label, aria-label, aria-labelledby, or native labeling associations.", "Prefer visible label for. aria-label overrides and can hurt i18n if not translated. Decorative icons need careful naming so buttons aren't silent.", { type: "concept", tags: ["a11y"], slug: "accessible-name-for-control" }),
    q("Why are clickable <div>s an accessibility problem?", "They lack button semantics, keyboard activation, and often focus styles.", "Use button or a href. If unavoidable, add role, tabindex, key handlers, and focus styles — still inferior to native.", { type: "debugging", slug: "clickable-div-a11y-problem" }),
    q("Explain alt text strategy for images.", "Describe purpose: informative alt, empty alt for decorative, avoid 'image of'.", "Linked images need alt that describes destination/purpose. Complex charts need long descriptions nearby. CSS background images are invisible to AT.", { type: "best-practice", slug: "alt-text-strategy" }),
    q("How does focus management work for modals?", "Move focus into the dialog on open, trap tab within, restore focus on close.", "Use dialog element or a vetted pattern. aria-modal and labels required. Background should be inert. Escape closes.", { type: "scenario", slug: "modal-focus-management" }),
    q("What is the difference between aria-hidden and the hidden attribute?", "hidden removes from presentation and usually the a11y tree; aria-hidden hides from AT but may remain focusable if misused.", "Never aria-hide focusable elements without removing them from tab order. Prefer hidden/inert for closed UI.", { type: "comparison", slug: "aria-hidden-vs-hidden" }),
    q("How do you make a custom checkbox accessible?", "Prefer native input type=checkbox; if custom, sync aria-checked, roles, keyboard Space.", "Visible label, focus ring, and form participation matter. Custom controls often break with forms and AT.", { type: "coding", slug: "custom-checkbox-accessible" }),
    q("What are skip links and why do they matter?", "First focusable link to jump to main content, reducing repetitive tabbing.", "Must be visible on focus. Target should be focusable (tabindex=-1 on main).", { type: "concept", slug: "skip-links" }),
    q("How do you handle accessible error messages in forms?", "Associate errors via aria-describedby; use aria-invalid; move focus to first error on submit.", "Don't rely on color alone. Announce via live regions carefully for async validation.", { type: "scenario", slug: "accessible-form-errors" }),
    q("Contrast and focus visibility — what do you check?", "Text contrast ratios and a clearly visible :focus-visible style that isn't outline:none without replacement.", "WCAG targets depend on size. Dark themes still need contrast. Keyboard users must see focus.", { type: "best-practice", slug: "contrast-and-focus-visibility" }),
    q("What is a live region and when is it dangerous?", "aria-live announces dynamic updates; overuse causes noisy interruptions.", "Use polite for non-critical updates, assertive sparingly. Don't put entire pages in live regions.", { type: "concept", slug: "live-regions" }),
    q("How would you accessibility-test a SPA route change?", "Update document title, manage focus to a heading, ensure landmarks refresh, avoid focus loss.", "Screen reader users need confirmation of navigation. Routers often forget focus management.", { type: "scenario", slug: "spa-route-change-a11y" }),
    q("Describe keyboard interaction for a tabs widget.", "Arrow keys move among tabs; Tab moves into tabpanel; aria-selected and roles required.", "Prefer established patterns. Ensure panels are labeled by tabs. Don't only support click.", { type: "coding", slug: "tabs-keyboard-interaction" }),
    q("How do you build an a11y culture on a frontend team?", "Design system primitives with a11y baked in, linting, CI axe checks, manual AT passes, acceptance criteria.", "Component libraries prevent rework. Train designers on focus order and labels. Budget time for audits on critical flows.", { type: "architecture", slug: "building-a11y-culture" }),
  ],
  forms: [
    q("Why should every input have a <label>?", "Labels give accessible names and enlarge click/tap targets.", "Associate with for/id or wrap the control. Placeholder is not a label. Visible labels survive autofill and translation better.", { type: "concept", slug: "every-input-needs-label" }),
    q("What does the required attribute do vs JavaScript validation?", "required participates in native constraint validation; JS can add custom rules and UX.", "Native validation is progressive and works without JS, but messaging/styling is limited. Combine both carefully; don't disable native without replacement.", { type: "comparison", slug: "required-vs-js-validation" }),
    q("Explain name vs id on form controls.", "id is unique for labels/anchors; name is the key submitted in form data.", "Multiple radios share a name. id must be unique in the document. Missing name means the field won't submit.", { type: "concept", slug: "name-vs-id-form-controls" }),
    q("How do fieldset and legend improve forms?", "They group related controls and name the group for AT.", "Ideal for radio sets and address blocks. Don't nest fieldsets excessively. Legend should be concise.", { type: "best-practice", slug: "fieldset-and-legend" }),
    q("What is autocomplete and why does it matter?", "Hints browsers/password managers how to fill fields (email, current-password, etc.).", "Correct tokens improve conversion and security (password managers). Wrong tokens frustrate users and cause autofill bugs.", { type: "concept", slug: "autocomplete-attribute" }),
    q("How does constraint validation API work?", "checkValidity/reportValidity and setCustomValidity integrate with :valid/:invalid.", "Listen to invalid events. Custom messages must be cleared when fixed. Useful for cross-field rules.", { type: "coding", example: "input.setCustomValidity(ok ? '' : 'Passwords must match');", slug: "constraint-validation-api" }),
    q("When do you choose GET vs POST for forms?", "GET for idempotent safe queries; POST for mutations or sensitive/large payloads.", "GET puts data in the URL (history, logs, length limits). POST for login, checkout, uploads.", { type: "comparison", slug: "form-get-vs-post" }),
    q("How do you build an accessible multi-step form?", "One logical form or wizard with clear step status, preserved data, and focus management per step.", "Announce step changes. Don't lose entered data. Validate per step and summarize errors before submit.", { type: "scenario", slug: "accessible-multi-step-form" }),
    q("What are the risks of disabling native form submit?", "You may break Enter-to-submit, progressive enhancement, and password manager flows.", "If using preventDefault, reimplement keyboard submit and validation thoroughly.", { type: "debugging", slug: "disabling-native-form-submit" }),
    q("Explain input types email, tel, url, number — benefits and pitfalls.", "They change mobile keyboards and enable native validation, but number has quirks for IDs/Zips.", "Use text + inputmode when spin buttons or scientific notation hurt UX. Pattern can refine validation.", { type: "best-practice", slug: "input-types-benefits-pitfalls" }),
    q("How should file inputs be labeled and constrained?", "Visible label, accept for hints, server-side validation always; multiple when needed.", "accept is not security. Show selected filenames. Consider drag-drop as enhancement only.", { type: "scenario", slug: "file-input-labeling" }),
    q("What is enctype multipart/form-data and when is it required?", "Required for file uploads so binary parts are encoded correctly.", "Default urlencoded is fine for text fields. JSON APIs often bypass classic enctypes via fetch.", { type: "concept", slug: "enctype-multipart" }),
    q("Design a form system API for a design system team.", "Composable Field, Label, Hint, Error with consistent ids, describedby wiring, and tokens.", "Centralize a11y contracts so product teams can't ship unlabeled inputs. Document validation patterns.", { type: "architecture", slug: "form-system-design-api" }),
  ],
  media: [
    q("When do you use <img> vs CSS background-image?", "img for content images that need alt and intrinsic sizing; CSS for decorative chrome.", "Content images belong in HTML for a11y/SEO. Backgrounds don't expose alt and are harder to print/select.", { type: "comparison", slug: "img-vs-css-background" }),
    q("Explain srcset and sizes.", "srcset lists candidates; sizes tells the browser layout width so it picks an appropriate resource.", "Descriptors can be width (w) or density (x). Wrong sizes causes over/under-fetching. Pair with modern formats.", { type: "concept", slug: "srcset-and-sizes" }),
    q("What does the <picture> element solve?", "Art direction and format negotiation (AVIF/WebP) with fallbacks.", "source media/type choose among candidates; img is mandatory fallback. Different from srcset-only density switching.", { type: "concept", slug: "picture-element" }),
    q("How do you make video accessible?", "Captions/subtitles tracks, transcripts, keyboard controls, no autoplay with sound.", "Prefer native controls or fully accessible custom players. Describe significant visuals when needed.", { type: "best-practice", slug: "accessible-video" }),
    q("What are preload, autoplay, and muted on media elements?", "Hints for buffering and playback policy; autoplay usually requires muted for video.", "Browsers restrict autoplay. preload=none saves bandwidth. Don't autoplay unexpected audio.", { type: "concept", slug: "media-preload-autoplay-muted" }),
    q("How does lazy loading images work in HTML?", "loading=\"lazy\" defers offscreen images; still provide dimensions to reduce CLS.", "Critical LCP images should not be lazy. Native lazy is simpler than IntersectionObserver for many cases.", { type: "best-practice", slug: "native-lazy-loading" }),
    q("Explain object-fit vs changing intrinsic image size.", "object-fit controls how replaced content fills a box; width/height attributes reserve space.", "cover/contain are common. Always set dimensions or aspect-ratio to avoid layout shift.", { type: "comparison", slug: "object-fit-vs-intrinsic-size" }),
    q("How would you deliver responsive hero images efficiently?", "picture for art direction, AVIF/WebP sources, accurate sizes, high fetchpriority for LCP, no lazy.", "Compress appropriately. Avoid huge PNG heroes. Measure LCP in the field.", { type: "scenario", slug: "responsive-hero-images" }),
    q("What is the track element used for?", "Timed text tracks like captions, subtitles, descriptions, chapters for media.", "WebVTT is common. Kind and srclang matter for AT and UX.", { type: "concept", slug: "track-element" }),
    q("When is <audio> preferable to embedding third-party players?", "Simple self-hosted audio with native controls and fewer privacy/perf costs.", "Third-party players add scripts/trackers. Custom UI must remain accessible.", { type: "comparison", slug: "audio-vs-third-party-players" }),
    q("How do you prevent layout shift with media?", "Reserve space via width/height or CSS aspect-ratio; avoid injecting media without placeholders.", "Fonts and ads also shift layout — treat media as part of a CLS budget.", { type: "debugging", slug: "prevent-media-layout-shift" }),
    q("Architect a media pipeline for a content site.", "CDN transforms, format negotiation, responsive variants, caching headers, a11y requirements in CMS.", "Editors need alt requirements. Automate compression. Monitor bandwidth and LCP.", { type: "architecture", slug: "media-pipeline-architecture" }),
  ],
  seo: [
    q("What is the role of the <title> element for SEO?", "Primary snippet title signal and browser tab label; unique per page.", "Keep concise and descriptive. Don't keyword-stuff. Align with h1 thematically without duplication spam.", { type: "concept", slug: "title-element-seo" }),
    q("Explain meta description best practices.", "Summarizes the page for SERP snippets; not a direct ranking factor but affects CTR.", "Unique, compelling, within typical display length. Avoid duplicate sitewide descriptions.", { type: "best-practice", slug: "meta-description" }),
    q("How do canonical URLs help?", "They declare the preferred URL when duplicates/near-duplicates exist.", "Use absolute URLs. Self-referential canonicals are common. Wrong canonicals can deindex pages.", { type: "concept", slug: "canonical-urls" }),
    q("What Open Graph tags matter for sharing?", "og:title, og:description, og:image, og:url (and twitter cards similarly).", "They control link previews on social platforms. Images should meet size guidelines.", { type: "concept", slug: "open-graph-tags" }),
    q("How does heading structure affect SEO?", "Clear hierarchy helps crawlers and users understand topical structure.", "One clear h1, logical nesting, don't use headings only for styling. Content quality still dominates.", { type: "best-practice", slug: "heading-structure-seo" }),
    q("What is robots meta vs robots.txt?", "robots.txt governs crawling paths; meta robots governs indexing/snippet behavior per page.", "noindex can still allow crawl depending on setup. Disallow doesn't remove already indexed URLs alone.", { type: "comparison", slug: "robots-meta-vs-robots-txt" }),
    q("When should you use JSON-LD structured data?", "To describe entities (Article, Product, FAQ) for rich results — matching visible content.", "Keep accurate and maintained. Misleading schema risks manual actions.", { type: "scenario", slug: "json-ld-structured-data" }),
    q("How do SPAs hurt SEO if misconfigured?", "Critical content may be client-only, slow TTFB/LCP, or missing unique titles per route.", "Prefer SSR/SSG or prerender for indexable routes. Ensure crawlable links (a href).", { type: "debugging", slug: "spa-seo-problems" }),
    q("What is hreflang used for?", "Signals language/region variants of a page to search engines.", "Must be reciprocal and consistent. Mistakes can cause wrong locale in SERPs.", { type: "concept", slug: "hreflang" }),
    q("How do you SEO-audit a marketing landing page?", "Titles/meta, headings, crawlability, Core Web Vitals, structured data, internal links, indexability.", "Check rendered HTML, not just source templates. Validate with Search Console.", { type: "scenario", slug: "landing-page-seo-audit" }),
    q("Why do crawlable links matter more than onclick navigation?", "Crawlers discover pages via href; JS-only navigation may hide routes.", "Use real anchors progressive-enhanced with client routers.", { type: "best-practice", slug: "crawlable-links" }),
    q("Define an SEO content architecture for a large docs site.", "Stable URL taxonomy, canonical rules, sitemap strategy, pagination, unique titles at scale.", "Automate metadata. Prevent soft-404s. Align IA with search intent clusters.", { type: "architecture", slug: "docs-seo-architecture" }),
  ],
  apis: [
    q("What is the Dialog API / <dialog> element?", "Native modal/non-modal dialogs with showModal, ::backdrop, and focus handling.", "Prefer it over custom div modals when support allows. Still verify a11y labeling and inert background.", { type: "concept", slug: "dialog-element-api" }),
    q("Explain the Details/Summary disclosure widget.", "Native expandable widget without JS; summary is the toggle.", "Good for FAQs. Style carefully; ensure keyboard support remains. Limited animation control.", { type: "concept", slug: "details-summary" }),
    q("What does the Popover API enable?", "Declarative popovers with top-layer rendering, light dismiss, and invoker attributes.", "Simplifies menus/tooltips vs manual absolute positioning + focus traps — still check semantics.", { type: "concept", slug: "popover-api" }),
    q("How does the Clipboard API differ from execCommand?", "Async navigator.clipboard with permissions; execCommand is legacy/deprecated.", "Requires secure context. Handle permissions and failures. Don't assume paste always works.", { type: "comparison", slug: "clipboard-api-vs-execcommand" }),
    q("What is contenteditable used for, and what are risks?", "In-browser rich editing; complex a11y, sanitization, and serialization risks.", "Prefer vetted editors. Sanitize before render to avoid XSS. Keyboard/AT support is hard.", { type: "scenario", slug: "contenteditable-risks" }),
    q("Explain Intersection Observer at a high level for HTML apps.", "Async observation of element visibility — lazy load, infinite scroll, analytics.", "Avoid scroll listeners for visibility. Root margins tune prefetch. Disconnect when done.", { type: "concept", slug: "intersection-observer-overview" }),
    q("What is the History API used for in HTML apps?", "pushState/replaceState + popstate for client routing without full reloads.", "Keep URLs shareable. Sync document title. Don't break back button.", { type: "concept", slug: "history-api" }),
    q("How does the Drag and Drop API work?", "draggable elements fire drag events; drop targets handle dragover/drop and dataTransfer.", "Touch support is uneven. Provide keyboard alternatives. Prefer File drop for uploads carefully.", { type: "coding", slug: "drag-and-drop-api" }),
    q("What are custom elements in relation to HTML?", "Define new HTML tags via Custom Elements API with lifecycle callbacks.", "Need hyphenated names. Shadow DOM optional for encapsulation. Progressive enhancement mindset helps.", { type: "concept", slug: "custom-elements" }),
    q("When would you use template and slot?", "template holds inert DOM; slots project light DOM into shadow trees.", "Useful for Web Components. Avoid shipping unused large templates.", { type: "comparison", slug: "template-and-slot" }),
    q("How do you feature-detect HTML APIs safely?", "Check property/method existence; provide fallbacks; avoid UA sniffing.", "Example: 'showModal' in HTMLDialogElement.prototype. Progressive enhancement first.", { type: "best-practice", slug: "feature-detect-html-apis" }),
    q("Full-screen API considerations?", "requestFullscreen on an element; user gesture often required; handle exit and a11y.", "Don't trap users. Escape should exit. Announce state changes.", { type: "scenario", slug: "fullscreen-api" }),
    q("How do you choose native HTML APIs vs JS libraries for UI widgets?", "Prefer native when a11y/perf/maintenance win; libraries when cross-browser gaps or complex UX demand.", "Evaluate support matrices, bundle cost, and design-system consistency at org level.", { type: "architecture", slug: "native-apis-vs-libraries" }),
  ],
  performance: [
    q("Which HTML choices most affect LCP?", "Hero image/video prioritization, preload hints, avoid lazy on LCP element, server TTFB.", "fetchpriority=high on LCP image, correct sizes, modern formats. Reduce render-blocking resources in head.", { type: "concept", slug: "html-choices-affecting-lcp" }),
    q("What does <link rel=preload> do?", "Early fetch of critical resources with as type before the browser discovers them.", "Over-preloading competes for bandwidth. Use for fonts/LCP images/critical CSS carefully.", { type: "concept", slug: "link-rel-preload" }),
    q("Explain defer vs async on script tags.", "async executes when ready (order not guaranteed); defer waits for parse and runs in order before DOMContentLoaded.", "module scripts defer by default. Put non-critical scripts deferred; avoid blocking parser without reason.", { type: "comparison", slug: "script-defer-vs-async" }),
    q("How do resource hints dns-prefetch, preconnect, prefetch differ?", "dns-prefetch resolves DNS; preconnect warmer connection; prefetch fetches likely next navigation resources.", "preconnect is costlier — limit origins. prefetch is speculative and low priority.", { type: "comparison", slug: "resource-hints" }),
    q("Why do width/height on images matter for performance UX?", "They reserve layout space reducing CLS; help browser pick dimensions with sizes.", "Modern alternative: CSS aspect-ratio. Missing dimensions cause jank as images load.", { type: "best-practice", slug: "image-width-height-cls" }),
    q("How does critical CSS relate to HTML?", "Inline or prioritize CSS needed for first paint; defer the rest.", "Don't inline megabytes. Extract above-the-fold carefully. Measure FCP/LCP.", { type: "scenario", slug: "critical-css-and-html" }),
    q("What is the cost of too many third-party scripts in head?", "Main-thread contention, delayed hydration/LCP, privacy risk, unpredictable failures.", "Load async, delay until interaction, self-host when possible, tag managers carefully.", { type: "debugging", slug: "third-party-scripts-cost" }),
    q("When should you use loading=lazy on iframes?", "For below-the-fold embeds (maps, videos) to reduce initial network/CPU.", "Don't lazy the primary above-the-fold embed. Still sandbox/third-party risk remains.", { type: "best-practice", slug: "lazy-iframes" }),
    q("How do you prioritize fonts in HTML?", "preconnect to font origin, preload critical woff2, use font-display strategy in CSS.", "Too many family/weights hurt. Subset when possible.", { type: "scenario", slug: "font-prioritization-html" }),
    q("What HTML streaming/SSR concerns affect performance?", "Time to first byte, progressive HTML, avoiding request waterfalls for data.", "Flush early shells. Don't block entire HTML on slow secondary data.", { type: "architecture", slug: "html-streaming-ssr-perf" }),
    q("How can <link rel=modulepreload> help?", "Preloads ES modules and their dependency graph earlier.", "Useful for critical app entry. Wrong usage wastes bandwidth.", { type: "concept", slug: "modulepreload" }),
    q("Define a performance budget for HTML assets on a content site.", "Limits for document size, image weight, third parties, LCP element rules, CI checks.", "Encode budgets into CMS constraints and monitoring alerts.", { type: "architecture", slug: "html-performance-budget" }),
  ],
  security: [
    q("How does HTML contribute to XSS defense?", "Escape untrusted text, use textContent, sanitize HTML, avoid dangerous sinks.", "Framework auto-escaping helps but bypasses exist (href javascript:, style, nested contexts).", { type: "concept", slug: "html-xss-defense" }),
    q("Why is target=_blank a security concern?", "Opened pages can access window.opener unless rel=noopener (and often noreferrer).", "Modern browsers mitigate more, but still set rel. Phishing via tabnabbing historically mattered.", { type: "concept", slug: "target-blank-noopener" }),
    q("What does the sandbox attribute on iframes do?", "Restricts iframe capabilities (scripts, forms, top-nav) via allow-flags.", "Default sandbox is strict. Add permissions sparingly. Combine with CSP where possible.", { type: "concept", slug: "iframe-sandbox" }),
    q("Explain Content-Security-Policy at a high level for HTML apps.", "HTTP header (or meta) whitelisting sources for scripts, styles, images, etc.", "script-src matters most for XSS. Nonces/hashes beat unsafe-inline. Report-Only for rollout.", { type: "architecture", slug: "csp-overview" }),
    q("Why is inline event handlers (onclick=) risky?", "Mixes code into markup and often conflicts with CSP; harder to audit.", "Use addEventListener. CSP may block inline handlers without unsafe-inline/hashes.", { type: "best-practice", slug: "inline-event-handlers-risk" }),
    q("How do you safely embed user-generated HTML?", "Sanitize with a vetted library allowlist; never regex-strip tags alone.", "Consider markdown → sanitized HTML. Escape by default; rich text is an explicit privilege.", { type: "scenario", slug: "safe-user-generated-html" }),
    q("What are dangerous URL schemes in href/src?", "javascript: and data: in navigable contexts can execute or exfiltrate.", "Validate/sanitize URLs. Prefer https:. Be careful with user-supplied redirects.", { type: "debugging", slug: "dangerous-url-schemes" }),
    q("How does autocomplete=off relate to security?", "Limited effect; browsers/password managers often ignore for login fields.", "Don't rely on it for secrets. Use proper password manager friendly attributes instead.", { type: "concept", slug: "autocomplete-off-security" }),
    q("What is referrer policy useful for?", "Controls Referer leakage across navigations and subresources.", "no-referrer or strict-origin-when-cross-origin are common defaults for privacy.", { type: "best-practice", slug: "referrer-policy" }),
    q("How can meta refresh be abused?", "Open redirects / phishing-like redirects if attacker controls content.", "Prefer HTTP redirects. Avoid user-controlled refresh URLs.", { type: "scenario", slug: "meta-refresh-abuse" }),
    q("Form security basics beyond HTTPS?", "CSRF tokens for cookie sessions, server validation, rate limits, SameSite cookies.", "HTML alone can't secure forms — backend contracts matter. Autocomplete for passwords correctly.", { type: "architecture", slug: "form-security-basics" }),
    q("How do you threat-model a rich text comment feature?", "XSS via HTML, stored payloads, admin-view escalation, CSP bypasses, SVG/math vectors.", "Sanitize on output, CSP, HttpOnly cookies, privilege separation for preview vs publish.", { type: "architecture", slug: "rich-text-threat-model" }),
  ],
};

// ============================================================================
// CSS — 8 cats
// ============================================================================
const cssCats = [
  ["Cascade", "cascade", "css-cascade", 13],
  ["Selectors", "selectors", "css-selectors", 13],
  ["Box Model", "box-model", "css-box-model", 12],
  ["Flexbox", "flexbox", "css-flexbox", 13],
  ["Grid", "grid", "css-grid", 13],
  ["Responsive", "responsive", "css-responsive", 12],
  ["Animations", "animations", "css-animations", 12],
  ["Performance", "performance", "css-performance", 12],
];

const cssSeeds = {
  cascade: [
    q("What is the CSS cascade?", "The algorithm that resolves conflicting declarations via origin, importance, specificity, and order.", "Cascade layers and inline styles participate too. Understanding it prevents !important wars and specificity traps.", { type: "concept", slug: "what-is-css-cascade" }),
    q("Explain specificity in simple terms.", "IDs > classes/attributes/pseudo-classes > elements/pseudo-elements; inline beats all except !important.", "Equal specificity → source order. :where() has zero specificity; :is() takes most specific argument.", { type: "concept", slug: "css-specificity" }),
    q("What does !important do, and when is it justified?", "Raises importance so normal rules lose; justified rarely for utilities/overrides/third-party escapes.", "Importance has its own cascade between origins. Prefer refactoring specificity/layers over spraying !important.", { type: "best-practice", slug: "important-when-justified" }),
    q("Author vs user vs user-agent stylesheets?", "Three origins; user !important can override author; UA provides defaults.", "Normalize/reboot styles manage UA differences. Accessibility user styles must be respected.", { type: "comparison", slug: "stylesheet-origins" }),
    q("What are cascade layers (@layer)?", "Explicit control of cascade priority independent of specificity within layered rules.", "Unlayered styles beat layered. Great for resets → tokens → components → utilities ordering.", { type: "concept", slug: "cascade-layers" }),
    q("How does inheritance differ from the cascade?", "Inheritance passes computed values to children for inheritable properties; cascade resolves conflicts per element.", "Use inherit, initial, unset, revert intentionally. color inherits; margin does not.", { type: "comparison", slug: "inheritance-vs-cascade" }),
    q("What is the difference between unset, revert, and revert-layer?", "unset acts as inherit/initial; revert rolls toward user/UA; revert-layer rolls back within layers.", "Useful in component isolation and undo utilities. Know which 'previous' you mean.", { type: "comparison", slug: "unset-revert-revert-layer" }),
    q("How do inline styles interact with classes?", "Inline declarations have high specificity; only !important in stylesheets can override non-important inline.", "Prefer classes for maintainability. Inline for true one-offs or framework style bindings carefully.", { type: "debugging", slug: "inline-styles-vs-classes" }),
    q("Shadow DOM and the cascade — what changes?", "Shadow trees encapsulate styles; ::part and CSS variables pierce carefully; :host styles the host.", "Global selectors don't reach inside closed shadows. Design tokens via custom properties are common bridges.", { type: "architecture", slug: "shadow-dom-cascade" }),
    q("How would you debug a style that 'won't apply'?", "Check specificity, layers, importance, invalid values, typos, and whether selector matches.", "DevTools Computed and Styles panes show crossed-out winners. Verify not overridden by later equal rules.", { type: "debugging", slug: "debug-style-not-applying" }),
    q("What is @scope and why does it help?", "Scopes selectors to a subtree/root to reduce leakage without heavy specificity.", "Helps component-local CSS in light DOM. Browser support considerations apply.", { type: "concept", slug: "css-scope" }),
    q("Presentational class soup vs semantic classes — cascade implications?", "Utility-first relies on order/layers; semantic BEM relies on low conflict and structure.", "Teams must pick conventions. Mixing without layers causes specificity fights.", { type: "architecture", slug: "utility-vs-semantic-cascade" }),
    q("Design a cascade strategy for a multi-brand design system.", "Tokens in low layers, components mid, brand overrides high, utilities carefully layered, document !important policy.", "Enforce via linting and Stylelint. Prefer tokens over one-off overrides.", { type: "architecture", slug: "multi-brand-cascade-strategy" }),
  ],
  selectors: [
    q("What is the difference between .a .b and .a.b?", "Descendant combinator vs AND on the same element.", ".a .b matches .b inside .a. .a.b matches an element with both classes.", { type: "comparison", slug: "descendant-vs-both-classes", example: "/* .card .title vs .card.featured */" }),
    q("Explain child, sibling, and adjacent sibling combinators.", "> child, ~ general sibling, + adjacent sibling.", "They don't select ancestors. Whitespace descendant is more expensive/broad than >.", { type: "concept", slug: "css-combinators" }),
    q("When do you use :is() vs :where()?", "Both list selectors; :is() keeps specificity of its most specific arg; :where() is always zero.", ":where() is great for resets. :is() for grouping without repetition.", { type: "comparison", slug: "is-vs-where" }),
    q("What does :has() enable?", "Parent/ancestor selection based on descendants — previously impossible in CSS.", "Powerful but can be style-invalidating costly. Use thoughtfully for UI states.", { type: "concept", slug: "has-selector" }),
    q("Attribute selectors — equals vs contains vs prefix?", "[attr=val], *= contains, ^= prefix, $= suffix, ~= word, |= hyphen code.", "Useful for language, data attributes, partial href matches. Prefer exact when possible.", { type: "concept", slug: "attribute-selectors" }),
    q("Pseudo-classes vs pseudo-elements?", "Pseudo-classes select states (:hover, :focus-visible); pseudo-elements style fragments (::before, ::marker).", "Single vs double colon historically mixed; use :: for modern pseudo-elements.", { type: "comparison", slug: "pseudo-class-vs-pseudo-element" }),
    q("Why prefer :focus-visible over :focus for outlines?", "Shows focus ring mainly for keyboard users, reducing mouse-focus noise.", "Don't remove outlines without :focus-visible replacement. Accessibility requirement.", { type: "best-practice", slug: "focus-visible" }),
    q("How do specificity traps happen with IDs in selectors?", "IDs outweigh many classes, making overrides painful.", "Avoid IDs in CSS hooks; use classes/data attributes. Prefer layers over escalating specificity.", { type: "debugging", slug: "id-specificity-traps" }),
    q("What are structural pseudo-classes like nth-child useful for?", "Selecting by position without extra classes — zebra rows, first/last, formulas.", "nth-child counts all children; nth-of-type filters by type. Off-by-one common.", { type: "coding", slug: "nth-child-usage" }),
    q("Selector performance myths — what matters today?", "Extremely deep selectors rarely dominate; invalidations and layout do. Still keep selectors intentional.", "Avoid universal+expensive patterns in hot paths. Measure before micro-optimizing selectors.", { type: "concept", slug: "selector-performance-myths" }),
    q("How do you style a form control only when invalid after interaction?", ":user-invalid / :user-valid (and older patterns with classes) avoid showing errors too early.", "Pair with a11y messaging. Don't rely on color alone.", { type: "scenario", slug: "user-invalid-styling" }),
    q("Explain :not() limitations and nesting.", ":not() can take complex selectors in modern CSS; specificity depends on arguments.", "Overuse reduces readability. Combine with :is for grouping.", { type: "concept", slug: "not-selector" }),
    q("Establish selector conventions for a large codebase.", "Forbid IDs, prefer data-testid only for tests, document :has usage, lint complexity, BEM or utilities.", "Consistency beats cleverness. Codemod migrations when conventions change.", { type: "architecture", slug: "selector-conventions" }),
  ],
  "box-model": [
    q("Explain content-box vs border-box.", "content-box sizes content only; border-box includes padding+border in width/height.", "border-box is the common reset for predictable layouts. box-sizing inherits with * tricks carefully.", { type: "comparison", slug: "content-box-vs-border-box" }),
    q("How do margin, padding, and border differ?", "margin is outside border (collapsible vertically); padding inside; border between.", "Backgrounds clip differently. Negative margins pull layout. padding doesn't collapse.", { type: "concept", slug: "margin-padding-border" }),
    q("What is margin collapse?", "Adjacent vertical margins can combine into one; common with parent/child and siblings.", "BFC, padding, borders, flex/grid items prevent collapse. Horizontal margins don't collapse.", { type: "concept", slug: "margin-collapse" }),
    q("What is a Block Formatting Context (BFC)?", "A layout region that contains floats and prevents margin collapse across its boundary.", "Created by overflow not visible, flex/grid items, flow-root, etc. Useful float containment.", { type: "concept", slug: "block-formatting-context" }),
    q("How do width percentage and padding interact?", "Percent padding is relative to containing block width (including vertical padding historically).", "Can surprise in height calculations. Prefer modern layout and gap when possible.", { type: "debugging", slug: "percentage-padding-quirks" }),
    q("min-width/max-width vs width — when?", "Constraints allow intrinsic/content sizing with clamps; width is preferred size.", "Useful responsive patterns: width 100%; max-width 40rem. min-width:0 critical in flex.", { type: "best-practice", slug: "min-max-width" }),
    q("What does box-sizing inherit reset look like and trade-offs?", "html { box-sizing: border-box } * { box-sizing: inherit } — predictable sizing globally.", "Third-party widgets may assume content-box. Document the reset.", { type: "coding", slug: "box-sizing-reset", example: "html { box-sizing: border-box; }\n*, *::before, *::after { box-sizing: inherit; }" }),
    q("How do outlines differ from borders?", "Outlines don't take space in the box model; often used for focus.", "outline-offset helps. Don't remove without accessible replacement.", { type: "comparison", slug: "outline-vs-border" }),
    q("Explain overflow, scroll containers, and sticky pitfalls.", "Overflow creates scrollports; sticky needs non-hidden ancestors and room to travel.", "overflow: hidden can kill sticky and create BFCs. Know which ancestor clips.", { type: "debugging", slug: "overflow-sticky-pitfalls" }),
    q("What is the visual viewport vs layout viewport conceptually?", "Mobile zoom/keyboards can change visual viewport; layout viewport drives CSS layout.", "position fixed and vh units historically quirky on mobile — svh/lvh/dvh help.", { type: "concept", slug: "visual-vs-layout-viewport" }),
    q("How do you center a box horizontally and vertically (classic)?", "Many ways: flex/grid place-items, absolute + inset/auto margins, margin auto for block widths.", "Prefer flex/grid for modern UI. Absolute centering needs positioned ancestor.", { type: "coding", slug: "centering-box-model" }),
    q("Architect spacing tokens with the box model in mind.", "Use consistent spacing scale via custom properties; prefer gap in flex/grid over margin hacks.", "Collapse and double-spacing issues shrink when gap is primary.", { type: "architecture", slug: "spacing-tokens-box-model" }),
  ],
  flexbox: [
    q("What problem does flexbox solve?", "One-dimensional distribution of space and alignment among items in a row or column.", "Great for toolbars, navs, card footers. Use grid for two-dimensional layout.", { type: "concept", slug: "what-flexbox-solves" }),
    q("main axis vs cross axis?", "main follows flex-direction; cross is perpendicular. justify-* vs align-* map accordingly.", "row → main horizontal; column → main vertical. Wrapping adds multi-line cross behavior.", { type: "concept", slug: "flex-main-vs-cross-axis" }),
    q("Explain flex-grow, flex-shrink, and flex-basis.", "grow distributes free space; shrink reduces when overflowing; basis is starting size before free space.", "flex: 1 is commonly 1 1 0% or 1 1 0 depending on browser defaults of the shorthand — know your shorthand.", { type: "concept", slug: "flex-grow-shrink-basis" }),
    q("Why does min-width: auto cause flex overflow?", "Default min-size is content-based, preventing shrinking below content; set min-width:0 to allow.", "Classic truncation bug with text in flex children. Also min-height:0 in column flex.", { type: "debugging", slug: "flex-min-width-auto" }),
    q("align-items vs align-content vs align-self?", "items aligns each item on cross axis; content packs flex lines when wrapped; self overrides per item.", "align-content only matters with multi-line flex containers.", { type: "comparison", slug: "align-items-content-self" }),
    q("How does flex-wrap change layout?", "Allows items onto new lines when they don't fit; enables align-content.", "Wrapped flex is still 1D per line, not a full 2D grid.", { type: "concept", slug: "flex-wrap" }),
    q("gap in flexbox — why prefer it over margins?", "gap spaces items without end margins collapsing/doubling hacks.", "Cleaner responsive stacks. Watch older browser support if relevant.", { type: "best-practice", slug: "flex-gap" }),
    q("How do you build a sticky footer with flex?", "Column flex on min-height 100%; main { flex: 1 } pushes footer down.", "Also achievable with grid. Avoid body margin collapse issues.", { type: "coding", slug: "flex-sticky-footer", example: "body { min-height: 100%; display: flex; flex-direction: column; }\nmain { flex: 1; }" }),
    q("order property — uses and a11y concerns?", "Visual reorder without changing DOM; can break keyboard/AT reading order.", "Prefer DOM order matching visual order. Use order sparingly.", { type: "best-practice", slug: "flex-order-a11y" }),
    q("flex shorthand pitfalls?", "flex: auto vs none vs 1 change basis/grow/shrink dramatically.", "Read the expanded values. Debugging: look at computed flex-* in DevTools.", { type: "debugging", slug: "flex-shorthand-pitfalls" }),
    q("When is flex better than float-based layouts?", "Almost always for modern 1D alignment — fewer clearfix hacks, better distribution.", "Floats remain for text wrapping around images, not page layout.", { type: "comparison", slug: "flex-vs-floats" }),
    q("Responsive nav with flex — approach?", "Space-between for logo/links; wrap or collapse to menu; align-items center.", "Use media queries or container queries for hamburger switch. Keep focus order sensible.", { type: "scenario", slug: "responsive-nav-flex" }),
    q("Design flex utilities for a design system.", "Document direction, wrap, justify, align, grow, gap tokens; warn about min-width:0.", "Provide recipes for common patterns to avoid one-off CSS.", { type: "architecture", slug: "flex-utilities-design-system" }),
  ],
  grid: [
    q("What problem does CSS Grid solve?", "Two-dimensional layout with rows and columns, including overlapping and precise placement.", "Ideal for page shells and complex component layouts. Complements flex for 1D.", { type: "concept", slug: "what-grid-solves" }),
    q("fr units vs % vs auto in tracks?", "fr shares free space; % is definite percentage; auto is content-based sizing.", "minmax(0, 1fr) often needed to allow shrinking below content. repeat(auto-fit, minmax()) for responsive grids.", { type: "comparison", slug: "fr-vs-percent-vs-auto" }),
    q("Explain grid-template-areas.", "Name cells and place items with grid-area for readable layouts.", "Ascii-art templates help maintain page regions. Quotes per row must align cell counts.", { type: "coding", slug: "grid-template-areas", example: "grid-template-areas:\n  'header header'\n  'nav main'\n  'footer footer';" }),
    q("auto-fit vs auto-fill?", "Both create as many tracks as fit; auto-fit collapses empty tracks, auto-fill keeps them.", "Affects how items expand into leftover space with minmax.", { type: "comparison", slug: "auto-fit-vs-auto-fill" }),
    q("How do implicit vs explicit grids differ?", "Explicit tracks defined by templates; implicit tracks created by placement overflow.", "grid-auto-rows/columns style implicit tracks. Unexpected rows often mean placement bugs.", { type: "concept", slug: "implicit-vs-explicit-grid" }),
    q("alignment: justify-items vs justify-content in grid?", "items aligns content inside cells; content aligns the grid when smaller than container.", "Also place-items/place-content shorthands. stretch is default for items.", { type: "comparison", slug: "grid-alignment" }),
    q("How do you overlap items intentionally?", "Place multiple items into same cells or use line-based spans/z-index.", "Useful for badges on cards, decorative layers. Manage stacking contexts.", { type: "coding", slug: "grid-overlap" }),
    q("subgrid — what is it for?", "Lets child grids inherit parent track sizing for aligned nested columns/rows.", "Powerful for card internals aligning across a list. Support considerations.", { type: "concept", slug: "subgrid" }),
    q("minmax and responsive card grids pattern?", "repeat(auto-fit, minmax(min(100%, 16rem), 1fr)) creates fluid columns.", "Avoid fixed column counts when content should reflow naturally.", { type: "best-practice", slug: "minmax-responsive-cards" }),
    q("Grid vs absolute positioning for dashboards?", "Grid keeps flow/accessibility and responsive reflow; absolute is brittle for content size changes.", "Absolute for decorative overlays inside a grid cell can still be fine.", { type: "scenario", slug: "grid-vs-absolute-dashboard" }),
    q("Why does 1fr behave like minmax(auto, 1fr) and overflow?", "Tracks won't shrink below content min by default; use minmax(0,1fr) to allow.", "Same family of bugs as flex min-size. Truncation needs overflow hidden + min 0.", { type: "debugging", slug: "fr-minmax-overflow" }),
    q("Named lines — when useful?", "Readable placement like grid-column: main-start / main-end in complex templates.", "Helps large layout systems. Document line names in the design system.", { type: "concept", slug: "named-grid-lines" }),
    q("Define a page layout system with grid areas.", "Shell template areas for header/nav/main/aside/footer; components use nested grids/flex.", "Collapse areas responsively by redefining templates. Keep landmarks in HTML, not only CSS.", { type: "architecture", slug: "page-layout-grid-system" }),
  ],
  responsive: [
    q("What is responsive design vs adaptive design?", "Responsive fluidly reflows; adaptive often switches discrete layouts/breakpoints.", "Modern sites mix both: fluid type/grids plus breakpoint redesigns.", { type: "comparison", slug: "responsive-vs-adaptive" }),
    q("Explain mobile-first media queries.", "Base styles for small screens; min-width queries enhance upward.", "Avoid fighting desktop-first overrides. Test real devices, not only narrow desktop windows.", { type: "best-practice", slug: "mobile-first-media-queries" }),
    q("Viewport meta tag — what does it do?", "Controls layout viewport on mobile so CSS pixels match device appropriately.", "width=device-width, initial-scale=1 is standard. Accessibility: avoid disabling zoom.", { type: "concept", slug: "viewport-meta" }),
    q("Container queries vs media queries?", "Container queries respond to parent size; media queries to viewport/device features.", "@container enables component-level responsiveness in different layout contexts.", { type: "comparison", slug: "container-vs-media-queries" }),
    q("Fluid typography approaches?", "clamp() with viewport units, or container-based type; modular scales.", "Avoid tiny/huge extremes. Prefer rem roots. Test zoom and localization length.", { type: "coding", slug: "fluid-typography", example: "font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);" }),
    q("How do you choose breakpoints?", "Content-driven when layout breaks, not device pantheon lists.", "Start from design comps but validate with real content. Prefer fewer breakpoints.", { type: "best-practice", slug: "choosing-breakpoints" }),
    q("Responsive images in CSS context?", "Use max-width:100%; height:auto; object-fit; optionally image-set.", "Still need HTML srcset/picture for art direction and bandwidth.", { type: "scenario", slug: "responsive-images-css" }),
    q("Common responsive nav patterns?", "Priority+ overflow, hamburger disclosure, multi-level with focus traps.", "Ensure keyboard access and visible labels. Don't rely on hover alone.", { type: "scenario", slug: "responsive-nav-patterns" }),
    q("What are svh, lvh, dvh?", "Small/large/dynamic viewport height units addressing mobile browser chrome.", "100vh bugs on mobile; prefer dvh/svh thoughtfully for full-screen sections.", { type: "concept", slug: "svh-lvh-dvh" }),
    q("How do prefers-reduced-motion and prefers-color-scheme fit responsive thinking?", "Respond to user preferences like other environmental features.", "Media queries aren't only width. Build inclusive defaults.", { type: "best-practice", slug: "preference-media-queries" }),
    q("Debug a layout that breaks only between two widths.", "Find the conflicting query, inflexible widths, overflow ancestors, or grid track mins.", "Use DevTools responsive mode and show media query ranges.", { type: "debugging", slug: "debug-mid-breakpoint-breakage" }),
    q("Architect responsive tokens and breakpoints for a DS.", "Shared breakpoint aliases, container query names, fluid type/spacing tokens, documented usage.", "Avoid per-feature one-off breakpoints proliferating.", { type: "architecture", slug: "responsive-tokens-architecture" }),
  ],
  animations: [
    q("transition vs animation — when each?", "transitions interpolate property changes; animations use keyframes for sequenced/looping motion.", "Transitions for UI state; keyframes for loader/entrance choreography.", { type: "comparison", slug: "transition-vs-animation" }),
    q("Which properties are 'cheap' to animate?", "Prefer transform and opacity (compositor-friendly); avoid layout-thrashing top/left/width.", "will-change sparingly. Measure jank on low-end devices.", { type: "best-practice", slug: "cheap-animation-properties" }),
    q("Explain animation-fill-mode.", "Controls values before/after execution (none, forwards, backwards, both).", "forwards keeps final keyframe styles. Without it, elements may snap back.", { type: "concept", slug: "animation-fill-mode" }),
    q("How do you respect prefers-reduced-motion?", "Wrap motion in @media (prefers-reduced-motion: no-preference) or reduce to instant opacity.", "Essential info must not rely on motion alone. Provide pause for long animations.", { type: "best-practice", slug: "prefers-reduced-motion" }),
    q("easing functions — why not always linear?", "Perceived realism and UI polish; ease-out for exits, ease-in-out for moves.", "Custom cubic-bezier for brand motion. Overshoot carefully for restraint.", { type: "concept", slug: "easing-functions" }),
    q("How do you debug a transition that doesn't run?", "Check if property is animatable, values comparable, specificity, display:none toggles, reduced motion.", "display can't interpolate; use opacity/visibility patterns or @starting-style.", { type: "debugging", slug: "debug-transition-not-running" }),
    q("What is @keyframes composition with multiple animations?", "Multiple animations on one element via comma-separated lists; watch conflicting properties.", "animation shorthand order matters. Name collisions across bundles.", { type: "coding", slug: "multiple-animations" }),
    q("Scroll-driven animations — concept?", "Tie animation progress to scroll timelines instead of time.", "Powerful for storytelling; still honor reduced motion and performance budgets.", { type: "concept", slug: "scroll-driven-animations" }),
    q("GPU layers and will-change pitfalls?", "will-change can promote layers but wastes memory if overused.", "Add only around interaction, remove after. Don't will-change: everything.", { type: "debugging", slug: "will-change-pitfalls" }),
    q("Design motion guidelines for a product.", "Durations scale, easing tokens, reduced-motion policy, when motion is allowed.", "Codify in DS. Avoid novelty animations that delay task completion.", { type: "architecture", slug: "motion-guidelines" }),
    q("How do enter/exit animations work with display:none?", "Historically hard; modern approaches include @starting-style, WAAPI, or keep in DOM briefly.", "Libraries often manage mount/unmount timing. Accessibility: don't delay focus too long.", { type: "scenario", slug: "enter-exit-display-none" }),
    q("FLIP technique at a high level?", "First/Last/Invert/Play — animate transforms to simulate layout changes cheaply.", "Useful for shared-element-like rearrangements without animating layout props.", { type: "concept", slug: "flip-technique" }),
  ],
  performance: [
    q("What CSS patterns cause layout thrashing?", "Forcing sync layout by reading geometry then writing styles in loops; animating layout props.", "Batch reads/writes. Prefer transforms. Use DevTools performance panel.", { type: "debugging", slug: "css-layout-thrashing" }),
    q("How does CSS affect rendering pipeline stages?", "Styles → layout → paint → composite; some changes skip earlier stages.", "Knowing what invalidates helps choose properties (transform vs top).", { type: "concept", slug: "css-rendering-pipeline" }),
    q("Critical CSS strategy?", "Inline minimal above-the-fold CSS; defer the rest; avoid huge inlined blobs.", "Automate extraction carefully. Reassess as designs change.", { type: "architecture", slug: "critical-css-strategy" }),
    q("Selector and stylesheet size — what to optimize?", "Remove dead CSS, split by route, avoid huge unused frameworks on critical path.", "Purge carefully with dynamic class names. Compression + caching matter.", { type: "best-practice", slug: "css-bundle-size" }),
    q("contain and content-visibility benefits?", "Hint browsers to isolate layout/paint work; skip rendering offscreen content.", "content-visibility:auto can boost long pages. Need contain-intrinsic-size to reduce scrolljump.", { type: "concept", slug: "contain-content-visibility" }),
    q("Font loading performance with CSS?", "font-display strategies, subsetting, preload, limit weights.", "FOIT/FOUT trade-offs. System font stacks for speed when brand allows.", { type: "scenario", slug: "font-loading-css-perf" }),
    q("Why are large box-shadows/filters costly?", "They can expand paint areas and be expensive on scroll/animate.", "Prefer simpler shadows; animate opacity/transform on pre-promoted layers.", { type: "concept", slug: "box-shadow-filter-cost" }),
    q("How do you find unused CSS?", "Coverage tool, PurgeCSS/UnCSS with caveats, design-system adoption metrics.", "Dynamic classes and runtime CSS-in-JS complicate static purge.", { type: "debugging", slug: "find-unused-css" }),
    q("CSS-in-JS runtime cost concerns?", "Runtime injection/hashing can cost CPU and delay paint vs static extraction.", "Prefer zero-runtime or build-time extraction for critical UI when possible.", { type: "comparison", slug: "css-in-js-runtime-cost" }),
    q("image-set and CSS backgrounds performance?", "Offer resolution/format alternatives; still prefer HTML img for content LCP.", "Don't hide LCP content in CSS backgrounds.", { type: "best-practice", slug: "image-set-perf" }),
    q("Long lists: CSS techniques to help?", "content-visibility, virtualization (JS), avoid expensive per-item effects.", "Pure CSS can't fully virtualize like windowing libraries.", { type: "scenario", slug: "long-list-css-perf" }),
    q("Set a CSS performance budget for a team.", "Max critical CSS KB, banned properties for animation, lint rules, monitoring CLS/INP.", "Encode in CI. Review third-party CSS.", { type: "architecture", slug: "css-performance-budget" }),
  ],
};

// ============================================================================
// TypeScript — 14 cats totaling 100 (8+7+8+7×11 = 100)
// ============================================================================
const tsCats = [
  ["Types", "types", "ts-types", 8],
  ["Interfaces", "interfaces", "ts-interfaces", 7],
  ["Generics", "generics", "ts-generics", 8],
  ["Utility Types", "utility-types", "ts-utility-types", 7],
  ["Type Narrowing", "narrowing", "ts-narrowing", 7],
  ["Type Guards", "type-guards", "ts-type-guards", 7],
  ["Classes", "classes", "ts-classes", 7],
  ["Decorators", "decorators", "ts-decorators", 7],
  ["Advanced Types", "advanced-types", "ts-advanced-types", 7],
  ["Conditional Types", "conditional-types", "ts-conditional-types", 7],
  ["Mapped Types", "mapped-types", "ts-mapped-types", 7],
  ["Type Inference", "inference", "ts-inference", 7],
  ["Type Safety", "type-safety", "ts-type-safety", 7],
  ["Architecture", "architecture", "ts-architecture", 7],
];

const tsSeeds = {
  types: [
    q("What are TypeScript's primitive types?", "string, number, boolean, null, undefined, symbol, bigint — plus special any/unknown/never/void.", "Prefer precise primitives over any. Note number covers floats/ints; bigint is separate.", { type: "concept", slug: "primitive-types" }),
    q("any vs unknown vs never?", "any disables checking; unknown is top type needing narrowing; never is empty/uninhabited.", "Prefer unknown for untrusted input. never appears in exhaustiveness and impossible returns.", { type: "comparison", slug: "any-vs-unknown-vs-never" }),
    q("What is a union type and when do you use it?", "A value that can be one of several types — model alternatives explicitly.", "Narrow with typeof/in/discriminants. Avoid huge untagged unions when objects differ.", { type: "concept", slug: "union-types" }),
    q("Intersection types — what are they for?", "Combine types (A & B); useful for mixins and object composition.", "Conflicts in same property types can become never. Prefer interfaces for object extension often.", { type: "concept", slug: "intersection-types" }),
    q("type vs interface for object shapes?", "Both describe objects; interfaces merge via declaration merging; type aliases can union/intersect freely.", "Team style often: interfaces for objects, types for unions/mapped. Be consistent.", { type: "comparison", slug: "type-vs-interface" }),
    q("What are literal types?", "Types that are specific values like 'admin' or 42; power discriminated unions.", "as const asserts widen-prevention. Useful for event names and config keys.", { type: "concept", slug: "literal-types" }),
    q("Explain void vs undefined as return types.", "void means callers shouldn't use the return value; undefined is the undefined value type.", "Callbacks typed void can return values still. Avoid void for variables storing undefined.", { type: "comparison", slug: "void-vs-undefined" }),
    q("How do tuples differ from arrays in TS?", "Tuples have fixed length/position types; arrays are homogeneous variable length.", "Labeled tuple elements improve readability. Optional/rest elements supported.", { type: "concept", slug: "tuples-vs-arrays" }),
  ],
  interfaces: [
    q("What is declaration merging for interfaces?", "Same-name interfaces combine members — useful for extending lib types.", "Unexpected merges can widen APIs. Prefer module augmentation intentionally.", { type: "concept", slug: "declaration-merging" }),
    q("How do you extend interfaces?", "extends clause for one or more bases; resulting type must be assignable consistently.", "Conflicts must be compatible. Classes can implement interfaces.", { type: "coding", slug: "extending-interfaces", example: "interface A { x: number }\ninterface B extends A { y: string }" }),
    q("Optional vs readonly properties?", "?: may be absent; readonly prevents reassignment of the property.", "readonly is shallow. Optional undefined vs missing differs under exactOptionalPropertyTypes.", { type: "comparison", slug: "optional-vs-readonly" }),
    q("Index signatures — uses and pitfalls?", "Allow dynamic keys with a value type; can force all properties to be assignable to that type.", "Prefer maps/Records for dictionaries. String indexes interact with declared fields carefully.", { type: "concept", slug: "index-signatures" }),
    q("How do function types appear in interfaces?", "Call signatures or property-function members; prefer method vs property for bivariance nuances.", "this typing in methods matters. Overload call signatures possible.", { type: "concept", slug: "function-types-in-interfaces" }),
    q("Interface for API response modeling tips?", "Model only what you use; validate at runtime; don't trust backend blindly.", "Separate DTO types from domain types when shapes diverge.", { type: "best-practice", slug: "api-response-interfaces" }),
    q("When do interfaces become an anti-pattern?", "God interfaces, premature abstraction, and over-modeling JSON 1:1 without validation.", "Prefer smaller contracts and composition. Codegen OpenAPI carefully.", { type: "architecture", slug: "interface-antipatterns" }),
  ],
  generics: [
    q("What problem do generics solve?", "Parametrize types for reusable, type-safe APIs without losing specificity.", "identity<T>(x: T): T preserves input type vs any. Constraints limit T.", { type: "concept", slug: "what-generics-solve" }),
    q("Explain generic constraints (extends).", "Restrict type parameters so you can access known members safely.", "T extends { id: string } enables x.id. Constraints compose carefully with defaults.", { type: "concept", slug: "generic-constraints", example: "function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}" }),
    q("Default type parameters — when useful?", "Provide sensible defaults so callers needn't always specify args.", "Common in component props and builder APIs. Defaults still constrained.", { type: "best-practice", slug: "default-type-parameters" }),
    q("keyof and indexed access with generics?", "keyof T gets keys; T[K] gets value types — foundation of type-safe pickers.", "K extends keyof T is the classic pattern. Remapping in mapped types builds on this.", { type: "coding", slug: "keyof-indexed-access" }),
    q("Generic variance intuition (in/out)?", "TypeScript uses bivariant hacks historically for methods; explicit in/out variance annotations exist for type params.", "Important for complex library APIs. Prefer immutable patterns to avoid pitfalls.", { type: "concept", slug: "generic-variance" }),
    q("Why inference sometimes fails with generics?", "Too few contextual clues, multiple candidates, or unconstrained excess.", "Add contextual types, defaults, or helper functions. Avoid over-complex signatures.", { type: "debugging", slug: "generic-inference-failures" }),
    q("Generics vs overloads — how to choose?", "Generics for parametric polymorphism; overloads for discrete input/output pairings.", "Overloads can be clearer for heterogeneous cases; keep list ordered from specific to general.", { type: "comparison", slug: "generics-vs-overloads" }),
    q("Design a type-safe event emitter with generics.", "Map event names to payload types; on/emit constrained by keyof map.", "Prevents wrong payload types. Consider once/off and async handlers.", { type: "architecture", slug: "generic-event-emitter", example: "type Events = { login: { userId: string }; logout: void };\n// emit('login', { userId }) ok; emit('login', 1) error" }),
  ],
  "utility-types": [
    q("What does Partial<T> do?", "Makes all properties optional — useful for patches/updates.", "Shallow only. Deep partial needs custom mapped types.", { type: "concept", slug: "partial-utility" }),
    q("Pick vs Omit?", "Pick selects keys; Omit removes keys from a type.", "Prefer them over manual duplication. Combine with Partial for update DTOs.", { type: "comparison", slug: "pick-vs-omit" }),
    q("Record<K, V> use cases?", "Object type with keys K and values V — dictionaries and maps of known keys.", "Prefer Map at runtime when keys are dynamic/frequent add-delete. Record is a type.", { type: "concept", slug: "record-utility" }),
    q("Required and Readonly?", "Required removes optionality; Readonly makes props readonly.", "Shallow. Useful for freezing config types and completing option bags.", { type: "concept", slug: "required-readonly" }),
    q("ReturnType and Parameters?", "Extract return type or parameter tuple from a function type.", "Great for wrapping APIs without importing private types. Doesn't run the function.", { type: "coding", slug: "returntype-parameters" }),
    q("NonNullable and Awaited?", "NonNullable removes null|undefined; Awaited unwraps Promise-like chains.", "Common in async data pipelines and strict null cleanup.", { type: "concept", slug: "nonnullable-awaited" }),
    q("When should you write custom utilities instead of built-ins?", "When you need deep variants, key remapping, or domain-specific transforms.", "Keep utilities documented and tested via type tests (expectType).", { type: "architecture", slug: "custom-vs-builtin-utilities" }),
  ],
  narrowing: [
    q("What is control-flow narrowing?", "TS refining types based on checks like typeof, equality, and returns.", "Enables safe property access after guards. Understand what resets narrowing.", { type: "concept", slug: "control-flow-narrowing" }),
    q("How does typeof narrowing work and its limits?", "Distinguishes primitives; typeof null is object historically — handle null separately.", "Doesn't narrow custom class instances well — use instanceof.", { type: "concept", slug: "typeof-narrowing" }),
    q("Discriminated unions — pattern?", "Shared literal tag field to distinguish variants for exhaustive switches.", "Preferred over boolean flags soup. Enables never checks for exhaustiveness.", { type: "best-practice", slug: "discriminated-unions", example: "type Shape =\n  | { kind: 'circle'; r: number }\n  | { kind: 'square'; size: number };" }),
    q("Truthy narrowing pitfalls?", "Empty string/0/NaN are falsy — may incorrectly narrow away valid values.", "Prefer explicit null checks for those domains. == null catches null and undefined.", { type: "debugging", slug: "truthy-narrowing-pitfalls" }),
    q("in operator narrowing?", "Checks property existence to narrow unions of objects.", "Careful with optional properties and prototypes. Prefer discriminants when possible.", { type: "concept", slug: "in-operator-narrowing" }),
    q("Assertion functions (asserts)?", "Functions that throw and tell TS a condition is true afterward.", "Useful for shared assertDefined helpers. Must actually throw on failure.", { type: "coding", slug: "assertion-functions" }),
    q("Why does narrowing fail after assigning to a variable?", "Aliasing can invalidate narrowing if TS can't prove the alias is unchanged.", "Inline checks or use const + careful patterns. Known footgun with property stores.", { type: "debugging", slug: "narrowing-alias-footgun" }),
  ],
  "type-guards": [
    q("What is a user-defined type guard?", "Function returning `arg is Type` that narrows when true.", "Implement runtime check correctly — TS trusts the predicate.", { type: "concept", slug: "user-defined-type-guard", example: "function isString(x: unknown): x is string {\n  return typeof x === 'string';\n}" }),
    q("instanceof vs custom guards?", "instanceof uses prototype chain; custom guards for interfaces/plain objects.", "Interfaces don't exist at runtime — need discriminants or validators.", { type: "comparison", slug: "instanceof-vs-custom-guards" }),
    q("How do you type-guard arrays of unknowns?", "Array.isArray plus element predicates; consider every() for homogeneous arrays.", "For tuples, length and positional checks. Validate externally sourced JSON carefully.", { type: "coding", slug: "array-type-guards" }),
    q("Zod/io-ts vs hand-written guards?", "Libraries give parsers + inferred types; hand guards are lighter but error-prone.", "Prefer schema libs at trust boundaries (API, forms).", { type: "comparison", slug: "schema-libs-vs-hand-guards" }),
    q("Exhaustiveness checks with never?", "In default/switch, assign residual to never to force handling new variants.", "Compile-time safety for evolving unions. Pair with discriminants.", { type: "best-practice", slug: "exhaustiveness-never" }),
    q("Type predicates with generics?", "Guards can be generic to narrow to T when runtime check confirms.", "Keep predicates honest. Avoid `x is T` without testing T's shape.", { type: "coding", slug: "generic-type-predicates" }),
    q("Security note on type guards?", "Guards are compile-time illusions unless runtime validation is correct.", "Never trust casts. Validate untrusted input at boundaries.", { type: "architecture", slug: "type-guards-security" }),
  ],
  classes: [
    q("How do parameter properties work?", "Constructor parameter shortcuts like public readonly id: string auto-create fields.", "Concise for DTOs/services. Don't overuse for fat constructors.", { type: "concept", slug: "parameter-properties" }),
    q("public/private/protected vs #private?", "TS visibility is compile-time; # is runtime private hard privacy.", "private can be bypassed via brackets; # cannot. Choose based on encapsulation needs.", { type: "comparison", slug: "ts-private-vs-hash-private" }),
    q("abstract classes vs interfaces?", "Abstract classes can provide implementation + template methods; interfaces are pure contracts.", "Use abstract when sharing code; interfaces when multiple unrelated implementers.", { type: "comparison", slug: "abstract-class-vs-interface" }),
    q("What does implements do?", "Requires a class to satisfy an interface's members structurally.", "Doesn't add runtime. Excess property nuances differ from object literals.", { type: "concept", slug: "implements-keyword" }),
    q("Class field initialization order pitfalls?", "Base fields/constructors vs derived; use definite assignment and careful supers.", "TS definite assignment assertions (!) can hide bugs — prefer proper init.", { type: "debugging", slug: "class-field-init-order" }),
    q("When are classes preferable to closures/factories?", "When you need instanceof, inheritance hierarchies, or DI frameworks expecting classes.", "Otherwise functions + modules often simpler. Prefer composition.", { type: "best-practice", slug: "classes-vs-factories" }),
    q("Typing this in class methods/callbacks?", "Arrow properties capture this; bind; or specify this parameters.", "Passing raw methods as callbacks loses this — classic bug.", { type: "scenario", slug: "typing-this-in-classes" }),
  ],
  decorators: [
    q("What are decorators in TypeScript?", "Functions that wrap/annotate classes and members for metaprogramming.", "Used heavily by Angular/Nest. Syntax evolved (legacy experimental vs Stage 3).", { type: "concept", slug: "what-are-decorators" }),
    q("legacy experimentalDecorators vs new decorators?", "Old TS emit differs from TC39 decorators; frameworks may depend on legacy.", "Know which your toolchain expects. Don't mix casually.", { type: "comparison", slug: "legacy-vs-new-decorators" }),
    q("Common decorator use cases?", "Dependency injection tokens, route metadata, validation, logging, ORM columns.", "Prefer explicit config when magic hurts readability/testability.", { type: "scenario", slug: "decorator-use-cases" }),
    q("How do class decorators run conceptually?", "Receive the class (or replace it) at definition time — not per instance.", "Order matters with multiple decorators. Understand compose bottom-up/top-down rules.", { type: "concept", slug: "class-decorator-runtime" }),
    q("Decorator metadata reflection caveats?", "reflect-metadata + emitDecoratorMetadata can expose design:type but is limited/imperfect.", "Don't treat metadata as fully sound typing. Prefer explicit schemas.", { type: "debugging", slug: "decorator-metadata-caveats" }),
    q("Testing code that relies on decorators?", "May need framework testing utilities or to test behavior not decorator wiring.", "Prefer injecting deps over reading decorator metadata in unit tests.", { type: "best-practice", slug: "testing-decorated-code" }),
    q("When should a team avoid decorators?", "If they obscure control flow, hurt onboarding, or lock you to compiler flags.", "Use for established DI frameworks; avoid novel DIY decorator DSLs without need.", { type: "architecture", slug: "when-to-avoid-decorators" }),
  ],
  "advanced-types": [
    q("What is a branded/nominal type pattern?", "Intersect with unique brand to prevent mixing compatible primitives (UserId vs OrderId).", "Zero-runtime cost with casting at boundaries. Improves domain safety.", { type: "coding", slug: "branded-types", example: "type UserId = string & { readonly __brand: 'UserId' };" }),
    q("Template literal types — uses?", "Compose string unions like `on${Capitalize<Event>}` for typed event names.", "Powerful for routing paths and CSS-in-TS. Keep complexity bounded.", { type: "concept", slug: "template-literal-types" }),
    q("What are recursive types good for?", "JSON, trees, linked structures — types referencing themselves.", "Need base cases. Compiler depth limits exist — simplify when errors obscure.", { type: "concept", slug: "recursive-types" }),
    q("Satisfies operator — why use it?", "Checks a value matches a type without widening to that type.", "Preserves literal inference while validating shape — great for config objects.", { type: "comparison", slug: "satisfies-operator" }),
    q("const type parameters?", "generic const T preserves literal types from arguments.", "Helps APIs that want narrow inference from object/array literals.", { type: "concept", slug: "const-type-parameters" }),
    q("Polymorphic this types?", "Methods return this for fluent subclass-preserving builders.", "Useful in base classes with fluent APIs.", { type: "coding", slug: "polymorphic-this" }),
    q("When is type-level programming too much?", "When errors become unreadable and juniors can't contribute — prefer simpler models.", "Balance cleverness with DX. Document complex types heavily.", { type: "architecture", slug: "type-level-overuse" }),
  ],
  "conditional-types": [
    q("What is a conditional type?", "T extends U ? X : Y — choose types based on assignability.", "Foundation of many utilities (Exclude, Extract). Distributes over naked type params.", { type: "concept", slug: "what-is-conditional-type" }),
    q("What is distributivity in conditional types?", "Naked T extends U ? X : Y applied to unions distributes over members.", "Wrap in [] to disable. Explains Exclude behavior on unions.", { type: "concept", slug: "conditional-distributivity" }),
    q("infer keyword — what does it do?", "Declare a type variable to capture from extends patterns.", "Example: T extends (...args: infer P) => any ? P : never. Core of ReturnType.", { type: "coding", slug: "infer-keyword", example: "type Elem<T> = T extends (infer U)[] ? U : T;" }),
    q("Extract and Exclude implemented how?", "Conditional types filtering unions by assignability to a type.", "Useful for refining event maps and removing nullish members.", { type: "concept", slug: "extract-exclude" }),
    q("How do you flatten Promise types with conditionals?", "Recursive Awaited-like conditionals unwrapping thenables.", "Handle non-promise passthrough. Avoid infinite recursion.", { type: "coding", slug: "flatten-promise-conditional" }),
    q("Debugging monstrous conditional types?", "Simplify intermediates, use helper aliases, TypeScript language service hover, type tests.", "Split steps. Prefer readable incremental transforms.", { type: "debugging", slug: "debug-conditional-types" }),
    q("Library design: expose conditionals or simpler overloads?", "Prefer ergonomic overloads/docs for app devs; keep heavy conditionals internal.", "Public types are API — optimize for error message clarity.", { type: "architecture", slug: "conditionals-in-public-apis" }),
  ],
  "mapped-types": [
    q("What is a mapped type?", "{ [K in keyof T]: ... } transforms each property systematically.", "Powers Partial/Readonly/Pick. Can remap keys with as clauses.", { type: "concept", slug: "what-is-mapped-type" }),
    q("Key remapping with as — example use?", "Filter/rename keys: { [K in keyof T as Exclude<K, 'x'>]: T[K] }.", "Template literals can prefix keys (getX style). Extremely expressive.", { type: "coding", slug: "key-remapping" }),
    q("How do modifiers +, - work in mapped types?", "Add/remove readonly or ? optionality on generated props.", "Example: { -readonly [K in keyof T]-?: T[K] } makes required mutable.", { type: "concept", slug: "mapped-modifiers" }),
    q("Homomorphic mapped types — why special?", "Preserve optional/readonly modifiers from the original when mapping keyof T.", "Important when wrapping existing object types.", { type: "concept", slug: "homomorphic-mapped-types" }),
    q("Build a DeepReadonly<T>?", "Recursive mapped type making properties readonly including nested objects.", "Handle arrays/functions carefully. Watch recursion limits.", { type: "coding", slug: "deep-readonly" }),
    q("Mapped types vs runtime mapping?", "Mapped types erase at compile time — still need runtime loops for values.", "Don't confuse type transforms with JS Object.map.", { type: "comparison", slug: "mapped-types-vs-runtime" }),
    q("When mapped types hurt DX?", "Excessive nesting yields opaque errors; provide named aliases and examples.", "Export intermediate types for consumers.", { type: "architecture", slug: "mapped-types-dx" }),
  ],
  inference: [
    q("How does contextual typing work?", "TS infers types from location — e.g. callback args from parameter types of a function.", "Lets you omit annotations safely. Breaks when context is lost (extracted functions).", { type: "concept", slug: "contextual-typing" }),
    q("When should you annotate vs rely on inference?", "Annotate exported APIs and boundaries; infer locals when obvious.", "Explicit return types document contracts and catch impl drift.", { type: "best-practice", slug: "annotate-vs-infer" }),
    q("Why does let x = [] become any[]?", "Insufficient elements to infer; widens unsafely without context.", "Annotate as string[] or use as const / satisfies. noImplicitAny helps catch.", { type: "debugging", slug: "empty-array-inference" }),
    q("as const assertion effects?", "Narrows to literal types and makes tuples/readonly deeply for literals.", "Unlocks discriminated unions and template literal precision.", { type: "concept", slug: "as-const" }),
    q("Return type inference with complex conditionals?", "May widen or become hard to read — annotate exports.", "Hover to verify. Split functions to guide inference.", { type: "scenario", slug: "complex-return-inference" }),
    q("Inference across generic call chains?", "Each step should propagate type args; broken if intermediate typed as any/unknown poorly.", "Helper identity functions and careful generics preserve types.", { type: "debugging", slug: "generic-chain-inference" }),
    q("Design APIs for good inference.", "Prefer arguments that carry literals, overloads ordered well, avoid early widening.", "Test inference with type-level unit tests.", { type: "architecture", slug: "api-design-for-inference" }),
  ],
  "type-safety": [
    q("What does strict mode enable that's important?", "strictNullChecks, noImplicitAny, strictFunctionTypes, etc. — core soundness options.", "Turn on for new projects. Migrate incrementally for legacy.", { type: "concept", slug: "strict-mode" }),
    q("Why is any contagious?", "Flows through assignments and disables checking downstream.", "Ban via eslint @typescript-eslint/no-explicit-any with controlled exceptions.", { type: "best-practice", slug: "any-is-contagious" }),
    q("Safe patterns for JSON.parse?", "Parse unknown then validate (zod); avoid casting to a detailed interface blindly.", "Runtime validation is part of type safety at boundaries.", { type: "coding", slug: "safe-json-parse" }),
    q("Non-null assertion (!) risks?", "Tells compiler to ignore nullish — can crash at runtime if wrong.", "Prefer narrowing. Reserve ! for proven invariants after checks.", { type: "debugging", slug: "non-null-assertion-risks" }),
    q("Type assertion vs type conversion?", "as Type is compile-time only; conversion is runtime (Number(x)).", "Assertions don't change values. Double assertions via unknown are escape hatches — use sparingly.", { type: "comparison", slug: "assertion-vs-conversion" }),
    q("How do you migrate a JS codebase toward type safety?", "allowJs + checkJs, incremental strictness, typed boundaries first, any budgets.", "Don't boil the ocean. Prioritize domain core and public APIs.", { type: "scenario", slug: "migrate-js-to-ts-safety" }),
    q("Soundness vs productivity trade-offs?", "TS is intentionally unsound in places (bivariance historical, excess property limited).", "Understand holes. Use lint/runtime checks to compensate critical paths.", { type: "architecture", slug: "soundness-vs-productivity" }),
  ],
  architecture: [
    q("How do you structure types in a large TS monorepo?", "Shared packages for domain types, app-local UI types, avoid circular type imports.", "Generate API types from OpenAPI. Keep runtime validators next to types.", { type: "architecture", slug: "monorepo-type-structure" }),
    q("DTO vs domain model typing?", "Separate transport shapes from rich domain types; map at boundaries.", "Prevents leaking persistence/API details into core logic.", { type: "architecture", slug: "dto-vs-domain-types" }),
    q("Dependency injection typing approaches?", "Constructor typing, tokens with interfaces, frameworks (Nest) with decorators.", "Prefer interface-based ports for testability. Avoid concrete-only graphs.", { type: "scenario", slug: "di-typing-approaches" }),
    q("How do path aliases affect architecture?", "Clean imports but can hide circular deps; configure consistently in TS + bundler.", "Prefer package boundaries over deep alias spaghetti.", { type: "best-practice", slug: "path-aliases-architecture" }),
    q("Public API surface for a TS library?", "Export minimal types/functions; use package.json exports; avoid leaking internals.", "Version types carefully — they are breaking changes too.", { type: "architecture", slug: "library-public-api" }),
    q("Error typing strategies?", "Result types, neverthrow, typed error subclasses, or unknown + narrow at edges.", "Avoid throwing any. Document error contracts across services.", { type: "comparison", slug: "error-typing-strategies" }),
    q("Lead: set TypeScript engineering standards for a team.", "strict defaults, eslint rules, type-test CI, boundary validation policy, review guidelines for any/assertions.", "Teach via examples. Measure any count over time. Align tsconfig across packages.", { type: "architecture", slug: "ts-engineering-standards" }),
  ],
};

function buildTech(tech, cats, seeds) {
  const lengths = cats.map((c) => c[3]);
  const diffBuckets = interleaveDiffs(lengths);
  return cats.map(([category, categorySlug, idPrefix], i) => {
    const items = seeds[categorySlug];
    if (!items || items.length !== lengths[i]) {
      throw new Error(
        `${tech}/${categorySlug}: expected ${lengths[i]} seeds, got ${items?.length ?? 0}`,
      );
    }
    const stamped = stampDiffs(items, diffBuckets[i]);
    return expand(category, categorySlug, idPrefix, stamped);
  });
}

const html = buildTech("html", htmlCats, htmlSeeds);
const css = buildTech("css", cssCats, cssSeeds);
const typescript = buildTech("typescript", tsCats, tsSeeds);

const results = {
  html: writeBank("html", html),
  css: writeBank("css", css),
  typescript: writeBank("typescript", typescript),
};

console.log("\n=== SUMMARY ===");
for (const [tech, r] of Object.entries(results)) {
  console.log(`${tech}: ${r.total}`, r.hist);
}
console.log("Done.");
