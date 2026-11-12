# Body map screen · design spec

Source of truth for the map step. Visual references are in `docs/design/screens/`
(exported from Figma). The silhouette geometry is in `docs/design/body-front.svg` – use it
as is; the PNGs are for layout and spacing only (some show older region markings).

## Responsive layout (CSS only – no JS width detection)

| Viewport | Layout |
|---|---|
| < 768 px wide | **One column.** Top bar → title "Where does it hurt?" → "Tap a region on the body" → link "Pick from a list →" → Front/Back toggle → body. Selecting a region opens a **bottom sheet**. |
| ≥ 768 px wide | **Two columns** inside a container of max 1100 px: body column (toggle + body, centred) and a **side panel** (~420–460 px, white card). The side panel replaces the bottom sheet – same content, same component, different placement via CSS. |
| Any size | The body is sized by the **available height** (use `dvh`), never cropped and never causing page scroll on the map step. In phone landscape (~844×390) the body gets small and the side panel scrolls on its own. |

Top bar on every size: logo "Mappa" (left); "Case study ↗" (≥ 768 px only) and a "Concept demo" chip (right).
Footer: "Concept prototype · not for clinical use · no data is stored or sent".

## Side panel / bottom sheet content
**Nothing selected** (side panel only; on mobile the sheet is hidden):
- Title "Where does it hurt?" + "Tap a region on the body, or pick it from the list."
- **Region list** (also the accessible alternative to the map), head to toe:
  Neck · Shoulder · Elbow · Wrist & hand · Lumbar spine · Hip · Knee · Ankle.
  Available regions: tinted row + "Available" chip. Others: muted row + "Coming soon" chip, not clickable.
- "How it works": 1 A short safety screen · 2 How irritable is it? · 3 A graded plan with weekly check-ins.

**Region selected** (side panel and bottom sheet):
- Title "Right shoulder" + "Selected" chip (title row wraps if narrow).
- "Next: a 5-question safety screen, then 3 questions on how irritable it is. About 1 minute."
- Primary button "Continue" (full width) · secondary "Choose another region".
- Side panel only: the region list below, with the selected row highlighted.

On mobile, "Pick from a list →" opens the same region list (e.g. in the bottom sheet).

## Regions on the body
- Front view uses the **anatomical convention**: the patient's right is on the viewer's left. Show "R" / "L" markers.
- Available now: shoulder (right/left). Coming soon: neck, elbow, wrist & hand, hip, knee, ankle.
  Lumbar spine belongs to the Back view (back silhouette is out of scope for now – Back shows the same
  silhouette with a "Back view coming soon" note).
- Enabled / disabled is decided by the region registry, never hard-coded.
- Every interactive region needs a hit area of at least 44×44 px at its rendered size, even if the
  visible shape is smaller (e.g. a transparent larger circle on top).

## States (see screens/spec-interaction-states.png)
| State | Available region | Coming-soon dot |
|---|---|---|
| Default | primary tint 14 %, **no stroke** | muted dot, 35 % |
| Hover (pointer devices only) | tint 22 % + 2 px primary stroke + dark label anchored to the body ("Right shoulder") | label "Elbow – coming soon" |
| Focus (keyboard) | 3 px ink stroke + the same label | same label |
| Selected | accent fill + soft accent glow | – |

## Motion
- Mobile bottom sheet: slides up 220 ms, ease-out.
- Side panel content: cross-fade 150 ms; the layout never jumps.
- Region fill changes: 150 ms. Hover / focus labels appear instantly.
- `prefers-reduced-motion: reduce` → no slide or fade, instant change.
