# Project 3 implementation

Working folder: My Portfolio - Final only.
Review through Live Server: http://127.0.0.1:5503/#projects ; select Core Decay & Regeneration.

## Modified code

- index.html: inserted the Project 3 template only. All previous HTML, including every main-page section, all five cards, Pawfect Match and My Hero templates/dialogs, remains identical.
- style.css: appended only scoped Project 3 rules. All previous stylesheet content remains unchanged. The new journal uses the existing cream/ivory paper, sage headings, mocha body text and original fonts.
- script.js: added mapping-journal selection for project index 2, its accessible title/journal label, template initialization, and pause-on-close. Existing shared dialog close/Escape/backdrop/focus/scroll-lock behavior is reused. No video sources or project data for other projects changed.

Safety backup of the three original code files and pre-change SHA-256 inventory: Implementation Backup - 20261113-191139.

## Content sources

Project 3/Projection Mapping.docx supplies the concept, approximate 20-second duration, three stages, tools, materials and reflection challenges. Project 3/Projection Mapping Photo setup&process.docx supplies the original process descriptions and images. No additional research, production stages or outcomes were invented.

The journal contains Project Overview, Concept & Visual Narrative, Creative Process (four stages), Final Showcase and Reflection. The three narrative card headings use #596B4B.

## Images

Fourteen original process images were extracted without resizing or recompression to Project 3/Process Images/. All fourteen were hash-compared with their embedded Word images. The university title-page logo was excluded.

Ten images are displayed to avoid repetition:
- perspective-sketch-front.png
- perspective-sketch-side.png
- after-effects-animation-layers.png
- after-effects-apple-composition.png (tree-transformation timeline screenshot)
- after-effects-perspective-adjustment.png
- after-effects-composition-structure.png
- box-structure.jpeg
- installation-setup.jpeg
- touchdesigner-mapping.png
- aligned-projection.jpeg

Four additional extracted images are retained but not displayed:
- projector-position.jpeg
- after-effects-perspective-layers.png
- projection-alignment.jpeg
- final-projection-output.jpeg

Process galleries use two columns on desktop and one on narrow screens. Full-size links open the exact original extracted image in a new tab. All displayed proportions are preserved. Verification/image-inventory.json records each Word archive source, saved filename, usage and hash.

## Original showcase

The only video source is Project 3/Mapping final showcase.mp4, unchanged: H.264/AAC, 360x640 portrait, 30 FPS, 19.7 seconds. No conversion or re-encoding occurred. It is centered at its native portrait ratio with controls, playsinline and preload=metadata; autoplay and looping are absent. It pauses when the journal closes. LEFT, RIGHT and TOP demo videos are not included.

## Verification

Tested the actual Live Server site in Chrome at desktop 1440x1000, tablet 768x1024 and mobile 390x844. All 35 checks passed at each size (105 total), with no JavaScript errors or missing local assets. Browser screenshots and JSON results are in Verification/.

Verified all five sections in order, four process stages, ten loaded images, original image proportions, full-size targets, sage narrative headings, responsive gallery/information layout, vertical scrolling and no horizontal overflow. Original video playback advances and displays different visible frames. Native Escape and actual backdrop clicks close and pause correctly at all three sizes; the close button restores trigger focus and page scrolling.

Pawfect Match opens with all ten images, the approved side-by-side gallery and View Design functionality. My Hero opens with its five storyboard pages, working viewer and its existing browser video; it still pauses on close. Projects 4 and 5 retain their existing modals. No Home/About/Projects/Process/Contact markup or existing project-card styling changed.

The first tablet test sampled an unpresented black frame immediately after seeking. The assertion was corrected to compare two actual playback frames; no video or website code was altered to address this test-only timing issue.

Only the three listed code files changed among existing portfolio files. All existing Word documents, images, fonts, videos and prior audit/recovery artifacts inside Final remain byte-identical. No other portfolio folder was modified.