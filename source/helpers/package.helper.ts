import { execSync } from "child_process";

export function isUpdateAvailable(): boolean {
  return getLatestVersion() !== getInstalledVersion();
}

export function getInstalledVersion(): string | undefined {
  return execSync(`npm ls -g gh-linear --depth=0`).toString().split("@").pop()?.trim();
}

export function getLatestVersion(): string {
  return execSync(`npm show gh-linear version`).toString()
}

export function updatePackage(): void {
  execSync(`npm i -g gh-linear &>/dev/null`);
}