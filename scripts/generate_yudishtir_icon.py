import os
import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load the official macOS squircle alpha mask and shadow template from nightly icon
template_path = "/Users/abc/Desktop/yudishtir/assets/nightly/nightly-macos-1024.png"
template_img = Image.open(template_path)
template_alpha = np.array(template_img.split()[-1], dtype=np.float32)

# Create a 1024x1024 RGBA canvas
width, height = 1024, 1024
canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)

# 1. Background Gradient inside the squircle: Deep Obsidian / Cosmic Midnight
# We fill a full gradient layer, then mask it with the squircle
bg_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg_layer)

for y in range(height):
    # Smooth vertical gradient from deep blue-black (#161824) to void black (#08090d)
    t = y / height
    r = int(22 * (1 - t) + 8 * t)
    g = int(24 * (1 - t) + 9 * t)
    b = int(36 * (1 - t) + 13 * t)
    bg_draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

# Subtle radial celestial gold aura behind the chakra
aura_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
aura_draw = ImageDraw.Draw(aura_layer)
cx, cy = 512, 500

for radius in range(380, 0, -4):
    opacity = int(45 * (1 - radius / 380) ** 1.5)
    aura_draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=(245, 158, 11, opacity),
    )

bg_layer = Image.alpha_composite(bg_layer, aura_layer)

# 2. Draw Dharmachakra (Wheel of Truth & Sovereign Leadership)
emblem_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
emblem_draw = ImageDraw.Draw(emblem_layer)

# Outer Ring Double Bevel
outer_r = 270
inner_hub_r = 115

# Outer subtle decorative dashed ring
for a_deg in range(0, 360, 6):
    a = math.radians(a_deg)
    px = cx + (outer_r + 26) * math.cos(a)
    py = cy + (outer_r + 26) * math.sin(a)
    emblem_draw.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(251, 191, 36, 120))

# Heavy Golden Outer Rim
for dr in range(-14, 15):
    dist = abs(dr)
    alpha = int(255 * (1 - dist / 18))
    # Metallic gold shading
    r_val = int(254 - dist * 4)
    g_val = int(200 - dist * 8)
    b_val = int(80 - dist * 3)
    emblem_draw.ellipse(
        [cx - (outer_r + dr), cy - (outer_r + dr), cx + (outer_r + dr), cy + (outer_r + dr)],
        outline=(r_val, g_val, b_val, alpha),
        width=2,
    )

# 24 Golden Rim Studs (24 virtues of Dharma)
for i in range(24):
    angle = math.radians(i * 15)
    bx = cx + (outer_r + 14) * math.cos(angle)
    by = cy + (outer_r + 14) * math.sin(angle)
    emblem_draw.ellipse([bx - 6, by - 6, bx + 6, by + 6], fill=(254, 240, 138, 255))
    emblem_draw.ellipse([bx - 3, by - 3, bx + 3, by + 3], fill=(255, 255, 255, 255))

# 12 Tapered Golden Spokes + Fleet Nodes
for i in range(12):
    angle = math.radians(i * 30)
    norm = angle + math.pi / 2
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    cos_n, sin_n = math.cos(norm), math.sin(norm)

    # Base at inner hub
    bx1 = cx + inner_hub_r * cos_a + 8 * cos_n
    by1 = cy + inner_hub_r * sin_a + 8 * sin_n
    bx2 = cx + inner_hub_r * cos_a - 8 * cos_n
    by2 = cy + inner_hub_r * sin_a - 8 * sin_n

    # Tip at outer rim
    tx1 = cx + outer_r * cos_a - 14 * cos_n
    ty1 = cy + outer_r * sin_a - 14 * sin_n
    tx2 = cx + outer_r * cos_a + 14 * cos_n
    ty2 = cy + outer_r * sin_a + 14 * sin_n

    # Draw spoke polygon
    emblem_draw.polygon(
        [(bx1, by1), (tx2, ty2), (tx1, ty1), (bx2, by2)],
        fill=(245, 158, 11, 230),
    )
    # Bright center ridge
    emblem_draw.line(
        [(cx + inner_hub_r * cos_a, cy + inner_hub_r * sin_a), (cx + outer_r * cos_a, cy + outer_r * sin_a)],
        fill=(254, 240, 138, 240),
        width=3,
    )

    # Outer Fleet Agent Node (12 orbs around rim)
    orb_x = cx + (outer_r + 34) * cos_a
    orb_y = cy + (outer_r + 34) * sin_a
    emblem_draw.ellipse([orb_x - 10, orb_y - 10, orb_x + 10, orb_y + 10], fill=(217, 119, 6, 255))
    emblem_draw.ellipse([orb_x - 7, orb_y - 7, orb_x + 7, orb_y + 7], fill=(251, 191, 36, 255))
    emblem_draw.ellipse([orb_x - 3, orb_y - 3, orb_x + 3, orb_y + 3], fill=(255, 255, 255, 255))

# Inner Hub Rings
for dr in range(-10, 11):
    dist = abs(dr)
    alpha = int(255 * (1 - dist / 14))
    emblem_draw.ellipse(
        [cx - (inner_hub_r + dr), cy - (inner_hub_r + dr), cx + (inner_hub_r + dr), cy + (inner_hub_r + dr)],
        outline=(245, 158, 11, alpha),
        width=2,
    )

# Inner Core Disc (Dark Obsidian with golden glow)
emblem_draw.ellipse(
    [cx - (inner_hub_r - 10), cy - (inner_hub_r - 10), cx + (inner_hub_r - 10), cy + (inner_hub_r - 10)],
    fill=(14, 15, 22, 255),
    outline=(251, 191, 36, 200),
    width=3,
)

# Central Sovereign Motif: Golden Crown & Vel (Spear of Truth)
# Main center spire
emblem_draw.polygon(
    [(cx, cy - 68), (cx + 18, cy - 12), (cx, cy + 38), (cx - 18, cy - 12)],
    fill=(254, 240, 138, 255),
)
# Left crown wing
emblem_draw.polygon(
    [(cx - 40, cy - 35), (cx - 14, cy), (cx - 28, cy + 32), (cx - 46, cy)],
    fill=(245, 158, 11, 240),
)
# Right crown wing
emblem_draw.polygon(
    [(cx + 40, cy - 35), (cx + 46, cy), (cx + 28, cy + 32), (cx + 14, cy)],
    fill=(245, 158, 11, 240),
)
# Central Brilliant Satya Diamond
emblem_draw.polygon(
    [(cx, cy - 22), (cx + 12, cy - 6), (cx, cy + 10), (cx - 12, cy - 6)],
    fill=(255, 255, 255, 255),
)

# Subtle outer squircle rim highlight (golden border just inside the squircle)
border_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
border_draw = ImageDraw.Draw(border_layer)
# Rounded rectangle inside squircle
border_draw.rounded_rectangle(
    [106, 106, 918, 918],
    radius=172,
    outline=(251, 191, 36, 60),
    width=2,
)

# Composite artwork: bg + emblem + border
artwork = Image.alpha_composite(bg_layer, emblem_layer)
artwork = Image.alpha_composite(artwork, border_layer)

# 3. APPLY NATIVE APPLE SQUIRCLE MASK AND DROP SHADOW
# We replace the alpha channel of artwork with template_alpha!
# Also, in areas where template_alpha < 255 (the shadow area outside the squircle body),
# we let the shadow be dark/black so it casts a soft shadow on transparent desktop/dock.
art_np = np.array(artwork)

# Create final image array
final_np = np.zeros((height, width, 4), dtype=np.uint8)

# The shadow region in template: template_alpha > 0 but < 255
# For the main squircle body (template_alpha == 255): artwork is fully visible
# For the edge anti-aliasing & drop shadow: blend artwork RGB with black shadow using template_alpha
final_np[:, :, 0] = art_np[:, :, 0]
final_np[:, :, 1] = art_np[:, :, 1]
final_np[:, :, 2] = art_np[:, :, 2]
final_np[:, :, 3] = template_alpha.astype(np.uint8)

final_img = Image.fromarray(final_np, mode="RGBA")

# Verify corner pixels are 100% TRANSPARENT
p0 = final_img.getpixel((0, 0))
p1 = final_img.getpixel((10, 10))
p2 = final_img.getpixel((50, 50))
print(f"Corner (0,0): {p0}, (10,10): {p1}, (50,50): {p2}")
assert p0[3] == 0, f"Corner must be transparent, got alpha={p0[3]}"
assert p1[3] == 0, f"Corner must be transparent, got alpha={p1[3]}"
print("✓ Verified: 100% TRANSPARENT CORNERS (NO WHITE SQUARE!)")

out_dir = "/tmp/yudishtir-brand-gen"
os.makedirs(out_dir, exist_ok=True)
master_png = os.path.join(out_dir, "yudishtir-prod-1024.png")
final_img.save(master_png)
print(f"✓ Saved master 1024x1024 PNG with transparent corners to: {master_png}")
