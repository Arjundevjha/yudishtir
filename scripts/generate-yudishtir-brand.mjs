import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeChildProcess from "node:child_process";

const repoRoot = "/Users/abc/Desktop/yudishtir";
const tempDir = "/tmp/yudishtir-brand-gen";
NodeFS.mkdirSync(tempDir, { recursive: true });

// Generate majestic 1024x1024 SVG for Yudishtir
function buildYudishtirSvg({ isDev = false } = {}) {
  const outerBorderColor = isDev ? "#38bdf8" : "#fbbf24";
  const glowColor = isDev ? "#0284c7" : "#d97706";
  const accentLight = isDev ? "#e0f2fe" : "#fef08a";
  const accentGold = isDev ? "#38bdf8" : "#fbbf24";
  const accentDark = isDev ? "#0369a1" : "#b45309";
  const coreBg = isDev ? "#032030" : "#120f06";

  // Calculate 12 spokes points on circle
  const cx = 512;
  const cy = 512;
  const outerR = 290;
  const innerR = 125;
  const spokes = [];
  const beads = [];

  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy + outerR * Math.sin(angle);
    // Outer node orbs representing the agent fleet
    const orbX = cx + (outerR + 32) * Math.cos(angle);
    const orbY = cy + (outerR + 32) * Math.sin(angle);
    spokes.push({ x1, y1, x2, y2, orbX, orbY, angle });
  }

  // 24 decorative rim teeth
  for (let i = 0; i < 24; i++) {
    const angle = (i * 15 * Math.PI) / 180;
    const bx = cx + (outerR + 14) * Math.cos(angle);
    const by = cy + (outerR + 14) * Math.sin(angle);
    beads.push({ bx, by });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#1e2029" />
      <stop offset="55%" stop-color="#0e1017" />
      <stop offset="100%" stop-color="#06070a" />
    </radialGradient>

    <!-- Celestial Aura Glow -->
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.45" />
      <stop offset="50%" stop-color="${glowColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0" />
    </radialGradient>

    <!-- Metallic Gold Shading -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentLight}" />
      <stop offset="30%" stop-color="${accentGold}" />
      <stop offset="70%" stop-color="${accentDark}" />
      <stop offset="100%" stop-color="${accentLight}" />
    </linearGradient>

    <linearGradient id="coreGold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentDark}" />
      <stop offset="50%" stop-color="${accentGold}" />
      <stop offset="100%" stop-color="${accentLight}" />
    </linearGradient>

    <!-- Squircle Clip for macOS Icon -->
    <clipPath id="squircle">
      <rect x="64" y="64" width="896" height="896" rx="200" ry="200" />
    </clipPath>

    <!-- Filter for subtle drop shadow -->
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${outerBorderColor}" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- macOS App Icon Squircle Canvas -->
  <g clip-path="url(#squircle)">
    <!-- Dark Obsidian Canvas -->
    <rect x="64" y="64" width="896" height="896" fill="url(#bgGrad)" />

    <!-- Subtle Bevel Border -->
    <rect x="64" y="64" width="896" height="896" rx="200" ry="200" fill="none" stroke="${outerBorderColor}" stroke-width="3" stroke-opacity="0.25" />

    <!-- Celestial Golden Aura Behind Chakra -->
    <circle cx="512" cy="512" r="420" fill="url(#auraGlow)" />

    <!-- Ambient Grid Ring Coordinates -->
    <circle cx="512" cy="512" r="370" fill="none" stroke="${outerBorderColor}" stroke-width="1.5" stroke-dasharray="4 8" stroke-opacity="0.3" />

    <!-- ================= DHARMACHAKRA OF YUDISHTIR ================= -->
    <g filter="url(#dropShadow)">
      <!-- Outer Rim (Double Ring) -->
      <circle cx="512" cy="512" r="290" fill="none" stroke="url(#goldGrad)" stroke-width="14" />
      <circle cx="512" cy="512" r="268" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.6" />
      <circle cx="512" cy="512" r="306" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.5" />

      <!-- 24 Rim Virtues / Beads -->
      ${beads
        .map(
          (b) =>
            `<circle cx="${b.bx.toFixed(2)}" cy="${b.by.toFixed(2)}" r="4.5" fill="url(#goldGrad)" />`,
        )
        .join("\n      ")}

      <!-- 12 Majestic Spokes -->
      ${spokes
        .map((s) => {
          // Double tapered spoke path
          const normalAngle = s.angle + Math.PI / 2;
          const w1 = 7;
          const w2 = 12;
          const nx = Math.cos(normalAngle);
          const ny = Math.sin(normalAngle);
          const p1x = s.x1 + nx * w1;
          const p1y = s.y1 + ny * w1;
          const p2x = s.x2 + nx * w2;
          const p2y = s.y2 + ny * w2;
          const p3x = s.x2 - nx * w2;
          const p3y = s.y2 - ny * w2;
          const p4x = s.x1 - nx * w1;
          const p4y = s.y1 - ny * w1;
          return `
      <!-- Spoke -->
      <polygon points="${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)} ${p4x.toFixed(1)},${p4y.toFixed(1)}" fill="url(#goldGrad)" opacity="0.9" />
      <!-- Central Spine Line -->
      <line x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${accentLight}" stroke-width="2" opacity="0.8" />
      <!-- Agent Fleet Orb Node at Outer Rim -->
      <circle cx="${s.orbX.toFixed(1)}" cy="${s.orbY.toFixed(1)}" r="10" fill="url(#goldGrad)" filter="url(#goldShine)" />
      <circle cx="${s.orbX.toFixed(1)}" cy="${s.orbY.toFixed(1)}" r="4" fill="#ffffff" />
      `;
        })
        .join("\n      ")}

      <!-- Inner Concentric Hub Rings -->
      <circle cx="512" cy="512" r="125" fill="${coreBg}" stroke="url(#goldGrad)" stroke-width="10" />
      <circle cx="512" cy="512" r="108" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-dasharray="6 4" stroke-opacity="0.8" />

      <!-- Central Sovereign Emblem: Royal Crown & Vel Spearhead of Truth -->
      <!-- Lotus Pedestal Base -->
      <path d="M 462 555 C 485 570, 539 570, 562 555 C 550 565, 474 565, 462 555 Z" fill="url(#goldGrad)" />
      
      <!-- Crown / Spear Trident Silhouette -->
      <!-- Center Spear Tip (Highest) -->
      <polygon points="512,442 528,495 512,548 496,495" fill="url(#goldGrad)" filter="url(#goldShine)" />
      <!-- Left Petal / Wing -->
      <polygon points="480,470 500,505 488,542 472,510" fill="url(#goldGrad)" />
      <!-- Right Petal / Wing -->
      <polygon points="544,470 552,510 536,542 524,505" fill="url(#goldGrad)" />

      <!-- Center Diamond of Absolute Truth (Satya) -->
      <polygon points="512,488 522,502 512,516 502,502" fill="#ffffff" />
    </g>

    <!-- Bottom Inscription: Dharmic Sovereign Monogram Accent -->
    <text x="512" y="870" text-anchor="middle" font-family="-apple-system, system-ui, BlinkMacSystemFont, 'Inter', sans-serif" font-size="28" font-weight="900" letter-spacing="8" fill="${outerBorderColor}" fill-opacity="0.9">YUDISHTIR</text>
  </g>
</svg>
`;
}

// Write master SVGs
const prodSvgPath = NodePath.join(tempDir, "yudishtir-prod.svg");
const devSvgPath = NodePath.join(tempDir, "yudishtir-dev.svg");

NodeFS.writeFileSync(prodSvgPath, buildYudishtirSvg({ isDev: false }));
NodeFS.writeFileSync(devSvgPath, buildYudishtirSvg({ isDev: true }));

console.log("✓ Generated Yudishtir SVGs in " + tempDir);

// Convert SVG to 1024x1024 PNG using qlmanage
function renderPng(svgPath, outPngPath) {
  NodeChildProcess.spawnSync("qlmanage", ["-t", "-s", "1024", "-o", tempDir, svgPath], {
    stdio: "inherit",
  });
  const generatedThumb = `${svgPath}.png`;
  if (NodeFS.existsSync(generatedThumb)) {
    NodeFS.copyFileSync(generatedThumb, outPngPath);
    console.log(`✓ Rendered 1024x1024 PNG: ${outPngPath}`);
    return true;
  }
  throw new Error(`Failed to generate PNG for ${svgPath}`);
}

const prodPngPath = NodePath.join(tempDir, "yudishtir-prod-1024.png");
const devPngPath = NodePath.join(tempDir, "yudishtir-dev-1024.png");

renderPng(prodSvgPath, prodPngPath);
renderPng(devSvgPath, devPngPath);

// Generate macOS .icns file
function makeIcns(pngPath, outIcnsPath) {
  const iconsetDir = NodePath.join(tempDir, "icon.iconset");
  NodeFS.rmSync(iconsetDir, { recursive: true, force: true });
  NodeFS.mkdirSync(iconsetDir, { recursive: true });

  const sizes = [16, 32, 128, 256, 512];
  for (const size of sizes) {
    // 1x
    NodeChildProcess.spawnSync("sips", [
      "-z",
      String(size),
      String(size),
      pngPath,
      "--out",
      NodePath.join(iconsetDir, `icon_${size}x${size}.png`),
    ]);
    // 2x Retina
    const retinaSize = size * 2;
    NodeChildProcess.spawnSync("sips", [
      "-z",
      String(retinaSize),
      String(retinaSize),
      pngPath,
      "--out",
      NodePath.join(iconsetDir, `icon_${size}x${size}@2x.png`),
    ]);
  }

  NodeChildProcess.spawnSync("iconutil", ["-c", "icns", iconsetDir, "-o", outIcnsPath], {
    stdio: "inherit",
  });
  console.log(`✓ Generated ICNS: ${outIcnsPath}`);
}

const prodIcnsPath = NodePath.join(tempDir, "icon-prod.icns");
const devIcnsPath = NodePath.join(tempDir, "icon-dev.icns");

makeIcns(prodPngPath, prodIcnsPath);
makeIcns(devPngPath, devIcnsPath);

// Distribute to all project locations
console.log("Distributing brand assets across Yudishtir codebase...");

// 1. Assets directory
NodeFS.copyFileSync(prodPngPath, NodePath.join(repoRoot, "assets/prod/black-macos-1024.png"));
NodeFS.copyFileSync(prodPngPath, NodePath.join(repoRoot, "assets/prod/black-universal-1024.png"));
NodeFS.copyFileSync(prodPngPath, NodePath.join(repoRoot, "assets/prod/black-ios-1024.png"));
NodeFS.copyFileSync(devPngPath, NodePath.join(repoRoot, "assets/dev/blueprint-macos-1024.png"));
NodeFS.copyFileSync(devPngPath, NodePath.join(repoRoot, "assets/dev/blueprint-universal-1024.png"));

// 2. Desktop runtime ICNS
const desktopRuntimeDir = NodePath.join(repoRoot, "apps/desktop/.electron-runtime");
if (NodeFS.existsSync(desktopRuntimeDir)) {
  NodeFS.copyFileSync(prodIcnsPath, NodePath.join(desktopRuntimeDir, "icon-prod.icns"));
  NodeFS.copyFileSync(devIcnsPath, NodePath.join(desktopRuntimeDir, "icon-dev.icns"));

  const appResourcesDir = NodePath.join(desktopRuntimeDir, "Yudishtir.app/Contents/Resources");
  if (NodeFS.existsSync(appResourcesDir)) {
    NodeFS.copyFileSync(prodIcnsPath, NodePath.join(appResourcesDir, "icon.icns"));
    NodeFS.copyFileSync(prodIcnsPath, NodePath.join(appResourcesDir, "electron.icns"));
  }
}

// 3. Web public icons
const webPublic = NodePath.join(repoRoot, "apps/web/public");
if (NodeFS.existsSync(webPublic)) {
  // 512
  NodeChildProcess.spawnSync("sips", [
    "-z",
    "512",
    "512",
    prodPngPath,
    "--out",
    NodePath.join(webPublic, "icon-512x512.png"),
  ]);
  // 192
  NodeChildProcess.spawnSync("sips", [
    "-z",
    "192",
    "192",
    prodPngPath,
    "--out",
    NodePath.join(webPublic, "icon-192x192.png"),
  ]);
  // 180 (Apple Touch Icon)
  NodeChildProcess.spawnSync("sips", [
    "-z",
    "180",
    "180",
    prodPngPath,
    "--out",
    NodePath.join(webPublic, "apple-touch-icon.png"),
  ]);
  // 32
  NodeChildProcess.spawnSync("sips", [
    "-z",
    "32",
    "32",
    prodPngPath,
    "--out",
    NodePath.join(webPublic, "favicon-32x32.png"),
  ]);
  // 16
  NodeChildProcess.spawnSync("sips", [
    "-z",
    "16",
    "16",
    prodPngPath,
    "--out",
    NodePath.join(webPublic, "favicon-16x16.png"),
  ]);
  // copy 32x32 as favicon.ico
  NodeFS.copyFileSync(
    NodePath.join(webPublic, "favicon-32x32.png"),
    NodePath.join(webPublic, "favicon.ico"),
  );
  console.log("✓ Updated all web icons in apps/web/public/");
}

console.log("🎉 All Yudishtir brand assets generated and installed successfully!");
