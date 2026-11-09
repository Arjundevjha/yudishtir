import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 1060
img = Image.new("RGBA", (W, H), (14, 15, 20, 255))
draw = ImageDraw.Draw(img)

# Try loading standard macOS system font, fallback to default
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 20)
    font_bold = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 16)
    font_regular = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 14)
    font_code = ImageFont.truetype("/System/Library/Fonts/SFMono-Regular.otf", 13)
    font_small = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 12)
    font_badge = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 11)
except Exception:
    font_title = font_bold = font_regular = font_code = font_small = font_badge = ImageFont.load_default()

# 1. Top Window Titlebar
draw.rectangle([(0, 0), (W, 48)], fill=(18, 20, 26, 255))
draw.line([(0, 48), (W, 48)], fill=(34, 38, 48, 255), width=1)

# Traffic Lights
draw.ellipse([(18, 17), (30, 29)], fill=(255, 95, 87, 255))
draw.ellipse([(38, 17), (50, 29)], fill=(254, 188, 46, 255))
draw.ellipse([(58, 17), (70, 29)], fill=(40, 201, 64, 255))

# Titlebar Logo & Crest
draw.polygon([(100, 16), (105, 26), (100, 32), (95, 26)], fill=(251, 191, 36, 255))
draw.text((116, 16), "Yudishtir", fill=(251, 191, 36, 255), font=font_title)
draw.text((220, 17), "•  Multi-Agent Fleet Control Plane", fill=(130, 140, 160, 255), font=font_regular)

# 2. Left Sidebar (w=280)
draw.rectangle([(0, 49), (280, H)], fill=(16, 17, 23, 255))
draw.line([(280, 49), (280, H)], fill=(32, 35, 45, 255), width=1)

# Sidebar items
draw.text((20, 70), "ACTIVE FLEET THREADS", fill=(90, 100, 120, 255), font=font_small)

# Thread item
draw.rounded_rectangle([(12, 100), (268, 144)], radius=8, fill=(30, 33, 44, 255), outline=(251, 191, 36, 80))
draw.polygon([(24, 116), (30, 122), (24, 128)], fill=(251, 191, 36, 255))
draw.text((38, 112), "RFC-042: Sharding Engine", fill=(255, 255, 255, 255), font=font_bold)
draw.text((38, 128), "Argon ➔ Freebuff ➔ Pi ➔ Snyk", fill=(160, 170, 190, 255), font=font_badge)

# Sidebar stats
draw.rounded_rectangle([(16, 170), (264, 380)], radius=10, fill=(20, 22, 30, 255), outline=(40, 44, 58, 255))
draw.text((28, 185), "SWE FLEET ROSTER", fill=(251, 191, 36, 255), font=font_small)

roles_data = [
    ("👑", "Architect", "Argon (Claude Opus)", (251, 191, 36, 255)),
    ("🛠️", "Senior Imp.", "Freebuff (MiMo v2.6)", (56, 189, 248, 255)),
    ("☕", "Intern", "Pi (Copilot gpt-4.1)", (148, 163, 184, 255)),
    ("🛡️", "Infosec", "Snyk (MCP Hub)", (74, 222, 128, 255)),
]

y_role = 215
for icon, title, model, color in roles_data:
    draw.text((28, y_role), icon, font=font_regular)
    draw.text((50, y_role), title, fill=color, font=font_bold)
    draw.text((50, y_role + 16), model, fill=(130, 140, 160, 255), font=font_badge)
    y_role += 38

# MCP Hub Status Indicator
draw.rounded_rectangle([(16, H - 70), (264, H - 20)], radius=8, fill=(22, 25, 34, 255), outline=(45, 50, 65, 255))
draw.ellipse([(28, H - 48), (36, H - 40)], fill=(74, 222, 128, 255))
draw.text((44, H - 52), "MCP Hub Connected", fill=(240, 240, 240, 255), font=font_bold)
draw.text((44, H - 36), "327 tools active • port 37373", fill=(110, 120, 140, 255), font=font_badge)

# 3. Main Chat View (x: 281 to W)
main_x = 310

# Message helper
def draw_message(y, sender, role_title, role_color, text, mentions, is_tool=False):
    # Avatar Circle
    draw.ellipse([(main_x, y), (main_x + 36, y + 36)], fill=(28, 31, 42, 255), outline=role_color, width=2)
    draw.text((main_x + 10, y + 8), sender[0], fill=role_color, font=font_bold)
    
    # Header: Name + Badge + Timestamp
    draw.text((main_x + 48, y + 2), sender, fill=(255, 255, 255, 255), font=font_bold)
    
    # Badge Pill
    badge_w = 135
    draw.rounded_rectangle([(main_x + 120, y + 1), (main_x + 120 + badge_w, y + 21)], radius=10, fill=(30, 32, 42, 255), outline=role_color, width=1)
    draw.text((main_x + 128, y + 5), role_title, fill=role_color, font=font_badge)
    
    draw.text((main_x + 270, y + 4), "just now", fill=(100, 110, 130, 255), font=font_badge)
    
    # Message Body Box
    box_w = 1200
    box_h = 75 if not is_tool else 65
    draw.rounded_rectangle([(main_x + 48, y + 28), (main_x + 48 + box_w, y + 28 + box_h)], radius=8, fill=(20, 22, 30, 255), outline=(36, 40, 52, 255))
    
    draw.text((main_x + 62, y + 38), text, fill=(225, 230, 240, 255), font=font_regular)
    
    # Mention pills line
    pill_x = main_x + 62
    for m_text, m_color in mentions:
        pw = len(m_text) * 8 + 18
        draw.rounded_rectangle([(pill_x, y + 68), (pill_x + pw, y + 90)], radius=6, fill=(32, 36, 48, 255), outline=m_color, width=1)
        draw.text((pill_x + 8, y + 72), m_text, fill=m_color, font=font_badge)
        pill_x += pw + 10
        
    return y + box_h + 46

curr_y = 75

# Msg 1: Argon
curr_y = draw_message(
    curr_y,
    "Argon",
    "👑 Principal Architect",
    (251, 191, 36, 255),
    "I have drafted and locked RFC-042: Database Sharding & Partition Routing. Architecture boundaries verified.\n@Freebuff please implement the connection pool in an isolated git worktree with full unit tests. @Pi handle lint and formatting.",
    [("@Freebuff", (56, 189, 248, 255)), ("@Pi", (148, 163, 184, 255))]
)

# Divider: Worktree branched
draw.line([(main_x + 48, curr_y - 10), (main_x + 1248, curr_y - 10)], fill=(40, 44, 58, 255), width=1)
draw.text((main_x + 500, curr_y - 18), "⚡ Worktree spawned: team/feat-sharding/impl", fill=(251, 191, 36, 220), font=font_badge)
curr_y += 12

# Msg 2: Freebuff
curr_y = draw_message(
    curr_y,
    "Freebuff",
    "🛠️ Senior Implementer",
    (56, 189, 248, 255),
    "Implementation complete on branch team/feat-sharding/impl. Added ShardConnectionPool.ts and partition schema router.\nAll 8 unit tests passed (100%). Handing off diff (+342 lines) to @Pi for formatting and docstrings.",
    [("@Pi", (148, 163, 184, 255)), ("@Argon", (251, 191, 36, 255))]
)

# Msg 3: Pi
curr_y = draw_message(
    curr_y,
    "Pi",
    "☕ The Intern",
    (148, 163, 184, 255),
    "Chore sprint complete! Executed 'vp fmt' across 6 files, added JSDoc annotations to ShardConnectionPool, fixed 0 lint warnings.\nTriggering automated security gate scan via @Snyk.",
    [("@Snyk", (74, 222, 128, 255))]
)

# Msg 4: Snyk
curr_y = draw_message(
    curr_y,
    "Snyk",
    "🛡️ Infosec Officer",
    (74, 222, 128, 255),
    "MCP Hub Security Audit Complete for branch team/feat-sharding/impl:\n✓ 0 high, 0 medium, 0 low vulnerabilities identified. First-party code certified secure. Handoff to @Argon for final stamp.",
    [("@Argon", (251, 191, 36, 255))],
    is_tool=True
)

# Msg 5: Argon
curr_y = draw_message(
    curr_y,
    "Argon",
    "👑 Principal Architect",
    (251, 191, 36, 255),
    "All criteria satisfied: RFC architecture compliant, tests passing, security audit certified by Snyk.\nPR #42 merged cleanly into main. Removing worktree branch.",
    [("@Team", (251, 191, 36, 255))]
)

# 4. Bottom Chat Composer Bar
comp_y = H - 90
draw.rectangle([(281, comp_y), (W, H)], fill=(18, 20, 26, 255))
draw.line([(281, comp_y), (W, comp_y)], fill=(34, 38, 48, 255), width=1)

# Input container
draw.rounded_rectangle([(310, comp_y + 14), (W - 30, comp_y + 64)], radius=10, fill=(24, 27, 36, 255), outline=(45, 50, 65, 255))

# Model picker trigger inside composer
draw.rounded_rectangle([(320, comp_y + 22), (540, comp_y + 56)], radius=6, fill=(32, 36, 48, 255), outline=(251, 191, 36, 90))
draw.text((330, comp_y + 30), "Argon (Claude Opus)", fill=(255, 255, 255, 255), font=font_bold)
draw.rounded_rectangle([(472, comp_y + 28), (532, comp_y + 50)], radius=8, fill=(251, 191, 36, 30), outline=(251, 191, 36, 120))
draw.text((478, comp_y + 33), "👑 Architect", fill=(251, 191, 36, 255), font=font_badge)

draw.text((560, comp_y + 30), "Message fleet... Use @Argon, @Freebuff, @Pi, or @Snyk to delegate", fill=(120, 130, 150, 255), font=font_regular)

out_file = "/Users/abc/.gemini/antigravity-cli/brain/763a8c21-dc0c-41ef-8db1-6212dbe09ce2/yudishtir_fleet_conversation_mockup.png"
img.save(out_file)
print("✓ Successfully saved high-res UI mockup to:", out_file)
