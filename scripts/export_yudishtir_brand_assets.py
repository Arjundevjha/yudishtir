import os
import subprocess
from PIL import Image

src_png = "/tmp/yudishtir-brand-gen/yudishtir-crest-1024.png"
master = Image.open(src_png)

iconset_dir = "/tmp/yudishtir-brand-gen/yudishtir.iconset"
os.makedirs(iconset_dir, exist_ok=True)

iconset_specs = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024),
]

for filename, size in iconset_specs:
    resized = master.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(iconset_dir, filename), "PNG")

print("✓ Created iconset entries in", iconset_dir)

# Build .icns using iconutil
icns_path = "/tmp/yudishtir-brand-gen/icon.icns"
subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_path], check=True)
print("✓ Built Retina icns at", icns_path)

# Destination paths in Desktop and live application bundle
icns_dests = [
    "/Users/abc/Desktop/yudishtir/apps/desktop/.electron-runtime/icon-prod.icns",
    "/Users/abc/Desktop/yudishtir/apps/desktop/.electron-runtime/icon-dev.icns",
    "/Applications/Yudishtir.app/Contents/Resources/icon.icns",
]

for dest in icns_dests:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(icns_path, "rb") as f_in, open(dest, "wb") as f_out:
        f_out.write(f_in.read())
    print("  -> Updated:", dest)

# Export Web & PWA assets
web_public = "/Users/abc/Desktop/yudishtir/apps/web/public"
app_targets = [
    (os.path.join(web_public, "icon-512x512.png"), 512),
    (os.path.join(web_public, "icon-192x192.png"), 192),
    (os.path.join(web_public, "apple-touch-icon.png"), 180),
    (os.path.join(web_public, "favicon-32x32.png"), 32),
    (os.path.join(web_public, "favicon-16x16.png"), 16),
]

for out_file, size in app_targets:
    resized = master.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(out_file, "PNG")
    print("  -> Saved web icon:", out_file)

# Export favicon.ico
ico_path = os.path.join(web_public, "favicon.ico")
master.resize((48, 48), Image.Resampling.LANCZOS).save(
    ico_path,
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)
print("  -> Saved multi-size ICO:", ico_path)

print("✓ All brand assets successfully exported!")
