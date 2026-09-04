---
version: alpha
name: "Betterment"
website: "https://www.betterment.com"
description: >-
  A robo-advisor and automated-investing platform whose marketing site runs a midnight-navy canvas (#000b50) as the hero floor — not the corporate blue that Fidelity or Schwab use, but a near-black with blue chroma that reads like sky after sunset — paired with a proprietary GT America sans at 72px / weight 500 for the hero and Season Mix for display headings, a gold accent (#ffc729) appearing exactly 5 times as the single warm signal in an otherwise cold-blue system, and product cards styled as physical objects with a distinctive inset-plus-drop shadow that casts deep navy shadows against white.

seo:
  title: "Betterment Design System for React — midnight navy, GT America + Season Mix, gold accent, 18 components"
  metaDescription: "Betterment's fintech marketing system: midnight navy #000b50 hero, Season Mix display type, GT America body, gold #ffc729 sparingly. Tokens for React, Next.js, and AI tools."
  highlights:
    - "Midnight navy voltage — #000b50 fills the above-fold hero canvas; not corporate blue but a near-black with chroma that distinguishes it from the gray-dark canvases at Linear or Vercel"
    - "Two-typeface hierarchy — Season Mix (a proprietary serif-influenced sans) runs h1/h2 display at 44–72px; GT America handles all body, nav, and UI labels"
    - "Gold as the solitary warm accent — #ffc729 appears exactly 5 times as background fills; in a cold-navy system, one gold element carries all the warmth in the page"
    - "Physical card illusion — product cards use a compound shadow (drop + inset) that casts a deep navy offset shadow, making the cards read as tangible objects"
    - "Warm cream floor below the fold — #f9f0e2 carries the below-fold sections, inverting the hero's dark gravity and making the system feel like day and night"
  tags:
    - "Fintech & Crypto"
    - "Banking & Payments"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Betterment's marketing site opens on midnight navy — a very dark blue with just enough chroma to read as sky rather than charcoal — and sets its hero headline ("Build your wealth in the background") in Season Mix, a proprietary serif-influenced display face that brings editorial gravity to what is otherwise a technology product. This pairing is unusual in the robo-advisor category. Wealthfront and Fidelity run mid-weight blue canvases and standard sans-serif headlines; Robinhood goes dark-mode with green accents. Betterment makes the opposite bet: deep navy that almost reads as night sky, editorial display type that reads closer to a financial magazine than a fintech dashboard.

    The DESIGN.md file packages 14 color tokens drawn from the extraction, organized into a midnight navy floor, a bright cobalt blue (#1d6ae5) for interactive elements and gradient nodes, a single gold (#ffc729) warm accent used 5 times as illustration and highlight fills, and a cream canvas (#f9f0e2) below the fold. Typography runs 14 tokens across two families: Season Mix at 44–72px for display, and GT America (a proprietary grotesque licensed from GrilliType) for every body, label, nav, and UI surface. Components number 18, covering the navy hero, the physical-shadow product cards, the gold-highlight yield panels, the warm-cream section floor, and the dark-navy footer.

    Feed this file to Claude or Cursor and it reproduces the fintech tension: the night-sky canvas signals safety and seriousness, the editorial display type signals authority without aggression, and the single gold accent delivers just enough warmth to feel aspirational. The physical-card shadow is the most distinctive implementation move — a CSS compound shadow with a deep-navy offset (matching `--btm-card-shadow` in the CSS) that no other fintech brand in the directory uses.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.betterment.com"
      title: "Betterment — official site"
      description: "Betterment's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Betterment's primary brand color?"
      answer: "Betterment runs two load-bearing colors. The first is midnight navy #000b50 — wired in CSS as `--bt-navy` and `--btm-card-text` — which fills the above-fold hero canvas and carries the footer. The second is bright cobalt blue #1d6ae5 — wired as the primary button fill in the cookie-consent system and as gradient node colors — which appears 32 times (bg: 8, border: 13, text: 8, gradient: 3). The single warm accent is gold #ffc729, wired as `--bt-gold`, appearing 5 times as background fills only. In a navigation sense, the interactive primary is cobalt blue; in a brand canvas sense, the primary is midnight navy."
    - id: "typography"
      title: "What typefaces does Betterment use, and what are good substitutes?"
      answer: "Betterment's display tier runs Season Mix — a proprietary serif-influenced sans that appears on h1 and h2 elements at 44–72px, weight 500. The body, nav, labels, and UI surfaces run GT America (by GrilliType), a licensed grotesque. Both faces are proprietary and not available as Google Fonts. The closest open-source substitute for Season Mix's editorial quality is Libre Baskerville at the display sizes, or Playfair Display for a more traditional serif feel; for a geometric sans alternative, DM Serif Display. For GT America, Inter or IBM Plex Sans transfer cleanly at the same weights and sizes."
    - id: "hero-canvas"
      title: "Why does Betterment use midnight navy instead of a standard fintech blue?"
      answer: "The hero canvas is #000b50 — an extremely dark navy with visible OKLCH chroma (0.123, hue 264°). This is not the medium-saturation blue that Wells Fargo, Chase, or Fidelity use for their primary brand color. It reads closer to night sky than corporate blue, which signals exclusivity and calm rather than institutional authority. Below the fold, the page inverts to a warm cream (#f9f0e2) for product sections, and the mid-range cobalt blue (#1d6ae5) appears in product cards and gradients. The three-tone color story — night navy / warm cream / bright cobalt — maps to a day-cycle visual metaphor that financial marketing has used since Bloomberg's terminal aesthetic."
    - id: "card-shadow"
      title: "What is the distinctive shadow treatment on Betterment's product cards?"
      answer: "Betterment's product cards use a compound CSS shadow declared as `--btm-card-shadow` in the extraction: a large 10.244px offset drop shadow in rgba(0,11,80,0.20) — a transparent version of the midnight navy brand color — plus two opposing inset shadows that simulate physical beveling. This combines into the illusion of a thick, tangible card casting a navy-colored shadow that ties the card surface back to the hero canvas. No other fintech brand in the directory uses a compound shadow whose drop-shadow color is derived from the brand navy."
    - id: "cream-canvas"
      title: "Why does the page shift from dark navy to warm cream below the fold?"
      answer: "The hero band uses midnight navy (#000b50) as the full-bleed canvas, establishing a serious, after-hours mood. Below the fold, the page shifts to a warm cream (#f9f0e2) that carries the product feature sections and account-type descriptions. The contrast serves both visual and psychological goals: after the dark hero commands attention, the cream sections feel open and approachable, as if the user has stepped into a well-lit space. The cobalt blue (#1d6ae5) product card fills and the gold (#ffc729) accent panels maintain chromatic continuity across the dark-to-light transition."

mockups:
  - "marketing-hero"
  - "pricing-table"

colors:
  primary: "#000b50"
  cobalt: "#1d6ae5"
  cobalt-light: "#5790eb"
  gold: "#ffc729"
  ink: "#ffffff"
  ink-dark: "#212121"
  ink-muted: "#5c5c5c"
  canvas: "#ffffff"
  surface-cream: "#f9f0e2"
  hairline: "#212121"

typography:
  display-xl:
    fontFamily: "\"Season Mix\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 500
    lineHeight: 72px
    letterSpacing: 0
  display-lg:
    fontFamily: "\"Season Mix\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 44px
    fontWeight: 500
    lineHeight: 48.4px
    letterSpacing: 0
  display-md:
    fontFamily: "\"Season Mix\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 38.4px
    letterSpacing: 0
  heading-lg:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 32.4px
    letterSpacing: 0
  heading-md:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 29.7px
    letterSpacing: 0
  body-lg:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 24.3px
    letterSpacing: 0
  body-md:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-md-medium:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-sm:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0
  label-caps:
    fontFamily: "\"GT America Black\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 16.5px
    letterSpacing: 0
  caption:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16.2px
    letterSpacing: 0
  label-track:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 16.1px
    letterSpacing: "1.12px"
  nav-link:
    fontFamily: "\"GT America Black\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 16.5px
    letterSpacing: 0
  button-md:
    fontFamily: "\"GT America\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 24.3px
    letterSpacing: 0

rounded:
  none: "0px"
  xs: "3px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "9999px"

spacing:
  xs: "5px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xs}"
    padding: "13px 24px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xs}"
    padding: "13px 24px"
    height: "50px"
    borderColor: "{colors.ink}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xs}"
    padding: "13px 24px"
    height: "50px"
  top-nav:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "0px 16px"
    height: "56px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    padding: "0px 16px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "0px"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.display-lg}"
    padding: "0px"
  section-heading-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dark}"
    typography: "{typography.display-lg}"
    padding: "0px"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  body-paragraph-dark:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dark}"
    typography: "{typography.body-md}"
  hero-section:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: "96px 24px"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-cobalt:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.primary}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.lg}"
    padding: "24px"
  cream-section:
    backgroundColor: "{colors.surface-cream}"
    textColor: "{colors.ink-dark}"
    typography: "{typography.body-md}"
    padding: "80px 24px"
  label-track:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-track}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "9px 12px"
    height: "40px"
    borderColor: "{colors.ink-muted}"
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: "48px 24px"
---

## Overview

Betterment's marketing site makes a typographic bet that the rest of the robo-advisor category has not taken. **Editorial display in fintech**: the hero headline runs in Season Mix — a serif-inflected proprietary face — at 72px on a midnight-navy canvas (#000b50), and the effect reads more like a financial magazine spread than a technology product landing page. Where Wealthfront stays on a white canvas with a medium-weight sans, and Robinhood commits to a dark product-first surface, Betterment gives its display type the canvas to carry the visual weight that most fintech brands offload to photography or gradient fills.

The color system is a study in cold-warm contrast. The midnight navy hero floor (#000b50) cedes to a warm cream canvas (#f9f0e2) in the below-fold product sections — the equivalent of shifting from night to day. The single warm chromatic signal is gold (#ffc729, wired as `--bt-gold`) appearing 5 times across the page as product-panel accent fills. The interactive primary is cobalt blue (#1d6ae5), used for buttons, gradient nodes, and section highlights. This three-tone story (night navy / warm cream / bright cobalt) maps cleanly to a "your money working while you sleep" narrative that the headline makes explicit.

The most technically distinctive feature is the physical-card shadow: Betterment's product cards use a CSS compound shadow that includes a large navy-colored offset drop shadow plus opposing inset highlights, declared as `--btm-card-shadow`. No other fintech brand in the directory uses a shadow whose color is a transparent version of the brand navy — the cards cast their own brand color as a shadow.

**Key Characteristics:**
- Midnight navy hero canvas (`{colors.primary}` — #000b50), wired as `--bt-navy`. Not corporate blue — an extremely dark value with 0.123 OKLCH chroma that reads as night sky.
- Season Mix for display (h1 / h2) at 44–72px / weight 500; GT America for all body, nav, and UI text.
- Single gold warm accent (`{colors.gold}` — #ffc729, `--bt-gold`), 5 occurrences, all background fills. Zero text or border uses.
- Physical-card shadow technique: large navy offset drop shadow + inset corner highlights = cards that appear to have physical depth.
- Warm cream below-fold canvas (`{colors.surface-cream}` — #f9f0e2) inverts the hero's dark gravity.
- GT America Black (the "Black" weight variant) at 11px uppercase for all navigation labels — small-caps authority on a dark nav surface.
- 20px card radius (`{rounded.lg}`) versus 3px button radius (`{rounded.xs}`) — the system is binary: product cards are rounded, interactive surfaces are nearly square.

## Colors

### Brand

- **Midnight Navy Primary** (`{colors.primary}` — #000b50): frequency 328 — text (161), border (158), bg (4), shadow (4), gradient (1). Wired as `--bt-navy` and `--btm-card-text`. The page's dark canvas and the text color inside product cards on cream backgrounds. Extremely dark blue — OKLCH lightness 0.21, chroma 0.123, hue 264°.
- **Gold** (`{colors.gold}` — #ffc729): frequency 5. Background fills only. Wired as `--bt-gold`. The system's solitary warm moment — a saturated amber-gold that appears in the yield percentage panel ("4.00%") and one IRA section highlight. Zero text or border uses.

### Interactive

- **Cobalt** (`{colors.cobalt}` — #1d6ae5): frequency 32 — bg (8), border (13), text (8), gradient (3). The primary interactive and CTA color. Bright mid-blue, clearly distinct from the dark navy. Wired across 19 CSS variables as the button, toggle, and link fill.
- **Cobalt Light** (`{colors.cobalt-light}` — #5790eb): frequency 1. Gradient only. The light gradient stop for cobalt-to-navy gradient backgrounds.

### Surface

- **Canvas** (`{colors.canvas}` — #ffffff): frequency 717 — text (359), border (345), bg (8), shadow (5). The product-card surface on cream backgrounds and the base below-fold floor before cream is applied. The dominant count comes from the Ketch cookie-consent overlay CSS variables that share the extraction.
- **Surface Cream** (`{colors.surface-cream}` — #f9f0e2): frequency 8. Background fills (6) and gradient (2). The below-fold page section floor — warm off-white that pairs against both the navy hero and the cobalt product cards.

### Text

- **Ink** (`{colors.ink}` — #ffffff): used as text and border on dark surfaces (navy hero, cobalt cards, dark footer). Pure white on navy.
- **Ink Dark** (`{colors.ink-dark}` — #212121): frequency 472 — text (236), border (236). The dominant text color on light (cream, white) surfaces. Near-black, wired across 60+ Ketch cookie-consent CSS variables.
- **Ink Muted** (`{colors.ink-muted}` — #5c5c5c): frequency 16. Secondary text on light surfaces — captions, footnotes, fine print.

### Hairline

- **Hairline** (`{colors.hairline}` — #212121): wired as a border token on light surfaces. The dark hairline on white/cream backgrounds inverts the typical light-on-light hairline convention.

## Typography

### Font Families

The system runs two voices: **Season Mix** for every editorial display moment (h1 / h2 at 44–72px), and **GT America** (GrilliType's proprietary grotesque, available via CSS as `--bt-font-body`) for all body, label, nav, and UI surfaces. A third variant, **GT America Black**, carries the small-uppercase navigation labels at 11px. The division is unambiguous: Season Mix speaks; GT America annotates.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 72px | 500 | 72px | 0 | Hero h1 ("Build your wealth in the background") |
| `{typography.display-lg}` | 44px | 500 | 48.4px | 0 | Section h2 ("Start with our most popular accounts") |
| `{typography.display-md}` | 32px | 500 | 38.4px | 0 | Sub-section display text |
| `{typography.heading-lg}` | 24px | 500 | 32.4px | 0 | Card heading |
| `{typography.heading-md}` | 22px | 400 | 29.7px | 0 | Feature sub-heading |
| `{typography.body-lg}` | 18px | 400 | 24.3px | 0 | Button label, hero sub-copy |
| `{typography.body-md}` | 16px | 400 | 24px | 0 | Default running text |
| `{typography.body-md-medium}` | 16px | 500 | 24px | 0 | Emphasized inline text |
| `{typography.body-sm}` | 14px | 400 | 21px | 0 | Caption text, fine print |
| `{typography.label-caps}` | 11px | 700 | 16.5px | 0 | Nav labels (GT America Black, uppercase) |
| `{typography.caption}` | 12px | 400 | 16.2px | 0 | Metadata, small disclaimers |
| `{typography.label-track}` | 14px | 500 | 16.1px | +1.12px | Section category labels (tracked caps) |
| `{typography.nav-link}` | 11px | 700 | 16.5px | 0 | Top-nav links (uppercase GT America Black) |
| `{typography.button-md}` | 18px | 400 | 24.3px | 0 | Button label |

### Principles

Season Mix at weight 500 is the editorial voice — not the 700+ that most fintech brands use to project authority, but a measured medium weight that trusts the 72px size to do the heavy lifting. GT America at 400 carries all body text with minimal variation in weight until GT America Black arrives for navigation labels. The tracking on navigation labels (+1.12px at 14px) and the uppercase treatment via `label-track` is the one place the system gestures toward traditional financial typographic conventions.

### Note on Font Substitutes

Season Mix is proprietary — it is not available as an open-source font. For open substitutes at the 44–72px display tier, **Cormorant Garamond** has comparable serif-influenced texture; **Libre Baskerville** or **Merriweather** are closer in weight distribution. For GT America, **Inter** at the same weights is the closest freely available grotesque; for GT America Black at 11px nav labels, use Inter with `font-weight: 900` and `text-transform: uppercase`.

## Layout

### Spacing System

- **Base unit:** 8px.
- **Tokens:** `{spacing.xs}` 5px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.2xl}` 48px.
- **Section padding:** 80px vertical between major sections; the hero uses ~96px top padding.
- **Card internal padding:** 16px (`{spacing.base}`) on product cards, 24px (`{spacing.lg}`) on feature panels.
- **Top-nav height:** 56px with 0×16px padding.

### Grid & Container

- **Max content width:** ~707px for display headlines, ~1000px for product card grids.
- **Hero:** full-bleed midnight-navy canvas, centered headline + sub-copy + pill CTA + product screenshot at right.
- **Account cards:** 3-up horizontal product card row (Automated Investing / High Yield Cash / IRAs) each with a product-screenshot illustration and the physical compound shadow.
- **Feature sections:** alternating left-text / right-illustration layout on the cream canvas.

### Rhythm

The page opens with the dark navy hero band, then alternates: navy product section → cream feature section → gold-accent panel → cream IRA section → dark navy testimonial band → cream FAQ. The consistent alternation between dark-navy and warm-cream bands creates a visual rhythm that no single background color could sustain alone.

## Elevation

The system uses **a distinctive branded-shadow technique** for its product cards. The `--btm-card-shadow` CSS variable is a compound shadow: a large 10.244px offset drop in `rgba(0,11,80,0.20)` (transparent midnight navy), combined with opposing inset shadows — a dark 1.7px inset on the top-left corner and a white 1.7px inset on the bottom-right — to simulate physical beveling. The cards appear to cast a navy shadow whose color exactly matches the hero floor, grounding the white cards in the brand's dark-canvas story. Outside the product cards, the system is flat — no other shadow values appear on the captured marketing surface.

## Shapes

The radius scale is **binary: soft cards, sharp buttons**:

- `{rounded.none}` 0px — hero section, full-bleed band edges.
- `{rounded.xs}` 3px — buttons and form inputs. Nearly square.
- `{rounded.sm}` 8px — secondary UI surfaces (dropdown items, small badges).
- `{rounded.md}` 12px — medium card containers.
- `{rounded.lg}` 20px — (5 occurrences): primary product cards (`--btm-card-radius`). The card's 20px rounding is large enough to read as "soft" against the nearly-square buttons.
- `{rounded.full}` 9999px — pill badge treatments.

The gap between 3px buttons and 20px cards is intentional: interactive surfaces are nearly squared (traditional fintech conservatism), and data display surfaces are rounded (contemporary app warmth). Mixing them on the same page signals both reliability and approachability.

## Components

**`button-primary`** — Cobalt `{colors.cobalt}` fill, white text, `{rounded.xs}` 3px radius, 13×24px padding. Used for "Get started" actions on both dark and light backgrounds.

**`button-gold`** — Gold `{colors.gold}` fill, midnight navy text, same radius and padding. Used for the yield product CTA on the high-yield cash section.

**`button-secondary`** — Transparent fill, white text, 1px white border. Used for secondary actions on dark navy backgrounds.

**`top-nav`** — Midnight navy `{colors.primary}` surface, 56px height. Houses the Betterment wordmark and the GT America Black 11px uppercase navigation links.

**`nav-link`** — Transparent background, white text at `{typography.nav-link}` (GT America Black / 11px / uppercase). The uppercase small-cap treatment is the nav's one nod to traditional banking typography.

**`hero-section`** — Full-bleed midnight navy `{colors.primary}` canvas, 96×24px padding, white `{typography.display-xl}` headline + `{typography.body-md}` sub-copy + primary CTA.

**`hero-heading`** — White `{colors.ink}` text, Season Mix 72px / 500, the signature display moment.

**`section-heading`** — Midnight navy `{colors.primary}` text, Season Mix 44px / 500. Used on cream-background sections where the navy text inverts the hero relationship.

**`card`** — White `{colors.canvas}` surface, midnight navy text, `{rounded.lg}` 20px radius, 16px padding, compound navy shadow. The product account card — Automated Investing, High Yield Cash, IRAs.

**`card-cobalt`** — Cobalt `{colors.cobalt}` fill, white text, same 20px radius. Used for the "Invest the way you want" dark section card.

**`card-gold`** — Gold `{colors.gold}` fill, midnight navy text. The yield percentage panel ("4.00%") — the single warmest surface on the page.

**`cream-section`** — Warm cream `{colors.surface-cream}` background, dark ink text, 80×24px section padding. The feature section floor for all below-fold product descriptions.

**`body-paragraph`** — White text on dark surfaces at `{typography.body-md}`.

**`body-paragraph-dark`** — Dark ink `{colors.ink-dark}` text on cream surfaces at `{typography.body-md}`.

**`text-input`** — White surface, dark text, `{rounded.xs}` 3px radius, 9×12px padding, muted ink border.

**`footer`** — Midnight navy `{colors.primary}` canvas, white text, `{typography.body-sm}`. Dense link grid followed by regulatory disclosures in smaller caption type.

## Do's and Don'ts

**Do** use Season Mix exclusively for h1 and h2 display elements — never for body, labels, or buttons. GT America handles everything functional; Season Mix's editorial texture works only at sizes where the letterform details read.

**Do** treat `{colors.gold}` (#ffc729) as the system's single warm punctuation. In a cold-navy system, one gold element per view carries all the aspiration. Multiple gold elements compete with each other and dilute the yield-product connotation.

**Do** apply the compound navy shadow to product cards on cream backgrounds. Using a generic `rgba(0,0,0,0.15)` shadow instead loses the brand coherence — the navy shadow color is what ties the card to the hero canvas.

**Do** maintain the `{rounded.xs}` 3px radius on all buttons. The near-square button is a deliberate financial-product signal; rounding buttons to 20px to match the cards would make the UI feel more like a consumer app than a wealth-management platform.

**Don't** use `{colors.cobalt}` (#1d6ae5) as a background canvas for full-bleed sections. It is an interactive-element and gradient-node color; using it as a section background would create a third canvas tone (navy / cobalt / cream) that the page cannot sustain.

**Don't** run Season Mix below 32px. Below that size the editorial texture of the face is lost and it reads as a generic medium-weight sans; drop to GT America heading sizes instead.

**Don't** use `{colors.hairline}` (#212121) for borders on dark navy surfaces. It is a dark-on-light border token; on the navy canvas, use `rgba(255,255,255,0.2)` for a white-with-alpha border that survives on the dark floor.

**Don't** add drop shadows to buttons. The shadow technique is reserved for product cards — applying it to interactive buttons would flatten the visual hierarchy by treating buttons and data surfaces as the same elevation tier.

## Known Gaps

- **Hover and focus states:** the resting state only is captured; button hover, link underline animation, and input focus ring behavior are not exposed on the marketing surface.
- **Mobile navigation:** the 1440px-wide extraction captures desktop layout; mobile nav drawer, hamburger menu, and touch-target adjustments are not documented.
- **Product surfaces:** the authenticated dashboard and portfolio management screens (Betterment's core product) carry a substantially different token set; this file covers only the marketing site.
- **Illustration system:** Betterment uses 3D-rendered product card illustrations (the umbrella, the stacked cards, the abstract shapes) — the illustration style parameters are not captured as design tokens here.
- **Regulatory/disclaimer typography:** the legal disclosure paragraphs at the page bottom use a distinct small-text treatment that is not represented in the component set.
- **Gradient system:** the hero-to-section gradient transitions (navy to cobalt, cobalt to cream) use compound gradients with intermediate stops that are not fully captured in the flat color tokens here.
