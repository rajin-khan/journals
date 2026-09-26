"""Cut the placed sticker artwork from the supplied front-cover reference.

The reference sheet is a flattened layout, so its navy paper color is removed
from each crop. Run this after replacing reference-front.png with a new layout.
Requires Pillow only at build time; the website has no image dependency.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
REFERENCE = Image.open(ROOT / "reference-front.png").convert("RGB")
SOURCE_PAGE = Image.open(ROOT / "reference-art.png").convert("RGB")
NAVY = (4, 46, 95)

# Pixel boxes are from the original 1653 x 2339 front-cover layout.
STICKERS = {
    "delulu": (310, 244, 381, 272),
    "botanical-stamp": (1030, 244, 306, 210),
    "sleeping-cat": (718, 308, 251, 252),
    "another-point-of-view": (997, 515, 295, 157),
    "computer-club": (364, 577, 277, 191),
    "eyes": (701, 657, 155, 398),
    "road": (925, 728, 408, 256),
    "pantone-moon": (364, 835, 251, 303),
    "goated": (356, 1206, 373, 231),
    "garden": (1025, 1301, 290, 274),
    "why-stop-now": (758, 1325, 257, 59),
    "dream-again": (666, 1417, 355, 354),
    "whimsy": (340, 1579, 286, 357),
    "portrait": (1062, 1624, 242, 432),
    "testing-code": (716, 1839, 281, 178),
    "git-merge": (385, 1982, 251, 112),
}

for name, (x, y, width, height) in STICKERS.items():
    margin = 2
    image = REFERENCE.crop((x - margin, y - margin, x + width + margin, y + height + margin))
    rgba = Image.new("RGBA", image.size)
    source = image.load()
    result = rgba.load()
    for py in range(image.height):
        for px in range(image.width):
            red, green, blue = source[px, py]
            distance = max(abs(red - NAVY[0]), abs(green - NAVY[1]), abs(blue - NAVY[2]))
            alpha = max(0, min(255, round((distance - 2) * 255 / 21)))
            result[px, py] = (red, green, blue, alpha)
    rgba.save(ROOT / f"{name}.png", optimize=True)

# This is the clean black label from the third source sheet, without page white.
SOURCE_PAGE.crop((114, 1436, 680, 1662)).save(ROOT / "property-label.png", optimize=True)
