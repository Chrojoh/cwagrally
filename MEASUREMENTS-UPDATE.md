# Course measurement and joining update

- Select a station to see the straight anchor gap and drawn route length before and after it.
- The inspector shows published distance details separately from provisional software working areas.
- Supported sign pairs may be explicitly joined, kept separate, or left in legacy automatic mode. Explicit designation records layout intent, not judge approval.
- Saved decisions are bound to station identities and sign IDs. Changing a pair produces a review warning rather than carrying the old explicit exemption silently.
- Approximate exercise-distance descriptions produce warnings when provisional tolerances are exceeded. Firm published boundaries retain errors.
- Setup PDF distances now say "route" to identify what was measured.

## Supplied 2023 course-design slides
The seven-slide Course_design_program_CW2023.ppt was inspected. Its movement legends support the existing Starter Zig/Zag and Advanced Zig Zag exit directions. Its Send Over Jump illustration distinguishes dog and handler paths. It supplies no numerical exercise clearances or labeled drawing scale, so its symbol sizes have not been converted into dimensions.

Keep the existing judge questionnaire. Working envelopes, fence clearance, exercise reference positions and unsupported combinations still need review. The application does not yet validate the full performed space of every exercise. In particular, P16 remains excluded from automatic generation until separate jump geometry can be represented.

## SinisterLabs archive findings
The downloaded CWAGS_20120101.rrz contains metadata for January 2008 / effective January 2012, with course version text "As of 2/12/20". No MIN_SIGN_SPACING tags or numeric per-exercise working-area rectangles were found in that rules file. This does not establish whether the desktop program applies built-in defaults.
Exercise descriptions specify jump, pause-box and step distances. Zig/Zag uses 2–3 steps without a feet conversion. Its Pro P09 description says 3 feet of handler offset, which conflicts with the 6 feet in the reviewed C-WAGS Pro class PDF. Values have not been copied unchecked into this program. The archive and its artwork are not redistributed here.

## Installation
This is the complete updated project. Replace the repository contents with these files while retaining your GitHub repository settings, then publish through your usual GitHub Pages workflow. This archive has not been pushed to the live repository.
