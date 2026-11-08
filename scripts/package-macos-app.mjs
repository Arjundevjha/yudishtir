#!/usr/bin/env node

/** Builds and installs standalone macOS bundle /Applications/Yudishtir.app. */

import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeChildProcess from "node:child_process";
import * as NodeURL from "node:url";

const __dirname = NodePath.dirname(NodeURL.fileURLToPath(import.meta.url));
const repoRoot = NodePath.resolve(__dirname, "..");
const desktopDir = NodePath.join(repoRoot, "apps", "desktop");

const SOURCE_ELECTRON_APP = NodePath.join(
  repoRoot,
  "node_modules",
  ".pnpm",
  "electron@44.10.1_supports-color@8.1.1",
  "node_modules",
  "electron",
  "dist",
  "Electron.app",
);

const TARGET_APP_PATH = "/Applications/Yudishtir.app";
const APP_NAME = "Yudishtir";
const BUNDLE_ID = "com.yudishtir.desktop";
const APP_VERSION = "1.0.0";

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const res = NodeChildProcess.spawnSync(cmd, args, { stdio: "inherit", encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${res.status})`);
  }
}

function setPlist(plistPath, key, val, type = "string") {
  const flag = type === "json" ? "-json" : "-string";
  const argVal = type === "json" ? JSON.stringify(val) : String(val);
  const r1 = NodeChildProcess.spawnSync("plutil", ["-replace", key, flag, argVal, plistPath]);
  if (r1.status !== 0) {
    const r2 = NodeChildProcess.spawnSync("plutil", ["-insert", key, flag, argVal, plistPath]);
    if (r2.status !== 0) {
      throw new Error(`Failed to set plist key ${key} at ${plistPath}`);
    }
  }
}

console.log("=========================================");
console.log("  Packaging Real macOS App: Yudishtir   ");
console.log("=========================================");

if (!NodeFS.existsSync(SOURCE_ELECTRON_APP)) {
  throw new Error(`Source Electron.app not found at: ${SOURCE_ELECTRON_APP}`);
}

// 1. Remove existing /Applications/Yudishtir.app (whether symlink or dir)
if (NodeFS.existsSync(TARGET_APP_PATH)) {
  console.log(`Removing previous ${TARGET_APP_PATH}...`);
  NodeFS.rmSync(TARGET_APP_PATH, { recursive: true, force: true });
}

// 2. Copy pristine Electron.app to /Applications/Yudishtir.app
console.log(`Copying base application bundle...`);
run("cp", ["-R", SOURCE_ELECTRON_APP, TARGET_APP_PATH]);

const contentsDir = NodePath.join(TARGET_APP_PATH, "Contents");
const macosDir = NodePath.join(contentsDir, "MacOS");
const frameworksDir = NodePath.join(contentsDir, "Frameworks");
const resourcesDir = NodePath.join(contentsDir, "Resources");

// 3. Rename main executable from Electron -> Yudishtir
console.log("Renaming main binary to Yudishtir...");
const oldBinary = NodePath.join(macosDir, "Electron");
const newBinary = NodePath.join(macosDir, APP_NAME);
if (NodeFS.existsSync(oldBinary)) {
  NodeFS.renameSync(oldBinary, newBinary);
}

// 4. Update Main Info.plist
console.log("Configuring main Info.plist...");
const mainPlist = NodePath.join(contentsDir, "Info.plist");
setPlist(mainPlist, "CFBundleName", APP_NAME);
setPlist(mainPlist, "CFBundleDisplayName", APP_NAME);
setPlist(mainPlist, "CFBundleExecutable", APP_NAME);
setPlist(mainPlist, "CFBundleIdentifier", BUNDLE_ID);
setPlist(mainPlist, "CFBundleIconFile", "icon.icns");
setPlist(mainPlist, "CFBundleShortVersionString", APP_VERSION);
setPlist(mainPlist, "CFBundleVersion", APP_VERSION);
setPlist(mainPlist, "NSHumanReadableCopyright", "Copyright © 2026 Yudishtir. All rights reserved.");
setPlist(
  mainPlist,
  "NSDocumentsFolderUsageDescription",
  "Yudishtir reads project files you open in the desktop app.",
);
setPlist(
  mainPlist,
  "NSScreenCaptureUsageDescription",
  "Yudishtir captures the active window when you use the snapshot shortcut.",
);
setPlist(
  mainPlist,
  "NSCameraUsageDescription",
  "Yudishtir lets commands run by coding agents use the camera.",
);
setPlist(
  mainPlist,
  "NSMicrophoneUsageDescription",
  "Yudishtir lets commands run by coding agents use the microphone.",
);
setPlist(
  mainPlist,
  "CFBundleURLTypes",
  [
    {
      CFBundleURLName: BUNDLE_ID,
      CFBundleURLSchemes: ["yudishtir", "t3code"],
    },
  ],
  "json",
);

// 5. Rename Helper Apps & Binaries & Plists
console.log("Customizing helper apps and processes...");
const helpers = [
  {
    oldApp: "Electron Helper.app",
    newApp: `${APP_NAME} Helper.app`,
    suffix: "helper",
    name: `${APP_NAME} Helper`,
  },
  {
    oldApp: "Electron Helper (GPU).app",
    newApp: `${APP_NAME} Helper (GPU).app`,
    suffix: "helper.gpu",
    name: `${APP_NAME} Helper (GPU)`,
  },
  {
    oldApp: "Electron Helper (Plugin).app",
    newApp: `${APP_NAME} Helper (Plugin).app`,
    suffix: "helper.plugin",
    name: `${APP_NAME} Helper (Plugin)`,
  },
  {
    oldApp: "Electron Helper (Renderer).app",
    newApp: `${APP_NAME} Helper (Renderer).app`,
    suffix: "helper.renderer",
    name: `${APP_NAME} Helper (Renderer)`,
  },
];

for (const h of helpers) {
  const oldAppPath = NodePath.join(frameworksDir, h.oldApp);
  const newAppPath = NodePath.join(frameworksDir, h.newApp);
  if (NodeFS.existsSync(oldAppPath)) {
    NodeFS.renameSync(oldAppPath, newAppPath);
  }

  const helperContents = NodePath.join(newAppPath, "Contents");
  const helperMacOS = NodePath.join(helperContents, "MacOS");
  const helperPlist = NodePath.join(helperContents, "Info.plist");

  // Rename helper binary
  const oldHelperBin = NodePath.join(helperMacOS, h.oldApp.replace(".app", ""));
  const newHelperBin = NodePath.join(helperMacOS, h.name);
  if (NodeFS.existsSync(oldHelperBin)) {
    NodeFS.renameSync(oldHelperBin, newHelperBin);
  }

  // Update helper Info.plist
  if (NodeFS.existsSync(helperPlist)) {
    setPlist(helperPlist, "CFBundleName", h.name);
    setPlist(helperPlist, "CFBundleDisplayName", h.name);
    setPlist(helperPlist, "CFBundleExecutable", h.name);
    setPlist(helperPlist, "CFBundleIdentifier", `${BUNDLE_ID}.${h.suffix}`);
  }
}

// 6. Copy Custom Master Retina Icon
console.log("Installing master Retina Dharmachakra icon...");
const iconSource = NodePath.join(desktopDir, ".electron-runtime", "icon-prod.icns");
if (NodeFS.existsSync(iconSource)) {
  NodeFS.copyFileSync(iconSource, NodePath.join(resourcesDir, "icon.icns"));
  NodeFS.copyFileSync(iconSource, NodePath.join(resourcesDir, "electron.icns"));
}

// 7. Remove default_app.asar
const defaultAppAsar = NodePath.join(resourcesDir, "default_app.asar");
if (NodeFS.existsSync(defaultAppAsar)) {
  NodeFS.rmSync(defaultAppAsar, { force: true });
}

// 8. Stage Application Resources inside Contents/Resources/app (NO symlinks)
console.log("Staging app runtime resources without external symlinks...");
const appDir = NodePath.join(resourcesDir, "app");
NodeFS.mkdirSync(appDir, { recursive: true });

// Copy compiled desktop electron dist
console.log("Staging desktop runtime bundle (dist-electron)...");
const targetDistElectron = NodePath.join(appDir, "dist-electron");
if (NodeFS.existsSync(targetDistElectron)) {
  NodeFS.rmSync(targetDistElectron, { recursive: true, force: true });
}
run("cp", ["-R", NodePath.join(desktopDir, "dist-electron"), targetDistElectron]);

// Copy compiled server dist (including client web assets)
console.log("Staging server runtime and client web assets...");
const targetServerApps = NodePath.join(appDir, "apps", "server");
NodeFS.mkdirSync(targetServerApps, { recursive: true });
const targetServerDist = NodePath.join(targetServerApps, "dist");
if (NodeFS.existsSync(targetServerDist)) {
  NodeFS.rmSync(targetServerDist, { recursive: true, force: true });
}
run("cp", ["-R", NodePath.join(repoRoot, "apps", "server", "dist"), targetServerDist]);

// 8b. Stage Self-Contained Native Node Modules (dereferenced, zero external Desktop symlinks)
console.log("Staging self-contained native node modules...");
const appNodeModules = NodePath.join(appDir, "node_modules");
NodeFS.mkdirSync(appNodeModules, { recursive: true });

const pnpmDir = NodePath.join(repoRoot, "node_modules", ".pnpm");
const nativePackages = [
  {
    name: "@ff-labs/fff-node",
    src: NodePath.join(repoRoot, "apps/server/node_modules/@ff-labs/fff-node"),
  },
  {
    name: "@ff-labs/fff-bin-darwin-arm64",
    src: NodePath.join(
      pnpmDir,
      "@ff-labs+fff-bin-darwin-arm64@0.11.0/node_modules/@ff-labs/fff-bin-darwin-arm64",
    ),
  },
  { name: "ffi-rs", src: NodePath.join(repoRoot, "apps/server/node_modules/ffi-rs") },
  {
    name: "@yuuang/ffi-rs-darwin-arm64",
    src: NodePath.join(
      pnpmDir,
      "@yuuang+ffi-rs-darwin-arm64@1.3.2/node_modules/@yuuang/ffi-rs-darwin-arm64",
    ),
  },
  { name: "node-pty", src: NodePath.join(repoRoot, "apps/server/node_modules/node-pty") },
  {
    name: "@napi-rs/keyring",
    src: NodePath.join(repoRoot, "apps/server/node_modules/@napi-rs/keyring"),
  },
  {
    name: "@napi-rs/keyring-darwin-arm64",
    src: NodePath.join(
      pnpmDir,
      "@napi-rs+keyring-darwin-arm64@1.3.0/node_modules/@napi-rs/keyring-darwin-arm64",
    ),
  },
  {
    name: "@clerk/electron-passkeys",
    src: NodePath.join(repoRoot, "apps/desktop/node_modules/@clerk/electron-passkeys"),
  },
  {
    name: "@clerk/electron-passkeys-darwin-arm64",
    src: NodePath.join(
      pnpmDir,
      "@clerk+electron-passkeys-darwin-arm64@0.0.3/node_modules/@clerk/electron-passkeys-darwin-arm64",
    ),
  },
  {
    name: "transcribe-cpp",
    src: NodePath.join(repoRoot, "apps/server/node_modules/transcribe-cpp"),
  },
  {
    name: "@transcribe-cpp/darwin-arm64-metal",
    src: NodePath.join(
      pnpmDir,
      "@transcribe-cpp+darwin-arm64-metal@0.4.1/node_modules/@transcribe-cpp/darwin-arm64-metal",
    ),
  },
];

for (const pkg of nativePackages) {
  const destDir = NodePath.join(appNodeModules, pkg.name);
  NodeFS.mkdirSync(NodePath.dirname(destDir), { recursive: true });
  if (NodeFS.existsSync(destDir)) {
    NodeFS.rmSync(destDir, { recursive: true, force: true });
  }
  run("cp", ["-R", "-L", pkg.src, destDir]);
}

// Stage keyring & passkey binaries beside index.js for reliable local loading
const keyringBin = NodePath.join(
  appNodeModules,
  "@napi-rs/keyring-darwin-arm64/keyring.darwin-arm64.node",
);
if (NodeFS.existsSync(keyringBin)) {
  NodeFS.copyFileSync(
    keyringBin,
    NodePath.join(appNodeModules, "@napi-rs/keyring/keyring.darwin-arm64.node"),
  );
}
const passkeyBin = NodePath.join(
  appNodeModules,
  "@clerk/electron-passkeys-darwin-arm64/electron-passkeys.darwin-arm64.node",
);
if (NodeFS.existsSync(passkeyBin)) {
  NodeFS.copyFileSync(
    passkeyBin,
    NodePath.join(appNodeModules, "@clerk/electron-passkeys/electron-passkeys.darwin-arm64.node"),
  );
}

// Ensure apps/server/node_modules is an internal relative symlink to app/node_modules
const serverNodeModules = NodePath.join(targetServerApps, "node_modules");
if (NodeFS.existsSync(serverNodeModules)) {
  NodeFS.rmSync(serverNodeModules, { recursive: true, force: true });
}
NodeFS.symlinkSync("../../node_modules", serverNodeModules);

// Write app package.json
const appPkg = {
  name: "yudishtir",
  productName: "Yudishtir",
  version: APP_VERSION,
  main: "launcher.cjs",
};
NodeFS.writeFileSync(NodePath.join(appDir, "package.json"), JSON.stringify(appPkg, null, 2));

// Write launcher.cjs (clean JavaScript loader)
const launcherScript = `// Yudishtir Native macOS Loader
const path = require("node:path");
const fs = require("node:fs");

// Ensure full user environment and tool PATHs
const home = process.env.HOME || "/Users/abc";
const extraPaths = [
  path.join(home, ".local", "bin"),
  path.join(home, ".gemini", "bin"),
  path.join(home, ".opencode", "bin"),
  "/opt/homebrew/bin",
  "/usr/local/bin",
  "/usr/bin",
  "/bin",
  "/usr/sbin",
  "/sbin"
];
process.env.PATH = extraPaths.concat(process.env.PATH ? process.env.PATH.split(":") : []).join(":");

// Configure self-contained NODE_PATH for server module resolution
const stagedModules = path.join(__dirname, "node_modules");
const serverModules = path.join(__dirname, "apps", "server", "node_modules");
const nodePaths = [
  stagedModules,
  serverModules,
  process.env.NODE_PATH
].filter(Boolean);
process.env.NODE_PATH = nodePaths.join(":");

process.env.T3CODE_HOME = process.env.T3CODE_HOME || path.join(home, ".yudishtir");
process.env.YUDISHTIR_HOME = process.env.YUDISHTIR_HOME || path.join(home, ".yudishtir");

const bootEntry = path.join(__dirname, "dist-electron", "boot.cjs");
if (!fs.existsSync(bootEntry)) {
  console.error("Yudishtir boot entry not found at: " + bootEntry);
  process.exit(1);
}

require(bootEntry);
`;
NodeFS.writeFileSync(NodePath.join(appDir, "launcher.cjs"), launcherScript);

// 9. Clear quarantine attributes
console.log("Clearing quarantine attributes...");
run("xattr", ["-cr", TARGET_APP_PATH]);

// 10. Deep ad-hoc codesign
console.log("Codesigning bundle recursively...");
run("codesign", ["--force", "--deep", "--sign", "-", "--timestamp=none", TARGET_APP_PATH]);

// 11. Verify codesign
console.log("Verifying signature...");
run("codesign", ["--verify", "--deep", "--strict", TARGET_APP_PATH]);

// 12. Register with LaunchServices
console.log("Registering with macOS LaunchServices...");
run(
  "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister",
  ["-f", "-R", TARGET_APP_PATH],
);

// 13. Clear Dock icon cache
console.log("Refreshing Dock...");
NodeChildProcess.spawnSync("killall", ["Dock"]);

console.log("\n========================================================");
console.log("  SUCCESS: Yudishtir is installed as a genuine Mac app!  ");
console.log(`  Location: ${TARGET_APP_PATH}`);
console.log("========================================================");
