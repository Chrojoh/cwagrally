Rally Course Designer — Floor and fenced ring preview

START
Extract this folder. Double-click start.cmd (requires Python), or run
npx serve . -l 8080 with Node.js. Open http://localhost:8080.
Generate/load/design a course, then select Walk course and press Play.

NEW
- Ground camera is one foot above the floor, with no walking bob.
- Gym floor is the default: filled wood planks instead of a measurement grid.
- Floor menu also offers rubber mats or grass.
- Low white lattice panels surround the ring. A five-foot opening is placed
  on the boundary nearest Start. This is illustrative rally-ring scenery,
  not a declaration of a registry-mandated fence design.
- Route line is hidden in first-person view and retained in Ring overview.
- Camera entry into an exercise avoids an abrupt heading reset.
- Flooring and fence segments are clipped at the near plane to avoid
  disappearing when they cross the camera view.

MOVEMENT
Perform exercises enables supported C-WAGS Starter motion scripts. These
include turns, full 270/360 rotations, right pivots, Zig/Zag, forward/backward
steps, side step, halts and pace changes. Other signs remain route previews
and are labelled as not scripted. Other organizations remain route previews.
Pause at signs stops after an exercise. Play/Pause works during exercises.
No dog or handler model is shown. Timing, turning radius and step length are
illustrative, based on the official 2021 Starter descriptions, not video
motion capture. Exercise paths are not collision-checked against the fence.
The fence and its opening do not change the saved course or its validation.

TESTS AND LIMITS
Passed: fence perimeter/opening/panel geometry; all three floor rendering
paths in the mocked canvas test; playback and exercise-route integration;
rotation direction, stationary pivots, backing gaze, motion continuity and
camera smoothing; JavaScript syntax and whitespace checks.
Real-browser visual review remains outstanding. The previous CARO generation
issue is unchanged. This is a preview, not certification of course compliance.

GITHUB
Upload the CONTENTS of this folder to your repository root, keeping paths.
This complete archive includes all prior improvements.
Changes since Rally-Designer-Ground-Level.zip:
  src/core/ring-scene.js (new)
  src/ui/walkthrough.js
  tests/ring-scene.mjs (new)
  tests/walkthrough-ui.mjs
  package.json
The live website has not changed; the earlier GitHub write request failed.
