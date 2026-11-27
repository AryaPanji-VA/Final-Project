# Lorekeeper — Visual Design & UI Specification

**Version:** 2.1 · **Status:** Active — supersedes v1.0
**Stack:** React + Vite, Tailwind CSS v4, React Router, React Hook Form, Zod, Lucide.
**Scope:** visual identity and interface craft. Product behaviour is unchanged.

> v1.0 described a dark-olive archive with gold accents and Indonesian copy.
> v2.0 moved to a paper-and-ink editorial system. **v2.1 keeps the editorial
> discipline of v2.0 and replaces its atmosphere**: the archive is now a dark
> fantasy library — obsidian, blood wine, arcane blue, aged parchment — read
> through modern typography and spacing.

This document is the source of truth for appearance. Where it disagrees with
older code, the document wins. Where it disagrees with working behaviour, the
behaviour wins.

---

## 1. Product Identity

Lorekeeper is a creative publishing and worldbuilding platform: serialised
fiction, structured fictional worlds, and tabletop campaigns in one archive.

**Every world has a story. Every story has a place.**

### 1.1 The new visual thesis

**Dark Medieval Fantasy × Modern Editorial.**

The interface should feel like a reading room in a very old building that has
been re-catalogued by a contemporary publisher:

- the light is low and warm, the walls are dark;
- the type is modern, generous, and legible;
- the ornament is sparse, hand-placed, and always in service of hierarchy;
- nothing is decorated that is not first useful.

It is **not** a medieval website template. No faux wood, no blackletter body
text, no drop-shadowed serif on every heading, no parchment texture behind
paragraphs. The medieval reference lives in *material and mood*: ink, vellum,
brass fittings, wine-dark cloth, blue glass. The modern reference lives in
*structure*: grid, measure, rhythm, contrast, restraint.

### 1.2 Four principles

1. **The archive is dark; the reading is lit.**
   The application is obsidian. Light is a material that gets *spent* on the
   things that matter: a featured cover, the open chapter, the active entry.
   A page should have one lit place.

2. **Typography is the ornament.**
   Hierarchy comes from scale, measure, and letterspacing — not from boxes,
   shadows, or colour. When a section needs weight, the answer is a larger
   serif or a wider margin, not a card.

3. **Ornament must be earned.**
   Rules, ticks, diamonds, folios, and boxed labels appear where they carry
   meaning (a section break, a canon status, a date). Decorative flourish for
   its own sake is a defect.

4. **Asymmetry over symmetry, sequence over grid.**
   Pages read top-to-bottom like a printed spread. A three-column grid of
   identical cards is the fallback, not the default. Where a composition can
   be asymmetric — a wide text column beside a narrow marginalia rail, a cover
   that breaks its container, a caption that hangs left of the plate — it
   should be.

### 1.3 Anti-patterns

Glassmorphism. Decorative gradients as fills. Purple/blue "SaaS" gradients.
Emoji. Coloured icon sets. KPI tile strips. Super-rounded cards (radius ≥ 12px).
Heavy textures behind body text. Crimson *and* blue *and* brass competing in one
view. Ornament density that outruns content density.

---

## 2. Colour

### 2.1 Roles, not decoration

Each accent has exactly one job. They are not interchangeable.

| Role | Token | Job |
|---|---|---|
| **Crimson** | `crimson` / `crimson-bright` | Action and consequence: primary buttons, the active nav mark, destructive intent, "this is live". |
| **Arcane blue** | `arcane` / `arcane-bright` | Navigation and reference: links, focus rings, selected states, progress, the reading UI. |
| **Parchment** | `parchment` / `parchment-dim` | Editorial emphasis: pull quotes, era labels, folios, the featured kicker. Never a fill for a large surface except the wine panel below. |
| **Brass** | `brass` | Fittings only: hairline ornaments, the diamond tick on a rule, a single boxed label border. Never text, never a button. |
| **Blood wine** | `wine` | A raised editorial surface — the "lit" panel that holds a featured item or an epigraph. |

Rule of thumb: **one crimson thing, one blue thing, and brass as a garnish per
screen.** If a view needs a third accent, it needs a better hierarchy instead.

### 2.2 Semantic tokens (dark — default)

Contrast ratios measured against `paper` (#111216) unless noted. All body and
meta text meets WCAG AA (4.5:1); the lowest text token is `ink-faint` at 5.5:1.

| Token | Value | Use | Ratio |
|---|---|---|---|
| `--color-paper` | `#111216` | Page ground (obsidian) | — |
| `--color-surface` | `#191A20` | Panels, sidebar, sheets | — |
| `--color-paper-muted` | `#1F2128` | Raised rows, hover, inputs | — |
| `--color-parchment` | `#24191D` | Blood-wine panel | — |
| `--color-ink` | `#EDE7DA` | Primary text, headings | 15.2 |
| `--color-ink-muted` | `#ADA69A` | Secondary text, standfirsts | 7.8 |
| `--color-ink-faint` | `#918B7F` | Meta, folios, placeholders | 5.5 |
| `--color-crimson` | `#702D3B` | Primary action fill | 1.9 (fill only) |
| `--color-crimson-deep` | `#561F2C` | Primary action hover | — |
| `--color-crimson-bright` | `#CE7178` | Crimson *text*, active mark, live status | 5.6 |
| `--color-arcane` | `#263B59` | Arcane fill (badge, quiet selected) | — |
| `--color-arcane-deep` | `#1B2A40` | Arcane hover | — |
| `--color-arcane-bright` | `#8FA7DC` | Links, focus ring, progress, reader chrome | 7.8 |
| `--color-brass` | `#B39459` | Ornament, rules, tick marks | 6.5 |
| `--color-brass-quiet` | `#8A7A5C` | Era labels, muted ornament text | 4.6 |
| `--color-border` | `#2A2B33` | Hairlines (1px, everywhere) | — |
| `--color-border-strong` | `#3A3C46` | Divider emphasis, field border | — |
| `--color-control` | `#5A5C68` | Form control border (3:1 non-text) | — |
| `--color-positive` | `#8AAE80` | Canon, published, saved | 7.5 |
| `--color-caution` | `#D2A45E` | Draft, pending | 8.2 |
| `--color-alert` | `#E08268` | Error, destructive text | 6.7 |
| `--color-onaccent` | `#F3E9EB` | Text on crimson/arcane fills | 8.0 on crimson |

Ivory text on a crimson fill is 8.0:1; on an arcane fill 9.2:1. Never put
`ink-muted` on an accent fill — it is a fill colour pair, not a text pair.

### 2.3 Parchment theme (reader only)

The immersive reader offers a light "Parchment" theme, because long-form
reading in the dark is not always what a reader wants. It is a **paper**
theme, not an inversion: warm vellum, black ink, wine headings.

| Token | Value |
|---|---|
| `--color-paper` | `#E8E0CE` |
| `--color-surface` | `#F1EBDC` |
| `--color-paper-muted` | `#DCD2BE` |
| `--color-ink` | `#14151A` |
| `--color-ink-muted` | `#3A3830` |
| `--color-ink-faint` | `#5A564B` |
| `--color-crimson` | `#6E2B37` |
| `--color-arcane-bright` | `#243A5E` |
| `--color-border` | `#C9BFA8` |
| `--color-border-strong` | `#B0A48A` |

Applied by `[data-theme="parchment"]` on `<html>`; scoped to the reader layout
and cleaned up on exit.

### 2.4 Legacy token aliases

v2.0 component code referred to `forest`, `moss`, `cobalt`, `brass-decor`. The
v2.1 sweep replaced every one of those references in `src/`, so no component
depends on them any more. They remain defined in `index.css` as inert pointers,
so a stale snippet or an old branch resolves to the right colour instead of
rendering transparent:

```
--color-forest        → crimson          (#702D3B)
--color-forest-deep   → crimson-deep     (#561F2C)
--color-moss          → brass-quiet      (#9B8A66)
--color-moss-soft     → #6B5A44
--color-cobalt        → arcane-bright    (#8FA7DC)
--color-cobalt-deep   → #A9BEEA
--color-brass-decor   → brass            (#B39459)
```

New code must use the semantic names in §2.2. Any *fill* that previously paired
`bg-forest`/`bg-cobalt` with `text-surface` or `text-paper` must pair with
`text-onaccent` instead — dark-on-dark fails.

Two colour pairs are deliberately **not** tokenised, because they belong to the
cover artwork rather than the interface (see §6.5): the vellum plate
`#D9CFBA` / `#14151A` (11.8:1) and the brass plate `#3A2E20` / `#D8C49A`
(7.7:1).

---

## 3. Typography

**Newsreader** (variable, optical 6–72) for display and long-form reading.
**Inter** for interface, labels, and metadata. **JetBrains Mono** for folios,
dates, counts, and archive IDs. No third family.

### 3.1 Scale

| Role | Family | Size / LH | Weight | Tracking |
|---|---|---|---|---|
| Display / hero statement | Newsreader | `clamp(2.4rem, 1.4rem + 3.6vw, 4.25rem)` / 1.03 | 400 | −0.03em |
| Page title | Newsreader | `clamp(1.6rem, 1.2rem + 1.2vw, 2.25rem)` / 1.14 | 400 | −0.02em |
| Section title | Newsreader | `clamp(1.25rem, 1.05rem + 0.7vw, 1.75rem)` / 1.15 | 400 | −0.015em |
| Card / entry title | Newsreader | 17px / 1.3 | 400 | −0.01em |
| Reading body | Newsreader | `clamp(1.0625rem, 1rem + 0.35vw, 1.1875rem)` / 1.75 | 400 | 0 |
| Body / standfirst | Inter | 14–15px / 1.65 | 400 | 0 |
| Label (form) | Inter | 12.5px / 1.4 | 500 | 0 |
| Meta / caption | Inter | 11.5–12.5px / 1.45 | 400 | 0.01em |
| Overline / nav group | Inter | 10.5px / 1 | 600 | 0.12em, uppercase |
| Boxed label | Inter | 10.5px / 1 | 600 | 0.09em, uppercase |
| Folio number | Newsreader | `clamp(1.5rem, 1.2rem + 1vw, 2.125rem)` / 1 | 400 | −0.02em |
| Archive ID | JetBrains Mono | 11px / 1.4 | 400 | 0.08em |

### 3.2 Rules

- Every heading is `font-serif`. Every control, label, and meta line is
  `font-sans`. Mono is reserved for numbers that behave like catalogue data.
- **Weight 400 only** for Newsreader. The v2.0 build used 500/600 for headings;
  a true text serif at 400 with tight tracking reads more like print and less
  like a UI. Never synthesise bold.
- Italic Newsreader is for epigraphs, standfirsts under a title, and
  marginalia — never for a whole paragraph of interface text.
- Two grey levels per screen (`ink` + `ink-muted`), plus `ink-faint` for meta.
  A fourth grey means the hierarchy is unclear.
- Measure: body copy `max-w-[64ch]`, standfirsts `max-w-[56ch]`, reading column
  34em, descriptions `max-w-[68ch]`.

---

## 4. Material & Texture

Three materials, used sparingly.

**Paper grain.** One fixed, full-viewport layer, `pointer-events: none`,
`mix-blend-mode: screen`, opacity ≈ 0.05, built from a 220px `feTurbulence`
tile. It sits above surfaces and below dialogs. It should be *felt*, not seen:
if a screenshot reads as "textured", it is too strong. Disabled under
`prefers-reduced-transparency` and in print.

**Ink wash.** A single soft radial vignette behind hero compositions
(`radial-gradient` at 55% 0%, wine at 8% → transparent 60%). One per page,
never behind body text, never on a card.

**Brass hairline.** 1px rules in `border` colour, with `brass` used for a 5px
rotated square tick at the centre of a section break (`rule-ornament`), or for
the diamond nodes on a timeline. Nothing else is brass.

No background images. No layered photographic textures. No noise inside
scrollable text regions.

---

## 5. Layout

### 5.1 Three shells

| Shell | Used by | Shape |
|---|---|---|
| **Public** | Home, Discover, Stories, Story detail, Creators, Creator profile, Universe overview | 1280px measure, hairline top bar, no sidebar, editorial full-bleed sections |
| **Workspace** | Dashboard, Library, Creations, Writing Studio, Worldbuilding, Encyclopedia, Timeline, RPG Studio, Profile, Settings | 248px sidebar (64px rail at tablet), 60px contextual top bar, 1120px measure |
| **Immersive** | Story reader | No chrome but a 56px floating bar, 760px column, reader settings |

Auth uses a fourth, minimal split-screen shell.

### 5.2 Vertical rhythm

Sections are separated by **space and a hairline**, never by a card. Standard
section padding is 40–64px; a major editorial break (Home, Discover) can use
96px. Page headers carry `pt-32 pb-24` with a bottom rule.

### 5.3 Asymmetry

Where a page has a primary column and a secondary rail, the ratio is
`1fr / 260–320px` with a 48–64px gap, and the rail starts *below* the first
paragraph, not at the top of the page. Cover plates may overhang their grid
cell by 8–16px. Captions may hang to the left of the thing they describe.
Symmetry is the default only for a centred editorial statement.

### 5.4 Radius, borders, shadow

Radius 2px (inputs, buttons, plates) to 4px (sheets, dialogs). Never more.
Borders are always 1px. Shadows exist only for things that float — dialogs,
dropdowns, the pulled cover — and are deep and soft, never a glow.

---

## 6. Components

All primitives live in `src/components/ui`; composed archive components in
`src/components/shared`.

### 6.1 Button

Heights 32 / 40 / 48 (44 on mobile for touch). Radius 3px. Inter 500.

| Variant | Appearance |
|---|---|
| `primary` | Crimson fill, `onaccent` text. Hover `crimson-deep`. |
| `outline` | 1px `ink` border, transparent, `ink` text. Hover: ink fill, paper text. |
| `quiet` | 1px `border-strong`, `surface` fill. Hover border `ink`. |
| `ghost` | Transparent, `ink-muted`. Hover `paper-muted` + `ink`. |
| `accent` | 1px arcane border, arcane-bright text. Hover arcane fill + onaccent. |
| `destructive` | 1px alert border, alert text. Hover alert fill + paper text. |

Press: `scale(0.985)` over 120ms. Focus: 2px arcane ring, 2px offset.

### 6.2 Boxed label (`.label-box`)

The signature archival motif, inherited from the v2.0 print system: 21px tall,
1px `currentColor` border, 8px side padding, Inter 600 / 10.5px / 0.09em
uppercase. Used for genre stamps, canon status, visibility, folio tags, and
breadcrumb terminals. It replaces pills everywhere.

### 6.3 Field

Label 12.5px `ink` → 6px → control → 4px → hint/error. Control: `surface` fill,
1px `control` border, 40px tall, 3px radius. Focus: arcane border + 1px arcane
ring. Error: alert border + alert 12px message with `role="alert"`, wired with
`aria-describedby`. Composite fields (toolbar + textarea) build their own label
instead of using `Field`, which clones a single child.

### 6.4 Card

A hairline-framed `surface` sheet, 4px radius, no shadow, 20–24px padding.
Variants: `static`, `frame` (border only), `plain`, `sunken`, `ink`, `dashed`.
A card is used when an object genuinely needs a boundary (a form, a dialog, a
cover plate). Lists of stories, entries, and worlds are **ruled rows**, not
cards.

### 6.5 Story cover

There is no cover art in this build, so the cover is *composed* as a dark
fantasy jacket: a tone plate (wine / arcane / obsidian / brass-quiet / moss),
a survey-rule grid, the title in Newsreader, the author in micro-caps, a genre
stamp, and a catalogue number. Five tones, each with its own text colour, all
AA-checked. Covers lift 4px on hover; nothing else moves.

### 6.6 Universe plate

16:9 cartographic plate: tone field, two vertical survey rules, one horizontal,
oversized initials in Newsreader at 20% opacity, genre stamp top-left, private
lock top-right. The plate is the visual identity of a world, so it is drawn,
not boxed.

### 6.7 Dialog

Radix dialog. Veil `ink/55` (dark, not black). Sheet: `surface`, 1px
`border-strong`, 4px radius, 24px padding, deep shadow. Enters with a clip
reveal from the top edge plus 4px rise over 220ms; exits over 160ms. Title in
Newsreader 22px; description 13.5px muted.

### 6.8 Tabs & segmented control

Underline tabs: 13px/500, active `ink` with a 2px ink rule that scales from the
left over 150ms. Segmented control: joined boxes, 1px `border-strong`, active
segment `ink` fill with `paper` text (a paper chip — the one place a light fill
is correct on the dark ground). On mobile the control goes full-width with
equal segments.

### 6.9 Dropdown

Trigger render-prop + conditional panel. Panel `surface`, 1px `border-strong`,
3px radius, min 210px, deep shadow, clip-reveal over 180ms. Rows 32px (44 on
mobile), `ink-muted` → `ink` on hover. Destructive rows in alert. Closes on
outside pointer-down, Escape, and selection. Items may be links (`to`) so
middle-click and keyboard work.

### 6.10 Skeleton, empty, error, loading

- **Skeleton**: `paper-muted` blocks, 2px radius, 1.6s shimmer at 0.55–1.0
  opacity. Never a spinner for content; the only spinner is a 16px one inside a
  submitting button.
- **EmptyState**: a quiet printed notice between two rules, optional icon and
  CTA. Not a dashed box.
- **ErrorState**: a 2px alert rule in the left margin, alert-tinted wash, serif
  title, retry action.
- **LoadingState**: variants `covers`, `rows`, `stats`, `prose`.

---

## 7. Page Direction

### 7.1 Public Home — *preserved structure*

The Home page composition is **kept**: editorial masthead → featured cover
shelf → recently published → genre index → creators → universes → closing
statement. Only the skin changes.

- Masthead: overline in brass, display statement at 56–68px, standfirst, a meta
  row of counts, two actions.
- Cover shelf: the existing interaction (drag, arrows, keyboard, caption
  mask-slide) is unchanged. Visuals only: covers cast deeper shadows, the shelf
  sits on a faint ink wash, the caption rule is brass.
- Genre index: a four-column ruled index with mono counts.
- Closing statement: wine panel, 3-part grid, no borders.

### 7.2 Discover

Editorial header centred, then the featured band (cover plate 220px beside a
kicker, title, standfirst, meta, two actions), then toolbar, then the grid.
The featured band is the page's single lit place — it gets the ink wash.

### 7.3 Stories / Creators

Index pages: header, toolbar, then content. Stories use a 5-up cover grid at
desktop; creators use a two-column typographic list (initials plate, name,
handle, bio, counts) with hairline dividers, not cards.

### 7.4 Story detail

Asymmetric masthead: 300px cover plate left, editorial column right (stamps,
title at display size, synopsis, byline, actions, a 4-item folio row). Then a
two-column body: chapter list (`1fr`) and a marginalia rail (280px) for author,
universe, tags. Chapters are ruled rows with mono folio numbers.

### 7.5 Story reader

Immersive. 760px column, Newsreader at 19px/1.75, drop cap in brass on the first
paragraph, a 1px arcane progress rule pinned to the top. Chrome hides on
scroll-down. Reader settings: theme (Obsidian / Parchment) and type size
85–130%. This is the one place the light theme exists.

### 7.6 Library

Three ruled sections: continue reading (with a 1px progress rule under each
row), bookmarked, following. Each has an overline, a count, and a hairline.

### 7.7 Creations / Writing Studio

Workspace editorial: folio stat row, drafts as ruled rows with status stamps,
published as compact rows, universes and campaigns as two columns. The primary
action is always "New Story" in the header.

### 7.8 Story & chapter editors

620–760px column. Metadata form in a `surface` sheet; chapter list in a rail.
The chapter editor is a distraction-free writing surface: a toolbar strip
(bold, italic, quote, scene break, live word count) above a serif textarea,
with a save-state line in the footer. No chrome inside the writing area.

### 7.9 Worldbuilding

Index: ruled rows with plate initials, genre stamp, counts. World detail:
cover plate strip (240px), folio stats, three quick-nav doors, latest entries,
timeline highlights, linked stories, campaigns.

### 7.10 Encyclopedia

Header with view toggle (grid / list) and "New Entry". Toolbar + canon tabs
with counts. Grid view: entries as index cards — category overline, serif
title, two-line summary, canon stamp, edited date. List view: a ruled table
with mono dates. Detail opens in a dialog with the full entry and an "Open in
editor" action.

### 7.11 Lore editor

760px column: title, category + canon, summary with counter, then a long-form
body with a markdown-lite toolbar, then tag chips. Footer carries save state
and the markdown-lite note.

### 7.12 Timeline

Editorial vertical chronology: era names as section dividers (rule + brass
overline), a 1px rule down the left with 8px diamond nodes — brass for canon,
hollow for legend, moss for draft. Dates in mono above each title. New events
via dialog.

### 7.13 RPG Studio

Campaign index rail (260px) beside the selected campaign: stamp row, title,
premise, italic setting line, quest board, cast, session log. Reads like a
game master's notebook — ruled lists, mono session numbers, no cards.

### 7.14 Auth

Split screen: left panel is a wine-dark masthead with a rule grid, an overline,
a display statement, a standfirst, and an epigraph with a brass rule; right
panel is the form, set as a title page (overline → serif title → standfirst →
form → hairline → secondary link). No card. Panel hidden below `lg`.

### 7.15 Profile & Settings

Profile: initials plate + name, form in a 520px column, archive counts in a
marginalia rail. Settings: sectioned ruled rows (reading & motion, archive,
account) with a destructive "Reset to seed".

---

## 8. Motion

**Direction: balanced.** Motion explains a state change; it never performs.

| Interaction | Duration | Easing |
|---|---|---|
| Hover / focus colour | 120–160ms | `--ease-editorial` |
| Button press | 100–140ms | `--ease-editorial` |
| Dropdown open | 180ms | clip reveal |
| Dialog in / out | 220 / 160ms | clip + 4px rise |
| Card / cover lift | 240ms | `--ease-editorial` |
| Caption mask slide | 620ms | `--ease-editorial` |
| Page entrance | 340ms | clip reveal on the content column |

Signature motions, inherited and kept:

- **Mask slide.** Text that changes in place (shelf caption, page headers on
  route change) slides out of an overflow mask rather than fading. No opacity
  fades for content reveals.
- **Clip reveal.** Page content and dialogs reveal by `clip-path`, so the
  page appears to be *set* rather than faded in.
- **Cover lift.** A story or universe plate rises 4px and deepens its shadow on
  hover. One transform, no loop.

No continuous animation. No parallax. No 3D book system in this version — the
cover shelf keeps its current interaction; only its styling changes.

Reduced motion: all durations collapse to 0.01ms, the shelf snaps, and the
grain layer is dropped. The preference is read from the OS and can be forced in
Settings.

---

## 9. Responsive

| Breakpoint | Shell |
|---|---|
| ≥ 1280 | Full sidebar 248px, 1120–1280px measure, 3–5 column grids |
| 1024–1279 | Full sidebar, 2–4 columns |
| 768–1023 | Sidebar collapses to a 64px icon rail (labels hidden, `title` + `aria-label` retained); public grids 2–3 columns |
| < 768 | Sidebar becomes a drawer (248px, ink veil, closes on navigate / Escape / veil); grids 1–2 columns; stat rows become horizontal scroll rails; toolbars stack |

Requirements: no horizontal overflow at any width; 44px minimum touch target on
mobile for nav items, buttons, and form controls; reading column never exceeds
its measure; timelines keep their rule and nodes on the left; cover plates keep
a 2:3 or 16:9 ratio at every size.

---

## 10. Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`) and one `h1`
  per page; headings never skip levels. A component that renders artwork must
  not emit a heading.
- Every interactive element is a real `button` or `a`. Every control has a
  label; icon-only controls have `aria-label`.
- Visible focus on everything: 2px arcane outline, 2px offset, as a global
  default. Components that draw their own ring opt out explicitly.
- Contrast: body and meta ≥ 4.5:1, large display text ≥ 3:1, non-text UI
  (borders, focus, controls) ≥ 3:1. Accent fills pair only with `onaccent`.
- Live regions: shelf caption, filter result counts, save state, form errors.
- `prefers-reduced-motion` honoured globally; a Settings toggle forces it.
- A "Skip to content" link precedes the header in every shell.

---

## 11. Token → File Map

| Concern | File |
|---|---|
| Palette, type, radius, motion, texture, reduced motion | `src/index.css` |
| Button, badge, card, input, dialog, tabs, dropdown, field, skeleton | `src/components/ui/*` |
| Cover, plate, shelf, headers, stat rows, toolbars, states | `src/components/shared/*` |
| Public / workspace / immersive / auth shells | `src/layouts/*` |
| Page compositions | `src/pages/*` |
| Mock data and persistence | `src/services/mock-api.js` |

---

## 12. Quality Checklist

Before a page is considered done:

- One `h1`, one lit place, one crimson action, brass only as a garnish.
- Type hierarchy readable with colour removed.
- No card where a rule would do.
- Every interactive element reachable by keyboard with a visible focus ring.
- No horizontal overflow at 390 / 900 / 1440.
- Loading uses skeletons; empty and error states are written, not defaulted.
- Copy is English, specific, and free of filler.
