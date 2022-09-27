import { Arguments } from './types';
import { parse } from 'ts-command-line-args';

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

export const ARGS = parse<Arguments>(
  {
    ticket: { type: String, alias: 't', optional: true, description: 'Directly start working on a ticket (ex lh -t SPR-12)' },
    search: { type: String, alias: 's', optional: true, description: 'Search for tickets' },
    "add-reviewer": { type: String, optional: true, multiple: true, description: 'Add reviewers - adds them as default if only flag' },
    "remove-reviewer": { type: String, optional: true, multiple: true, description: 'Remove reviewers - adds them from default if only flag' },
    i: { type: Boolean, optional: true, alias: 'i', description: 'Show only my tickets' },
    ready: { type: Boolean, optional: true, alias: 'r', description: 'Mark related PR as ready for review' },
    "code-review": { type: Boolean, optional: true, alias: 'c', description: 'Start codereview by assigning default reviewers or passed ones' },
    "merge": { type: Boolean, optional: true, alias: 'm', description: 'Merge the related pr' },
    help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    version: { type: Boolean, optional: true, alias: 'v', description: 'Prints the version of this package' },
    update: { type: Boolean, optional: true, alias: 'u', description: 'Updates to the latest version' },
  },
  {
    helpArg: 'help',
    headerContentSections: [{ header: 'Linhub', content: 'Thanks for using Linhub' }],
    footerContentSections: [{ header: 'Legal', content: `Copyright: THE ARC GmbH` }],
  },
);