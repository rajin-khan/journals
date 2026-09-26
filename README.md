# Journal 1

A small website for the journal shown in `journal1.MOV`, with front-cover stickers arranged from the supplied `notebook stickers.pdf` reference. The snap strap swings away before the cover opens. Fifty paper leaves provide about one hundred blank writing faces. The reference video and its handwritten content are **not** included in this folder.

## Run it

From this folder, run:

```sh
python3 -m http.server 8899 --bind 127.0.0.1
```

Open `http://127.0.0.1:8899/` in a browser. There is no build step or package installation.

## Controls

- Click the journal or the button at bottom left to open it. The same button closes it.
- While closed, the journal turns slowly on its vertical axis. Hover to pause and tilt it, or drag it to choose an angle. The motion stops while the journal is open.
- Swipe left across the right page to turn forward; swipe right across the left page to turn back.
- You can also click a page to turn it. Left and right arrow keys work, and Escape closes the journal.
- The bottom-right link returns to `rajinkhan.com`.

## How it is built

The journal uses native CSS 3D transforms. Separate layers represent the two rigid covers, spine, paper block, ribbon, one continuous snap strap, and each sheet. A short free-edge rim shows cover thickness, and the open leaves move back into the book so the paper and leather meet at a narrow gutter. The strap has connected rear, edge wrap, and loose sections; its loose section lifts off the front snap in one motion before the cover opens. Every sheet has a front and back face and rotates around the binding. Gradients and restrained grain suggest leather, paper, and stitching; the supplied metal image forms the snap cap. Individual transparent PNGs place the supplied stickers on the front cover and the ownership label on the strap. The cover catches a small pointer-responsive highlight without giving the journal free rotation. The page artwork is HTML, so it can later hold the actual journal content without baking text into a texture.

`index.html` contains the page frame and controls. `styles.css` contains the model and visual design, including local Satoshi and La Belle Aurore fonts copied from the portfolio project. `script.js` creates pages and handles journal rotation, opening, turning, closing, keyboard controls, and responsive scaling. `MODEL_NOTES.md` records what the video shows and what still needs measurement.

Only the visible and adjacent leaves carry page artwork at a time. The other leaves retain their place in the 100-face model without being painted. The resting turn updates one transform per frame and stops its animation loop while the journal is open, transitioning, hidden, or in reduced-motion mode.

## Next passes

1. Add written page content and a close reading view for narrow screens.
2. Fine tune the remaining physical details against the journal if measurements become available.

The model is interactive. Its leather grain and hardware are visual approximations based on a handheld recording, not a photogrammetric scan. Sticker crop and placement details are recorded in `MODEL_NOTES.md`.
