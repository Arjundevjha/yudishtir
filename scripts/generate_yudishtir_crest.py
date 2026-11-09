import os
import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load template mask
template_path = "/Users/abc/Desktop/yudishtir/assets/nightly/nightly-macos-1024.png"
template_img = Image.open(template_path)
template_alpha = np.array(template_img.split()[-1], dtype=np.float32)

width, height = 1024, 1024

# 1. Background Layer: Royal Obsidian Void with subtle warm amber aura
bg_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg_layer)

for y in range(height):
    # Midnight black obsidian gradient
    t = y / height
    r = int(18 * (1 - t) + 6 * t)
    g = int(20 * (1 - t) + 7 * t)
    b = int(28 * (1 - t) + 10 * t)
    bg_draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

# Subtle radiant aura behind crest center
aura_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
aura_draw = ImageDraw.Draw(aura_layer)
cx, cy = 512, 510

for radius in range(400, 0, -4):
    opacity = int(40 * (1 - radius / 400) ** 1.8)
    aura_draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=(245, 158, 11, opacity),
    )

bg_layer = Image.alpha_composite(bg_layer, aura_layer)

# 2. Sovereign Crest Layer (Chiseled Gold & Obsidian)
crest_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(crest_layer)

# Gold Palette
GOLD_LIGHT = (254, 240, 138, 255)   # Specular Highlight #fef08a
GOLD_BASE = (251, 191, 36, 255)     # Radiant Gold #fbbf24
GOLD_MED = (245, 158, 11, 255)      # Rich Amber #f59e0b
GOLD_DARK = (180, 83, 9, 255)       # Burnished Bronze #b45309
OBSIDIAN_CORE = (14, 15, 24, 255)

# A. Central Spear of Truth (Sovereign Lance)
# Left facet (Bright light source from top-left)
spear_left = [
    (cx, 160),         # Tip
    (cx - 52, 340),    # Left barb
    (cx - 26, 440),    # Left neck
    (cx, 490),         # Base
]
draw.polygon(spear_left, fill=GOLD_LIGHT)

# Right facet (Shaded)
spear_right = [
    (cx, 160),         # Tip
    (cx, 490),         # Base
    (cx + 26, 440),    # Right neck
    (cx + 52, 340),    # Right barb
]
draw.polygon(spear_right, fill=GOLD_MED)

# Center spine ridge of spear
draw.line([(cx, 160), (cx, 490)], fill=(255, 255, 255, 255), width=3)

# B. Crown Wings forming Sovereign "Y"
# Left Wing - Outer facet
left_wing_outer = [
    (cx - 44, 760),    # Base
    (cx - 290, 310),   # Outer wing tip
    (cx - 210, 390),   # Inner notch
    (cx - 165, 330),   # Mid finial
    (cx - 95, 500),    # Inner waist
    (cx - 44, 660),    # Inner base
]
draw.polygon(left_wing_outer, fill=GOLD_MED)

# Left Wing - Chiseled inner bevel
left_wing_bevel = [
    (cx - 44, 760),
    (cx - 290, 310),
    (cx - 230, 420),
    (cx - 110, 540),
]
draw.polygon(left_wing_bevel, fill=GOLD_BASE)

# Right Wing - Outer facet (Shaded side)
right_wing_outer = [
    (cx + 44, 760),    # Base
    (cx + 290, 310),   # Outer wing tip
    (cx + 210, 390),   # Inner notch
    (cx + 165, 330),   # Mid finial
    (cx + 95, 500),    # Inner waist
    (cx + 44, 660),    # Inner base
]
draw.polygon(right_wing_outer, fill=GOLD_DARK)

# Right Wing - Chiseled inner bevel
right_wing_bevel = [
    (cx + 44, 760),
    (cx + 290, 310),
    (cx + 230, 420),
    (cx + 110, 540),
]
draw.polygon(right_wing_bevel, fill=GOLD_MED)

# C. Central Satya Diamond (Gem of Absolute Truth)
# Outer diamond frame
diamond_outer = [
    (cx, 480),         # Top
    (cx + 80, 570),    # Right
    (cx, 660),         # Bottom
    (cx - 80, 570),    # Left
]
draw.polygon(diamond_outer, fill=(10, 11, 18, 255), outline=GOLD_BASE, width=4)

# Faceted diamond facets
# Top-left facet (Brilliant white)
draw.polygon([(cx, 484), (cx, 570), (cx - 76, 570)], fill=(255, 255, 255, 240))
# Top-right facet (Bright gold)
draw.polygon([(cx, 484), (cx + 76, 570), (cx, 570)], fill=GOLD_LIGHT)
# Bottom-left facet (Amber gold)
draw.polygon([(cx, 570), (cx - 76, 570), (cx, 656)], fill=GOLD_MED)
# Bottom-right facet (Deep amber)
draw.polygon([(cx, 570), (cx + 76, 570), (cx, 656)], fill=GOLD_DARK)

# Central Diamond Core Star
draw.polygon([(cx, 545), (cx + 22, 570), (cx, 595), (cx - 22, 570)], fill=(255, 255, 255, 255))

# D. Steadfast Base Chevron (Yudhi-Sthira Pedestal)
base_chevron = [
    (cx, 830),         # Lowest point
    (cx + 74, 740),    # Right foot
    (cx + 44, 700),    # Right inner
    (cx, 740),         # Center notch
    (cx - 44, 700),    # Left inner
    (cx - 74, 740),    # Left foot
]
draw.polygon(base_chevron, fill=GOLD_BASE)
draw.line([(cx - 74, 740), (cx, 830), (cx + 74, 740)], fill=GOLD_LIGHT, width=3)

# E. Flanking Royal Emblems (The 4 Pandava Fleet Orbs)
fleet_stars = [
    (cx - 290, 270),   # Left outer
    (cx - 165, 290),   # Left inner
    (cx + 165, 290),   # Right inner
    (cx + 290, 270),   # Right outer
]
for sx, sy in fleet_stars:
    # 4-point diamond star
    star_poly = [(sx, sy - 14), (sx + 8, sy), (sx, sy + 14), (sx - 8, sy)]
    draw.polygon(star_poly, fill=GOLD_LIGHT)
    draw.ellipse([sx - 3, sy - 3, sx + 3, sy + 3], fill=(255, 255, 255, 255))

# Subtle outer squircle rim highlight
border_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
border_draw = ImageDraw.Draw(border_layer)
border_draw.rounded_rectangle(
    [106, 106, 918, 918],
    radius=172,
    outline=(251, 191, 36, 50),
    width=2,
)

artwork = Image.alpha_composite(bg_layer, crest_layer)
artwork = Image.alpha_composite(artwork, border_layer)

# Apply Apple squircle mask & shadow
art_np = np.array(artwork)
final_np = np.zeros((height, width, 4), dtype=np.uint8)
final_np[:, :, 0] = art_np[:, :, 0]
final_np[:, :, 1] = art_np[:, :, 1]
final_np[:, :, 2] = art_np[:, :, 2]
final_np[:, :, 3] = template_alpha.astype(np.uint8)

final_img = Image.fromarray(final_np, mode="RGBA")
out_dir = "/tmp/yudishtir-brand-gen"
os.makedirs(out_dir, exist_ok=True)
master_png = os.path.join(out_dir, "yudishtir-crest-1024.png")
final_img.save(master_png)
print("✓ Successfully generated master Yudishtir Sovereign Crest:", master_png)
