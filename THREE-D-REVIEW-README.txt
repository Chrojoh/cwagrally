Rally Course Designer — true 3D course review

TRY THE SAME SHORT COURSE FIRST
1. Extract the ZIP into a new folder.
2. Run start.cmd (requires Python), or run npx serve . -l 8080 with Node.js.
3. Open http://localhost:8080/review-demo.html and select Open 3D review.
   The main designer at http://localhost:8080 also has a 3D demo button.
4. Play through the halt, pivot, zig, 270-degree turn and full circle.
   This fixture is an animation demonstration, not a legal trial course.
5. Use Walk course in the main designer to review your actual course.
Do not open index.html or review-demo.html directly from disk: use HTTP.

WHAT CHANGED
The default walkthrough now uses Three.js WebGL rendering instead of
projecting hand-drawn shapes onto a 2D canvas.
- Textured gym wood flooring, rubber mats or grass.
- Soft directional shadows, warm/cool fill lighting, and a training-hall
  backdrop. Grass hides the hall walls.
- Three-dimensional lattice fence, posts and feet, with an opening near Start.
- Fixed physical sign boards on low stands, facing the incoming course leg.
  Signs do not rotate to face the camera when the viewer turns around.
- Camera remains exactly one foot above the floor, without walking bob.
- Larger review window, overhead map and direction arrow, station selection,
  Replay exercise, pace/view/floor controls and playback status.
- GPU resources are disposed when closing the review. The bundled engine
  and its MIT license are included; no CDN connection is required at runtime.

COMPATIBILITY
The 3D renderer needs a browser/device supporting WebGL 2. If unavailable,
Basic view is labelled and uses the earlier 2D preview. Hardware performance
and visual appearance have not yet been measured on your computer.

MOVEMENT AND LIMITS
Supported C-WAGS Starter exercises retain the earlier handler motion scripts.
Other signs are labelled as lacking scripts; other organizations remain route
previews. Timing, radius and step length are illustrative, based on the
2021 Starter descriptions, not on the inaccessible YouTube reference.
Cones/jumps are not yet fully modelled as a verified equipment layout.
Exercise paths are not collision-checked against the fence. Review does not
certify rule compliance and does not modify course data.

VALIDATION
Passed: 3D scene construction, fixed sign orientation, batched lattice,
texture caching and resource disposal; ring geometry; route length, station
order and camera smoothing; motion scripts; mocked UI playback/navigation/
exercise integration and replay availability; worker cancellation; syntax
and whitespace checks.
Actual WebGL pixels, visual appearance and frame rate remain unverified.
The cloud browser rejected the local-file visual-test page under its URL
security policy and cannot reach the workspace's HTTP server. No screenshot
or claim of browser visual approval is included.
The earlier unrelated CARO generation failure remains unresolved.

INSTALLING IN GITHUB
The live website has not changed: earlier GitHub write access was rejected.
Upload folder CONTENTS to the repository root, preserving all paths. This
complete ZIP includes prior updates. Relative to the fenced-ring ZIP, update:
  index.html, styles.css, package.json, src/app.js, src/ui/walkthrough.js
and add:
  review-demo.html
  src/core/review-demo.js
  src/ui/review-scene.js
  src/vendor/three.module.js
  src/vendor/three.core.min.js
  src/vendor/THREE-LICENSE.txt
  tests/review-scene.mjs
Also update tests/walkthrough-ui.mjs. Keep the two vendor JS files together.
COURSE-REVIEW-UPDATE.patch contains all code changes from the original source.
