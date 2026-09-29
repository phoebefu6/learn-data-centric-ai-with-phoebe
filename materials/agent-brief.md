# Agent brief - shared by every fan-out page of learn-data-centric-ai-with-phoebe

Filled from `~/.claude/skills/course-builder/references/agent-brief.template.md` on 2026-09-29.
Internal build document: never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   4 options per quiz question:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-centric-ai-with-phoebe/courses/01-hold-the-model-fix-the-data.html`
   For rhythm you may also skim the bench page `.../courses/04-the-data-edit-bench.html` (do NOT copy its bench scripts).
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-centric-ai-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-centric-ai-with-phoebe/assets/style.css`
4. Your session's verified build-along script and its printed output, in
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-centric-ai-with-phoebe/materials/buildalong/`
   (`common.py` = session 1 steps 1 to 4; `sN.py` + `sN.out`). Every `# output` comment in a
   code box must be copied from the `.out` file, never computed in your head. Code in the page may
   be the script split into steps; keep it runnable in that order.

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "learn-data-centric-ai-with-phoebe / Session N of 6", #toggle-all, #zoom-toggle) ·
masthead (eyebrow "Learn Data-Centric AI with Phoebe · Session N of 6", h1 with one
`<span class="accent">`, .sub, .chip-row with the level chip `🟠 Advanced` (session 6: `🟠 Capstone`),
two audience chips, time chip "45 min", .agenda a1-a4) · main.wrap · section#intro (Part 0: kicker,
.lede, .legend pills as on the template, .callout.win "★ What you walk out with tonight.") · 3 Parts,
each `section.section#part-N` with section-kicker (klabel "Part N · covers ...", h2,
`.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions (summary: `.mode.live`
or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example` with `span.ex-pill`
"Real world" on the page · ONE `.callout.tip` that starts with `<strong>What to ask for, if you lead the team.</strong>`
(the leader callout, required on every page, place it at the end of Part 3 as on the template) ·
section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each with a `<p>` then a `.prompt-box.good` carrying a `span.label` "★ Step N · ...")
· section#exercise Homework (ol, 4 items) · section#quiz (3 x `.quiz-q data-answer="0-based"`,
`p.qtext`, `button.qopt` "A · ..." with 4 options, `p.qwhy`; one `p.quiz-score` after the last; vary the
correct letter across the three) · section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of six
.cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot ·
`<script src="../assets/app.js?v=2"></script>` (no other script).

Head: the template's social meta block with this page's own title/description/url
(`https://phoebefu6.github.io/learn-data-centric-ai-with-phoebe/courses/<file>`, og-image
`.../assets/og-cover.png`); `<title>Session N · <Title> - learn data-centric ai with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=3">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or from your session's `.out` file, or is labelled constructed.
  Bench numbers you quote must be ones the session 4 widget prints (they are in the map's canon table).
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked RP in the map is "reported" on the page.
- NEVER "lottery" or "lotteries"; say the mechanism ("decided by row order", "arbitrary", "a
  random draw"). A verbatim quoted title in curly quotes is the only exception.
- Default to the English word. No Chinese terms are needed on these pages.
- Titles, widget ids and class names must not collide with siblings: do not reuse ML Strategy's titles
  ("The error-analysis spreadsheet", "Eyeball and Blackbox dev sets", "Bias and variance from three numbers");
  do not create any element id containing "bench"; no new CSS classes (use only classes already in the template or style.css).
- Seams: this course starts AFTER errors are found. Error-analysis spreadsheets, eyeball/blackbox dev
  sets and bias-variance are ML Strategy's (link, one sentence, never re-teach); feature construction and
  feature leakage are Feature Engineering's; pipeline data-quality monitoring is Data Observability's;
  entity dedupe at scale is Entity Resolution's (one line).
- The noise plant and any labeller in session 2 are CONSTRUCTED: say "constructed" or "declared plant"
  on the page wherever they appear. The images are real.
- No dark backgrounds on anything you add; no inline styles except the agenda `flex` and `margin-top` spacing as on the template.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): moss `#5B6C2E` · deep moss `#3D4A1C` · mid `#667A32` ·
soft `#CBD5A6` · tint `#F1F4E6` · ink `#1E2413` · muted `#545B44` · faint `#CCD3BC` · hairline `#E0E5D2` ·
rust (warm contrast) `#A63F1C` · rust ink `#7C2D12` · rust tint `#FBEAE1` · paper `#FCFDF8` · `#FFFFFF` ·
universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="the data, not the
  shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `sNa`, `sNb`, `sNc`, `sNd` where N is your
  session number (a = Part 1, b = Part 2, c = Part 3, d = build-along).
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  accent line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke
  1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#1E2413" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for
  hand-placed items, under 1 for panels). Fills: white, tint, the hachure for "the pile" or "the
  data", and rust ONLY for the one thing the figure is about. One doodle anchor per
  figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px
  ink label · `.PS` 400 11px muted · `.PB` 800 11px rust-ink · `.PV` 800 16-20px deep-moss
  value · `.PW` 800 12px white on a fill · `.PA` 700 11px moss axis caption · `.PN` 400 12px muted
  note. Hand-stacked items must not overlap as painted rects (the gate flags a pile).
- ALL `<text>` outside any filtered group, font stack `Inter, sans-serif`, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110 chars;
  40px between neighbouring point labels; bottom note 22px below the last row, H clears it by 8px.
  Two text labels must never share a row where their extents meet. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (who labels what and where
  they diverge; the fold that holds a row out; the threshold line per class; the confident joint as a
  grid of counts; a slice's rows moving; a spec's fields feeding an audit), never a metaphor literally,
  never decoration.
- Real digit thumbnails are welcome: `python3 materials/digit_svg.py <training row> <x> <y> <cell>` prints
  a `<g stroke="none">` of paths for that real image; paste it OUTSIDE the filtered group. Rows worth
  drawing (index into the 800 training rows, true digit, given label): caught errors (5, 7 given 1),
  (25, 1 given 7), (0, 3 given 8), (24, 4 given 9); false alarms (63, 3 given 3), (197, 2 given 2);
  missed errors (12, 9 given 4), (20, 1 given 7), (28, 7 given 1).

## Voice and honesty

Every Part gets a real-world story from the map's cases (Ng's steel/speech/iguana, the competition, the
ten benchmark test sets, Gender Shades). Constructed cases say "constructed" on the page: the declared
noise plant; the three labellers A, B, C in session 2; any sample edit log or spec in session 6.
One test digit is 0.2 points: never build a claim on a one-seed difference of one or two digits;
quote the twenty-seed sweep from the map where it exists.

## Cross-links (absolute URLs)

- ML Strategy p3: https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p3-error-analysis-spreadsheet.html
- ML Strategy p4: https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p4-eyeball-and-blackbox.html
- ML Strategy p5: https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p5-bias-and-variance.html
- Feature Engineering leakage: https://phoebefu6.github.io/learn-feature-engineering-with-phoebe/courses/b5-leakage.html
- Data Observability: https://phoebefu6.github.io/learn-data-observability-with-phoebe/
- Entity Resolution: https://phoebefu6.github.io/learn-entity-resolution-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/
- Links to sibling session pages are relative (`04-the-data-edit-bench.html`).

## Footer chain and session titles

Footer left: "Session N of 6 · learn-data-centric-ai-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>" (session 6: "← Prev" and `<a href="../index.html">Course home</a>`).

Session titles and files (exact, sentence case, one accent span in h1):
1. Hold the model, fix the data · `01-hold-the-model-fix-the-data.html`
2. When labellers disagree · `02-when-labellers-disagree.html`
3. Finding the wrong labels · `03-finding-the-wrong-labels.html`
4. The data-edit bench · `04-the-data-edit-bench.html`
5. Slice, augment or collect · `05-slice-augment-or-collect.html`
6. The data-edit spec · `06-the-data-edit-spec.html`
