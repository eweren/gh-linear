import { execSync } from "child_process";
import Linear from './linear.helper';
import { LinearTicket } from '../shared/types';

export default class Git {

  public static checkIfRemoteBranchExists(branchName?: string): boolean {
    if (!branchName) return false;
    return execSync(`git ls-remote origin ${branchName}`).toString() !== "";
  }

  /**
   * Checks if the current path contains a git repository.
   */
  public static checkIfGitRepo(): boolean {
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
  public static checkoutBranch(branchName?: string, create = false): void {
    if (!branchName) return;
    execSync(`git checkout ${create ? "-b " : ""}${branchName} &>/dev/null`);
  }

  /**
   * Checks if there are changes in the repository.
   */
  private static hasChanges(): boolean {
    return !execSync(`git status`).toString().includes("working tree clean");
  }

  /**
   * Stashes all current changes
   */
  private static stash(): void {
    execSync(`git stash &>/dev/null`);
  }

  /**
   * Applies the previously created stash and drops it.
   */
  private static applyAndDropStash(): void {
    execSync(`git stash apply --index &>/dev/null`);
    execSync(`git stash drop stash@{0} &>/dev/null`);
  }

  /**
   * Creates an empty commit based on the ticket parameters.
   * @param ticket - The current ticket to be worked on.
   */
  public static gitCreateEmptyCommit(ticket: LinearTicket, preserveChanges = false): void {
    const hasChanges = Git.hasChanges();

    if (preserveChanges && hasChanges) {
      Git.stash();
    }
    execSync(`git commit --allow-empty -m "${Linear.getTicketType(ticket)}(${ticket.team.key}-${ticket.number}): ${ticket.title.toLowerCase()}" &>/dev/null`);
    if (preserveChanges && hasChanges) {
      Git.applyAndDropStash();
    }
  }

  /**
   * Publishes the git branch to the remote repository
   * @param branchName - The branch to publish.
   */
  public static publishBranch(branchName?: string): void {
    if (!branchName) return;
    execSync(`git push --set-upstream origin ${branchName} &>/dev/null`);
  }

  /**
   * Creates a pr for the ticket
   * @param ticket - The ticket to create the pr for.
   */
  public static createPr(ticket: LinearTicket): void {
    execSync(`gh pr create --title "${Linear.getTicketType(ticket)}(${ticket.team.key}-${ticket.number}): ${ticket.title}" -d -b "" &>/dev/null`);
  }

  /**
   * Returns the current branch.
   */
  public static getCurrentBranch(): string {
    return execSync(`git rev-parse --abbrev-ref HEAD`).toString();
  }

  /**
   * Readies a PR.
   */
  public static readyPR(): void {
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
  public static startCodeReview(reviewers: string[]): void {
    execSync(`gh pr edit ${reviewers.map(t => `--add-reviewer=${t}`).join(" ")}`);
  }

  /**
   * Removes codeReviewers from a PR.
   */
  public static removeReviewers(reviewers: string[]): void {
    execSync(`gh pr edit ${reviewers.map(t => `--remove-reviewer=${t}`).join(" ")}`);
  }

  /**
   * Opens the PR related to the current branch on remote.
   */
  public static openWebView(): void {
    execSync("gh pr view -w");
  }
}