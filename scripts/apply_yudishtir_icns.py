import os
import shutil
import subprocess

repo_root = "/Users/abc/Desktop/yudishtir"
temp_dir = "/tmp/yudishtir-brand-gen"
master_png = os.path.join(temp_dir, "yudishtir-prod-1024.png")

# 1. Build icon.iconset
iconset_dir = os.path.join(temp_dir, "icon.iconset")
shutil.rmtree(iconset_dir, ignore_errors=True)
os.makedirs(iconset_dir, exist_ok=True)

sizes = [16, 32, 128, 256, 512]
for s in sizes:
    # 1x
    subprocess.run(["sips", "-z", str(s), str(s), master_png, "--out", os.path.join(iconset_dir, f"icon_{s}x{s}.png")], check=True)
    # 2x Retina
    s2 = s * 2
    subprocess.run(["sips", "-z", str(s2), str(s2), master_png, "--out", os.path.join(iconset_dir, f"icon_{s}x{s}@2x.png")], check=True)

# 2. Build icon.icns using iconutil
icns_path = os.path.join(temp_dir, "icon.icns")
if os.path.exists(icns_path):
    os.remove(icns_path)
subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_path], check=True)
print(f"✓ Generated true transparent macOS .icns: {icns_path}")

# 3. Distribute assets
targets = [
    # Assets
    os.path.join(repo_root, "assets/prod/black-macos-1024.png"),
    os.path.join(repo_root, "assets/prod/black-universal-1024.png"),
    os.path.join(repo_root, "assets/prod/black-ios-1024.png"),
    os.path.join(repo_root, "assets/dev/blueprint-macos-1024.png"),
]

for t in targets:
    shutil.copyfile(master_png, t)

# Desktop runtime ICNS
desktop_runtime = os.path.join(repo_root, "apps/desktop/.electron-runtime")
if os.path.exists(desktop_runtime):
    shutil.copyfile(icns_path, os.path.join(desktop_runtime, "icon-prod.icns"))
    shutil.copyfile(icns_path, os.path.join(desktop_runtime, "icon-dev.icns"))

    res_dir = os.path.join(desktop_runtime, "Yudishtir.app/Contents/Resources")
    if os.path.exists(res_dir):
        shutil.copyfile(icns_path, os.path.join(res_dir, "icon.icns"))
        shutil.copyfile(icns_path, os.path.join(res_dir, "electron.icns"))
        print("✓ Updated Yudishtir.app Resources icon.icns and electron.icns")

# Web public icons
web_public = os.path.join(repo_root, "apps/web/public")
if os.path.exists(web_public):
    subprocess.run(["sips", "-z", "512", "512", master_png, "--out", os.path.join(web_public, "icon-512x512.png")], check=True)
    subprocess.run(["sips", "-z", "192", "192", master_png, "--out", os.path.join(web_public, "icon-192x192.png")], check=True)
    subprocess.run(["sips", "-z", "180", "180", master_png, "--out", os.path.join(web_public, "apple-touch-icon.png")], check=True)
    subprocess.run(["sips", "-z", "32", "32", master_png, "--out", os.path.join(web_public, "favicon-32x32.png")], check=True)
    subprocess.run(["sips", "-z", "16", "16", master_png, "--out", os.path.join(web_public, "favicon-16x16.png")], check=True)
    shutil.copyfile(os.path.join(web_public, "favicon-32x32.png"), os.path.join(web_public, "favicon.ico"))
    print("✓ Updated web public icons (16, 32, 180, 192, 512)")

print("🎉 Complete! New transparent icon installed everywhere.")
