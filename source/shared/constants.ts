export const labelMapping = {
  Refactor: "refactor",
  Bug: "fix",
  Feature: "feat",
  Improvement: "chore",
  Performance: "perf",
  Testing: "test",
  Documentation: "docs"
} as const;

export const configFilePath = "~/.gh/linear/config.yaml";

export const gitBranchCreateSteps = {
  check: "Check if branch exists...",
  create: "Creating and switching to branch...",
  switch: "Switching to branch...",
  push: "Pushing branch...",
  draft: "Creating a Draft PR...",
  success: "Branch created successfully! You can start working now",
} as const;
