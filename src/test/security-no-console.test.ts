import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function checkDirForConsole(dirPath: string): string[] {
  const violations: string[] = [];
  if (!fs.existsSync(dirPath)) return violations;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      violations.push(...checkDirForConsole(fullPath));
    } else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.includes(".test.")
    ) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const consoleMatch = content.match(/console\.(log|debug|info|warn|error)/g);
      if (consoleMatch) {
        violations.push(`${fullPath}: found ${consoleMatch.join(", ")}`);
      }
    }
  }
  return violations;
}

describe("Security check: No console.* calls in telegram or session modules", () => {
  it("ensures zero console logging in lib/telegram", () => {
    const telegramDir = path.resolve(__dirname, "../lib/telegram");
    const violations = checkDirForConsole(telegramDir);
    expect(violations).toEqual([]);
  });

  it("ensures zero console logging in lib/session", () => {
    const sessionDir = path.resolve(__dirname, "../lib/session");
    const violations = checkDirForConsole(sessionDir);
    expect(violations).toEqual([]);
  });

  it("ensures zero console logging in components", () => {
    const componentsDir = path.resolve(__dirname, "../components");
    const violations = checkDirForConsole(componentsDir);
    expect(violations).toEqual([]);
  });
});
