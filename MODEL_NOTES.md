# Model notes

## Source and scale

The source is `/Users/rajin/Downloads/journal1.MOV`. The supplied `journal1 copy.mp4` is byte-identical to it. The source runs 104.16 seconds at 1920 × 1080 and about 29.97 frames per second.

The owner gave the outside dimensions as approximately **17.5 cm high × 10 cm wide**. The model uses the same 1.75 height-to-width ratio. The recording has no ruler, so the remaining sizes below are visual estimates. No source video or extracted frames are bundled with the website because the recording shows private handwritten pages.

## What the recording shows

| Part | Observed detail | Current model |
| --- | --- | --- |
| Cover | Dark navy leather, fairly rigid, with a soft sheen and fine grain. The outside top and bottom corners are rounded more than the binding edge. | Navy layered cover with asymmetric corners, thin 3D rims, grain, a restrained moving highlight, and inset shading. |
| Stitching | A line of visible blue stitching follows the top, bottom, and free outer edge. The binding edge has no stitching. | Dashed inset seam on those three edges only. |
| Paper block | Warm cream pages sit within a thick cover and show a dense edge when viewed from the side. | A single cream block suggests thickness; individual leaves remain close together so their front edges do not appear as duplicate pages. |
| Closure | One broad navy strap comes from the back, loops around the free edge, and snaps on the front. | One connected CSS 3D strap has a fixed rear anchor, an edge wrap, and a hinged loose end. The exterior snap uses the supplied silver metal texture. The open strap shows plain leather; the reverse button and receiver are concealed. The loose end makes one continuous motion before the cover opens, and reverses it on closing. |
| Bookmark | A narrow, dark ribbon emerges at the lower binding. | Narrow ribbon with a cut end. It tucks under the open pages, leaving only a short loop near the lower binding. |
| Page header | Three small weather boxes for sun, cloud, and cloud with rain streaks above a Monday-to-Sunday row on the left. `Memo No.` and `Date` fields on the right. A horizontal rule separates the header. | Matching blank header on each face. |
| Page rules | Fine dotted writing lines and a solid rule near the foot of each page. The outer page corners are lightly rounded. | Fifteen dotted rules, a solid bottom rule, and asymmetric page corners. |

## Sizes to verify later

The user estimates about 100 pages, so the model now uses 50 leaves. Standard visual page thickness is sufficient for this pass. The video cannot establish exact stitch pitch, cover overhang, or snap diameter, and no new measurements are needed to use the model.

## Implementation decisions

Native CSS 3D keeps the site small and makes text on a future note page ordinary HTML. The model has no runtime 3D library, font download, or build tool; sticker images are served locally. The strap, front cover, and paper leaves use separate hinges so the strap moves first and the pages turn independently. The covers have front and reverse faces plus top, bottom, and free-edge rims. The spine meets both covers at their binding edge; the paper block has rounded fore-edge corners through its depth, with short tangent panels joining its top, bottom, and side surfaces. The leaf depth increments are deliberately small, and each face uses only inset shading; the paper block supplies the visible thickness without repeated outer shadows. The sheets move deeper into the cover as it opens, and a narrow cream fold joins open pages at the binding. The black presentation shows the closed cover's depth, while the open book faces straight toward the viewer for reading. The responsive layout reduces the book to fit narrow screens; later written content will need a focused reading view on phones.

The cover shape uses one physical hinge edge and one free edge. The front exterior is rounded on the right; its reverse face appears rounded on the left when opened. The rear interior is rounded on the right in the book's front-facing coordinates; the rear exterior is mirrored so its free edge appears on the left when the book is viewed from behind. Stitching follows each free edge and avoids the spine. Eight short 3D panels per corner join the top and bottom rims to the free-edge rim, so the rounded outline also has thickness at oblique angles.

The cover now carries the supplied front sticker arrangement. The art and its locations come from the first page of `notebook stickers.pdf`; the back cover stays plain because no back layout was supplied. The strap carries the supplied `property of Rajin Khan` label. Pages remain blank for future notes.

## Sticker artwork

`assets/stickers/reference-front.png` is the supplied flattened front-cover layout. The 1115 × 1953 pixel navy rectangle from `(269, 193)` maps directly to the 310 × 542.5 CSS pixel cover, preserving the journal's 10:17.5 proportion. `assets/stickers/build_stickers.py` cuts each placed sticker from that layout and removes the flat navy background, leaving the leather texture visible. It uses `reference-art.png`, the supplied third artwork sheet, for the clean strap label. The website loads only the resulting individual PNGs. The original reference images and build script are retained so placement and artwork can be revised without starting over.

## Resting interaction

The closed journal makes one slow turn around its vertical center axis. A small pitch and rise keep the motion from looking mechanical. Pointer hover pauses the turn and tilts the book toward the pointer; dragging turns it directly. Opening first brings the front cover into view, then releases the strap and opens the cover. The idle motion pauses while pages are visible and is disabled when reduced motion is requested. Satoshi and La Belle Aurore are copied from the local portfolio project and served from `assets/fonts/`. The snap tab's loose end is about 15% shorter than before, with its snap and ownership label moved toward the cut end.
