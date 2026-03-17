#!/usr/bin/env node
/**
 * Called by semantic-release's @semantic-release/exec prepareCmd.
 * Usage: node scripts/prepare-release.mjs <version>
 *
 * - Updates system.json version and download URL
 * - Copies updated system.json into dist/
 * - Creates odd-rpg.zip from dist/ contents
 */

import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const version = process.argv[2];
if (!version) {
  console.error("Usage: prepare-release.mjs <version>");
  process.exit(1);
}

const repo = process.env.GITHUB_REPOSITORY ?? "Gtkall/odd-rpg";
const tagName = `v${version}`;
const downloadUrl = `https://github.com/${repo}/releases/download/${tagName}/odd-rpg.zip`;

// Update system.json
const systemJson = JSON.parse(readFileSync("system.json", "utf-8"));
systemJson.version = version;
systemJson.download = downloadUrl;
writeFileSync("system.json", JSON.stringify(systemJson, null, 2) + "\n");

// Publish updated system.json into the build output
copyFileSync("system.json", "dist/system.json");

// Package the build output
execSync("cd dist && zip -r ../odd-rpg.zip .", { stdio: "inherit" });

console.log(`✓ Prepared release ${tagName}`);
console.log(`  download: ${downloadUrl}`);
