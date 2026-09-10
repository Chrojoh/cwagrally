# Rally Course Designer V3 — procedural routes

This release replaces the default template selector with **Course Shape**:
**Surprise me · Flowing · Geometric · Spiral · Diagonal · Classic**.

Run `start.cmd` on Windows, then use the local address it opens. Keep the server
window running. The complete folder can also be deployed to GitHub Pages as a
static site; include `src/core/generation-worker.js` and `src/core/procedural.js`.
Opening `index.html` directly with a file URL does not support module workers.

## What changed

- The five procedural search profiles grow self-avoiding paths from random
  control points, with variable grid pitch, run lengths, starting positions,
  headings and turn preferences. They are search preferences, not five fixed
  course templates. Classic retains the previous route builders.
- Surprise me favors profiles that have appeared less often. All three
  organizations expose the new selector. Legacy `routeStyles` fields remain for
  compatibility; only explicit `courseShapes` settings restrict the new selector.
- Candidate routes must still pass the existing sign, equipment, station-count,
  ring, venue and progression-reserve checks. Procedural routes reject crossings
  and retain exact 45-degree heading increments. Bow-ties and figure-eights with
  actual path crossings are therefore not offered as legal default layouts.
- A normalized, arc-length-sampled silhouette comparison rejects routes too
  similar to the last 24 accepted courses for that organization, level, ring and
  shape selection. Reflections, reversal, translation and uniform scaling alone
  do not count as novelty. History lasts for the current app session.
- Generation runs in a background module worker so searches do not freeze the
  designer. Searches are bounded; very constrained rings or obstacles can still
  exhaust the legal candidate pool and report an error.
- C-WAGS and CKC retain progression-friendly station counts. Equipment working
  space can seed a long run; subsequent control points are generated procedurally.

## Verification

Run `npm test` with Node.js. No dependency installation or build is required.
The deterministic generation suite creates **50 consecutive courses per
organization** at its entry level and default ring, validates all 150, checks
crossings and exact headings, and tests every enabled level plus every selector
option at entry levels. It also writes `test-results/generation-report.json` and
`test-results/route-gallery.html` for review.

The recorded run produced **46 C-WAGS, 24 CARO and 40 CKC silhouette clusters**
using a stricter comparison threshold than the recent-course rejection filter.
All 150 generated successfully; no profile exceeded 42% of its organization's
batch. These are automated similarity clusters, not a claim that visual judgment
is objective. CARO's reserved future jump space still favors long corridors in a
50×40 ring. Open the gallery to judge the variety yourself.

Additional checks cover the 26 existing non-browser regressions, procedural level
progression through C-WAGS Pro / CARO Excellent / CKC Master, and worker response,
error recovery and retained novelty history. Browser artwork decoding and manual
UI interaction are not covered by the Node tests.

The original build notes below document the retained foundation; the selector
and generation behavior described above supersede their older route descriptions.

---

# Rally Course Designer V3 — foundation

This is the modular replacement foundation for the earlier single-file `Chrojoh/cwagrally` prototype.

## What this build demonstrates

- Versioned organization rule packs (`src/orgs/`)
- Three installed rule packs: C-WAGS 2021, CARO 2025 + Dec. amendments, and CKC 2025
- Stable station IDs and course lineage
- Strict path/sign geometry matching
- Random course generation
- Level-aware sign sequencing and dog-position state validation (pace changes, Front, Leave Dog, recalls/returns)
- Sequence-dependent exercises are injected as complete legal chains rather than isolated random signs
- Strict sign exit-direction validation: the drawn outgoing path must match the exercise turn
- Equipment setup metadata for cone patterns, jumps, tunnel, table, pause box, and send-around distances
- Equipment-aware layout uses oriented working envelopes rather than simple circular clearances
- Equipment footprints are checked against ring edges, stations, unrelated route segments, and other equipment
- Equipment footprints are visibly drawn on both the designer canvas and exported PDF
- Fast constrained-greedy sign assignment (quota-first; no exhaustive recursion)
- C-WAGS ordinary station gaps are variable; there is no hard-coded universal 10-ft spacing. Exercise-specific distances take priority.
- Varied route generation: horizontal/vertical snakes, shifted diagonal snakes, spirals, mirrors, and reversals
- Route rejection for interior path crossings
- Route turns restricted to exact 45-degree increments so sign motion and drawn path stay synchronized
- Manual station dragging
- Level-appropriate + geometry-compatible sign substitutions
- Minimum-change `Advance level` operation
- Level-up optimizer may add **up to three stations** in clean gaps or near Finish when that preserves substantially more of the original setup
- Change report: kept / swapped / added / moved / removed
- JSON save/load with organization + rule-pack version
- Actual `.pdf` download (single-page raster PDF generated in-browser)
- No framework and no build step

## Run it

ES modules should be served over HTTP rather than opened directly from `file://`.

Windows:
1. Double-click `start.cmd`.
2. Open `http://localhost:8080`.

Or run:

```bash
python -m http.server 8080
```

from this folder.

For GitHub Pages/Vercel, deploy the folder as a static site.

## Architecture

```text
index.html
styles.css
src/
  app.js
  core/
    model.js        course schema + stable IDs
    geometry.js     headings, turns, spacing, route geometry
    rules.js        reusable rule helpers
    generator.js    random valid course generation
    upgrade.js      least-physical-change level progression
    validator.js    generic + organization-specific validation
    storage.js      versioned JSON save/load
    pdf.js          real PDF encoder/export
  orgs/
    registry.js
    cwags-2021.js
    caro-2025.js
    ckc-2025.js
  assets/
    caro-2025/      development/reference sign images
    ckc-2025/       development/reference sign images
  ui/
    canvas.js       course/path/sign rendering + drag hit-testing
```


## Multi-organization status

The same editor/generator core now switches between organization-specific rule packs instead of trying to reinterpret one organization through another organization's rules. Switching the Organization selector resets the active course and loads that pack's levels, ring defaults, sign palette, count semantics, validation, and artwork mapping.

Current automatic-generation status:

- **C-WAGS 2021:** Starter, Advanced, Pro, ARF, Zoom 1, Zoom 1.5, Zoom 2
- **CARO 2025 + Dec. 2025 amendments:** Novice, Intermediate, Advanced, Excellent
- **CARO Versatility / Versatility Excellent:** available in the pack for reference/manual work, but automatic generation is intentionally disabled until the left/right-side state solver is complete
- **CKC 2025:** Rally Novice, Intermediate, Advanced, Excellent and Master

CARO progression can branch from Novice. The UI now has an **Advance current course to** selector instead of assuming that every organization has one linear next level. Disabled targets are shown as manual-only.

CARO Novice and Intermediate use a 50 × 40 ft program default. That is a practical progression default, not an additional CARO rule: it leaves a future working bay for the mandatory Advanced jump while remaining above CARO's official minimum ring area.

CKC Excellent and Master use a separate non-counted auxiliary Stay item after Finish so the Stay is not incorrectly numbered as a normal course exercise.

### Beta / audit status

The multi-organization engine is functional, but the organization packs should still be treated as **beta rule packs** until every sign and special-case rule has received a final sign-by-sign audit against the supplied source documents. C-WAGS is explicitly versioned to the available 2021 source material.

The CARO/CKC image folders in this development build are reference assets extracted from user-supplied rule/sign material for testing. Artwork/licensing is deliberately separate from rule data. Before commercial distribution, replace these with the project's own recognizable facsimile set or an authorized official-art pack.

## Important rule-version note

The rule material available for this build is the user's C-WAGS Rally **2021** material. The pack is therefore deliberately identified as `cwags:2021`. Do not silently replace it when newer rules are added.

Saved courses carry both:

- `organizationId`
- `rulePackVersion`

so a 2021 course remains interpretable after a future C-WAGS 2026/2027 pack is added.

## Why V3 does not reuse the old "class prefix" quota logic

Zoom 1.5 and Zoom 2 do not have a separate catalog of `Z15...`/`Z2...` sign IDs. Their required class exercises are specific existing signs. V3 therefore defines explicit quota groups in the rule pack.

This same mechanism works for CKC, CARO, AKC, WCRL, or other organizations without changing the core engine.

## Minimum-change level progression

The upgrade engine treats the existing physical ring as an installed layout:

- same station + same sign: free / preferred
- same station + new sign: low cost
- add station: structural change
- remove station: structural change
- station movement: avoided unless future rules require it
- equipment substitutions carry a higher cost than ordinary sign swaps

The current implementation first preserves geometry, adjusts station count only when the target level forces it, then searches repeated low-cost valid sign assignments. The course gets a new `courseId` and keeps `parentCourseId` pointing to the prior level.

## Next normalization work before production

The pack intentionally separates **engine capability** from **rule completeness**. Before calling C-WAGS production-ready, continue normalizing every rulebook detail into data/custom validators, including:

- exact front-position state transitions
- all sign placement rules (handler-right vs in-front)
- equipment footprints and clearances
- exact jump combination rules at each level
- ARF side-switch state and right-side exercise limits
- table/tunnel/send distances
- any organization-approved exceptions
- newer C-WAGS rally rule editions when supplied

The core does not need to change when those rules are added.

- Long/medium/short route gaps are deliberately mixed so exercise-specific distances and equipment footprints have legal places to fit.

- ARF R10 Tunnel and R11 Table are host-optional exercises; neither is individually required to satisfy the eight-ARF-exercise minimum.
- Upgrade solving checks equipment footprint feasibility before selecting an equipment exercise.

- C-WAGS ordinary exercises enforce the 10-ft minimum from the 2021 Course Guidelines; joined and stated-distance exercises are exceptions.
- Front-position continuations such as S14 Call Front → S15/S16/S17 are marked JOINED on screen and PDF.
- Generated joined front sequences use a small visual separation so the course map clearly shows they are performed together.

- Station number/sign graphics automatically offset when they would overlap; a leader line points back to the true physical station location, so course geometry is unchanged.


- Route style selector is organization-aware. C-WAGS supports Classic, Angled Flow, Mixed, and the experimental X Crossover where appropriate. Zoom uses its dedicated Zoom Angled Flow. CARO/CKC currently use the route styles enabled by their own packs rather than inheriting C-WAGS route assumptions.
- Angled/X routes are generated as a continuous polyline first, then stations are distributed along it while preserving every intentional turn vertex.
- X crossings are allowed as route crossings, but physical station anchors are kept away from the crossing and equipment footprints may not be placed where an unrelated route leg cuts through them.

- Desktop UI uses a three-panel judge workspace: setup/validation left, large map center, running-order station list right; side panels scroll independently.


## Judge-quality scoring

Legal validation and course-design quality are intentionally separate.

The quality engine grades:
- **Space use** — route coverage, ring balance, large unused regions, clustering
- **Flow** — excessive crossings, reversals, and abrupt sharp-turn combinations
- **Working space** — unrelated stations and unrelated route legs crowding one another
- **Map clarity** — route complexity and close unrelated stations that can make a map hard to read

Overall quality is weighted:
- Space use 30%
- Flow 30%
- Working space 25%
- Map clarity 15%

The generator aims for **80/100 or better**. If an explicitly selected route family cannot reach
that score, the best fully legal candidate is still returned and the quality panel explains why it
needs improvement.

These are judge/course-design heuristics, not additional C-WAGS rules. Organization-specific
legality remains in the rule pack and validator.


## Angled route families

- **Angled Flow** is the production angled route: broad ring use, non-crossing diagonals,
  45°/90°/135° changes, and quality-targeted working space.
- **Mixed** chooses between Angled Flow and Classic variable. The generator still requires
  legal sign geometry and aims for an overall judge-quality score of at least 80.
- **X Crossover** remains available as an experimental explicit route because it can create
  central congestion even when technically legal.


## Zoom Angled Flow

Zoom 1, Zoom 1.5 and Zoom 2 now have a dedicated angled route family. It uses broad horizontal lanes with 90°, 45° and 135° transitions plus two interior long-gap working bays so Zoom 2 obstacle choices can fit without crowding. Mixed mode alternates between this family and Classic variable.

## CKC progression reserve

CKC Advanced requires exactly one jump; Excellent and Master require exactly two jumps and those jumps may not be consecutive. The progression planner now reserves **two separated, footprint-compatible jump bays** before Excellent. When advancing Advanced → Excellent, the reserve is anchored to the actual Advanced #103 jump so that the second jump can be added without consuming or moving the first jump's working area. When Excellent needs one extra counted exercise for Master, station insertion skips gaps that would intrude into either existing jump working envelope.

The CKC Excellent Sit Stay and Master Stand Stay remain non-counted auxiliary exercises after Finish, matching the rulebook's counting model.


## CKC post-Finish Stay layout

For Rally Excellent and Rally Master, the mandatory non-counted Stay exercise is now laid out as
part of the real post-Finish workflow:

`Finish -> Sit/Stand Stay -> 15 ft minimum leash retrieval point`

The Stay remains outside the numbered course and the 15-ft guide is shown as a purple dashed
distance lane, not as an equipment footprint.

## Responsive map workspace

The on-screen course canvas now expands to the actual center panel dimensions. This avoids the
old fixed 1100x760 landscape canvas shrinking portrait/near-square rings, and gives the map the
maximum practical area between the left controls and right station list.


## Station-list setup distances

The right-hand station list now shows the practical setup distance instead of the internal stable
station identifier. Each numbered station displays the route distance from the previous numbered
station (or from Start for station 1), followed by the station x/y coordinates in feet. The internal
stable ID remains hidden from normal view and is only available as hover/title metadata.


## CARO ring dimensions

CARO's installed rule pack uses a minimum ring area of 1,500 sq ft rather than a fixed 50 x 40 ft
shape. The UI now makes this explicit. 50 x 40 ft remains the program's default/recommended
automatic-layout size, but judges may enter other dimensions that satisfy the CARO minimum.
The setup panel shows live square footage and rule compliance, and legal custom dimensions are
preserved when switching between levels in the same organization.


## Trial workflow tools

### Changes from previous level
After advancing a course, the station list and Last Level Change panel now use judge-facing physical
instructions: KEEP, CHANGE, MOVE, ADD and REMOVE. Change instructions include the current station
number, sign numbers and movement distance, while retained stations can be expanded separately.

### Venue templates and no-go zones
Use **Draw no-go zone** and drag a rectangle directly on the course map. The rectangle is stored in
the course JSON and treated as a physical constraint: generated route geometry, station anchors and
equipment working envelopes must stay clear. Named venue templates are saved locally in the browser
and include ring dimensions plus all no-go zones.

### Physical setup mode
The center toolbar includes **Physical setup mode**, which adds distance labels to every route leg.
The right station list continues to show distance from the prior station plus x/y coordinates.
**Export setup PDF** creates a setup-oriented course PDF with the same distance overlay and station
setup measurements.


## Compact-ring and venue-generation reliability

Legal CARO rings are no longer expected to behave like a 50 x 40 rectangle. On compact legal
shapes such as 50 x 30, 40 x 37.5, and 60 x 25 ft, automatic generation can use a sparse-center
corridor route that reserves practical working room for the CARO jump while keeping most stations
on outer lanes. This is a generator fallback, not a CARO rule.

Venue no-go areas now participate in route construction rather than only rejecting a finished
candidate. Travel legs can receive non-counted detour waypoints around obstacles; station count is
unchanged and setup distances follow the detoured travel line. Required equipment footprints are
also screened against no-go zones during sign assignment. If a mandatory equipment footprint truly
cannot fit, the generation error identifies required equipment as a likely constraint instead of
suggesting venue obstacles when none exist.


## Venue-generation reliability hardening

Venue detours are now treated as travel-path waypoints rather than rally exercises, so routing
around a pillar does not accidentally create a 45/90-degree sign requirement at the neighboring
station. CARO compact-ring generation now also has both long-axis/short-axis and asymmetric
edge-equipment corridor fallbacks. This lets the generator preserve a usable future jump/obstacle
bay on compact legal rings when a central venue obstacle consumes the normal equipment corridor.

Generated station anchors that initially land inside a no-go rectangle may be minimally nudged out
of that rectangle before the route is solved. Existing user-edited stations are never silently moved
by this helper; it only acts on fresh generator candidate geometry. CARO Novice/Intermediate
progression with venue zones now enforces the future Advanced jump-bay reservation instead of
skipping that reservation whenever a no-go zone exists.


### Level-change display toggle
Level-change markers are now a temporary comparison overlay rather than permanent course-map
decoration. After **Advance current course**, the overlay turns on automatically so the judge can
see KEEP / CHANGE / MOVE / ADD information. Use **Hide level changes** to return to a clean course
map and station list. The Last Level Change summary remains available even when the visual overlay
is hidden. New generation and JSON loading clear the comparison overlay.


## Venue waypoint rendering regression

No-go-zone rerouting may insert non-counted `waypoint` nodes into the walking path. These nodes are
route geometry only. They are now explicitly excluded from station numbering, sign artwork,
station labels, and station hit-testing. In Physical Setup Mode they may appear only as a small
unnumbered hollow route-bend marker.

The browser self-test also checks every mapped C-WAGS sign artwork URL plus START/FINISH for a
successful image load, and verifies that no C-WAGS sign definition contains an undefined ID/name.


## CKC route variety

CKC is no longer artificially restricted to **Classic variable**. Novice, Intermediate, Advanced,
Excellent, and Master now offer:

- **Mixed** — alternates between Classic variable and Angled Flow and is the default.
- **Angled Flow** — a non-crossing flowing/diagonal family. A compact variant is used on CKC's
  practical 40×50 / 50×40 ring sizes.
- **Classic variable** — the existing row/column variable layout remains available.

The experimental X-crossover route remains disabled for CKC by default. This is a design choice,
not a CKC rule.
