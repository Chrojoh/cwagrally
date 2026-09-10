# Provisional CARO spacing

The course-design checklist V12-2026 08 says distances are generally 10 or 15 feet minimum, but does not assign those distances to specific signs. The 2025 Rally Handbook, December amendments, 2026 Trial Officials Guide and Virtual Trial Guide do not resolve that distinction. Their equipment diagrams are not sufficient evidence for a universal station-spacing rule.

CARO generation now prefers 10-foot gaps. Quality scoring favors 15 feet after fast-pace signs and around selected multi-step exercises (backing, turn-and-back, turn-two-steps-down, and 1-2-3 steps). Backward exercises also receive an approach-side recommendation. These are conservative design estimates, not official CARO classifications. They are editable in `spacingGuidance` in the CARO pack.

Measurements use consecutive route-node coordinates in feet, not equipment edges or actual sign-holder corners. Known companion pairs are exempt from these general targets; this does not validate their individual distances. Manual courses get advisory warnings, not legality errors. Generation ranks these warnings through working-space quality; it does not guarantee every target is met.

Existing equipment footprint checks remain separate. This change does not implement the checklist's full five-foot-wide clear handler corridor or measurement from the last physical obstacle/cone to the next station. Those require explicit equipment endpoint geometry. Do not interpret a passing spacing advisory as complete checklist compliance.

Before making 15 feet mandatory, ask CARO which sign combinations need it and which physical points define the measurement.

The classic drawing routine alternates the preferred 10-foot floor with an 8-foot fallback so the estimate is not an absolute generation barrier. Any short gaps still receive the advisory and scoring penalty.

Integration validation: the focused spacing tests, all 26 legacy checks, organization progression, worker tests, and mandatory CARO rule checks pass in the current E-drive repository. Earlier generation/progression failures were reported against the older extracted copy. The 150-course variety run has not been repeated for this integration.
