# Tablet Preview Harness Design

## Intent
Provide a local development harness for checking Mythallar's responsive layout on iPads and the Samsung Galaxy Tab S10 FE. Keep the existing `mobile.html` phone preview unchanged.

## Scope
- Add a standalone `tablet.html` page that embeds the live Vite app in an iframe.
- Include standard 10.9-inch iPad (820x1180), 11-inch iPad Pro (834x1194), and Galaxy Tab S10 FE browser and installed PWA view presets.
- Use the owner's measured Galaxy viewports:
  - Browser mode: 1316x648 landscape, 823x1141 portrait approximation.
  - Installed PWA / App mode: 1316x744 landscape, 823x1237 portrait approximation (reclaiming browser URL bar/tabs while keeping system navigation bar height).
- Start with the Galaxy Tab S10 FE (Browser) in portrait. Rotation uses the measured landscape dimensions; other presets swap viewport dimensions.
- Scale the device to fit the available review-pane space without changing the iframe's CSS viewport dimensions.
- Show the active device, orientation, logical viewport, and display scale. Link back to the full app and phone preview.

## Approach
Use a separate dependency-free HTML harness, matching the existing mobile preview. A combined device emulator was considered but would change the established phone workflow. Browser device emulation was not used because the requested focus is CSS layout rather than touch or user-agent simulation.

## Non-goals
No changes to application styling or breakpoints, physical device chrome simulation, touch emulation, or production device detection. The harness is a layout approximation; real-device testing remains necessary for browser chrome and input behavior.

## Verification
Load the harness from Vite, select each preset, rotate portrait/landscape, resize the host viewport, and confirm the iframe retains the selected logical dimensions while fitting on screen. Run the existing test suite and production build to confirm the app is unaffected.
