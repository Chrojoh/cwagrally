# Rally Course Designer V3 — foundation

This is the modular replacement foundation for the earlier single-file `Chrojoh/cwagrally` prototype.

## What this build demonstrates

- Versioned organization rule packs (`src/orgs/`)
- C-WAGS Rally 2021 as the first pack
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
    cwags-2021.js   first organization rule pack
  ui/
    canvas.js       course/path/sign rendering + drag hit-testing
```

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

### Pro → ARF upgrade correction
- R11 Table and R10 Tunnel are host-optional ARF exercises; neither is individually required.
- ARF requires 19–22 exercises with at least 8 ARF-class exercises.
- Pro-only exercises are not treated as ARF-legal simply because the course is being advanced from Pro.
- The upgrade solver now checks equipment-footprint feasibility while assigning signs, not only after the whole target course has been assembled.
- Sequence placement can contribute to ARF quota requirements so an optional equipment exercise is not forced merely to reach the eight-exercise minimum.
- A18 Return to Dog no longer imposes an artificial 180-degree course exit; the rule describes the handler returning to heel at the dog.
