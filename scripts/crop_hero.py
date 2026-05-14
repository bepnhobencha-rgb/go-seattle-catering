"""Crop hero food images from the original flyer menu boards.

Coordinates approximated and tuned by inspecting each board.
Output: public/images/items/<code>.jpg
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "images" / "menu"
OUT = ROOT / "public" / "images" / "items"
OUT.mkdir(parents=True, exist_ok=True)

# Each entry: (code, source, (left, top, right, bottom))
CROPS = [
    # ---- Bánh Mì board (2048x1152) — 4 cols x 4 rows ----
    # Clean sandwich photos (avoid label overlay top/bottom)
    ("B1",  "banhmi.jpg",    (50,    160,  470,  320)),  # Grilled Pork
    ("B2",  "banhmi.jpg",    (50,    395,  470,  555)),  # Grilled Chicken
    ("B5",  "banhmi.jpg",    (530,   160,  960,  320)),  # Caramelized Pork Belly
    ("B7",  "banhmi.jpg",    (530,   395,  960,  555)),  # Pork Roll
    ("B9",  "banhmi.jpg",    (1010,  160, 1450,  320)),  # Shredded Pork Skin
    ("B13", "banhmi.jpg",    (1525,  160, 2030,  320)),  # Lemongrass Beef

    # ---- Mains board (1113x891) — small image, careful crops ----
    # Header takes ~140. F1/F2 are top-left, with photos near (10,10)-(180,160)
    # Middle row F3..F9 at y ~ 185-340, 7 photos each ~150 wide
    # Bottom row F10..F16 at y ~ 510-665
    ("F1",  "mains.jpg",     (15,    25,   170,  175)),  # Gỏi cuốn
    ("F4",  "mains.jpg",     (175,   200,  325,  365)),  # Cơm sườn heo
    ("F7",  "mains.jpg",     (625,   200,  775,  365)),  # Sườn bò nướng
    ("F8",  "mains.jpg",     (775,   200,  925,  365)),  # Bún đặc biệt
    ("F14", "mains.jpg",     (625,   510,  790,  680)),  # Mì xào hải sản

    # ---- Drinks board (2048x1628) — 3 cols ----
    ("J1",  "drinks.jpg",    (60,    220,  235,  475)),  # Sugarcane (narrow to avoid J2 label)
    ("M3",  "drinks.jpg",    (1010,  220, 1180,  475)),  # Thai Green Milk Tea (narrow)
    ("C1",  "drinks.jpg",    (1290,  130, 1900,  730)),  # Big coffee glasses

    # ---- Smoothies board (2048x1152) ----
    ("S1",  "smoothies.jpg", (75,    100,  290,  390)),  # Avocado
    ("S2",  "smoothies.jpg", (305,   100,  520,  390)),  # Durian
    # Big strawberry/peach smoothie hero from the right side
    ("HERO_SMOOTHIE", "smoothies.jpg", (1180, 30, 2030, 1130)),
]

def main():
    for code, src, box in CROPS:
        path = SRC / src
        if not path.exists():
            print(f"❌ missing {path}")
            continue
        img = Image.open(path).convert("RGB")
        cropped = img.crop(box)
        out = OUT / f"{code}.jpg"
        cropped.save(out, "JPEG", quality=88, optimize=True)
        print(f"✅ {code}.jpg  ({box[2]-box[0]}x{box[3]-box[1]})")

if __name__ == "__main__":
    main()
