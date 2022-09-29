import { execSync } from "child_process";
import { getTicketType } from './linear.helper';
import { LinearTicket } from '../shared/types';

export function checkIfRemoteBranchExists(branchName?: string): boolean {
  if (!branchName) return false;
  return execSync(`git ls-remote origin ${branchName}`).toString() !== "";
}

/**
 * Checks if the current path contains a git repository.
 */
export function gitCheckIfGitRepo(): boolean {
  if (execSync('git -C . rev-parse 2>/dev/null; echo $?').toString().trim() === "0") {
    return true;
  } else {
    return false;
  }
}

/**
 * Checks-out the given branch name
 * @param branchName - Branch to check out.
 * @param create     - Whether the branch should be newly created.
 */
export function gitCheckoutBranch(branchName?: string, create = false): void {
  if (!branchName) return;
  execSync(`git checkout ${create ? "-b " : ""}${branchName} &>/dev/null`);
}

/**
 * Checks if there are changes in the repository.
 */
export function gitCheckForChanges(): boolean {
  return !execSync(`git status`).toString().includes("working tree clean");
}

/**
 * Stashes all current changes
 */
export function gitStash(): void {
  execSync(`git stash &>/dev/null`);
}

/**
 * Creates an empty commit based on the ticket parameters.
 * @param ticket - The current ticket to be worked on.
 */
export function gitCreateEmptyCommit(ticket: LinearTicket, preserveChanges = false): void {
  const hasChanges = gitCheckForChanges();

  if (preserveChanges && hasChanges) {
    gitStash();
  }
  execSync(`git commit --allow-empty -m "${getTicketType(ticket)}(${ticket.team.key}-${ticket.number}): ${ticket.title.toLowerCase()}" &>/dev/null`);
  if (preserveChanges && hasChanges) {
    gitApplyAndDropStash();
  }
}

/**
 * Applies the previously created stash and drops it.
 */
export function gitApplyAndDropStash(): void {
  execSync(`git stash apply --index &>/dev/null`);
  execSync(`git stash drop stash@{0} &>/dev/null`);
}

/**
 * Publishes the git branch to the remote repository
 * @param branchName - The branch to publish.
 */
export function gitPublishBranch(branchName?: string): void {
  if (!branchName) return;
  execSync(`git push --set-upstream origin ${branchName} &>/dev/null`);
}

/**
 * Creates a pr for the ticket
 * @param ticket - The ticket to create the pr for.
 */
export function gitCreatePr(ticket: LinearTicket): void {
  execSync(`gh pr create --title "${getTicketType(ticket)}(${ticket.team.key}-${ticket.number}): ${ticket.title}" -d -b "" &>/dev/null`);
}

/**
 * Returns the current branch.
 */
export function gitGetCurrentBranch(): string {
  return execSync(`git rev-parse --abbrev-ref HEAD`).toString();
}

/**
 * Readies a PR.
 */
export function gitReadyPR(): void {
  const noPr = execSync(`gh pr view`).toString().includes("no pull requests found for branch");
  if (noPr) {
    console.log("There is no PR associated with this branch")
    return;
  }
  execSync(`gh pr ready`);
}

/**
 * Starts codeReview on a PR.
 */
export function gitStartCodeReview(reviewers: string[]): void {
  execSync(`gh pr edit ${reviewers.map(t => `--add-reviewer=${t}`).join(" ")}`);
}

/**
 * Removes codeReviewers from a PR.
 */
export function gitRemoveReviewers(reviewers: string[]): void {
  execSync(`gh pr edit ${reviewers.map(t => `--remove-reviewer=${t}`).join(" ")}`);
}

/**
 * Opens the PR related to the current branch on remote.
 */
export function gitOpenWebView(): void {
  execSync("gh pr view -w");
}