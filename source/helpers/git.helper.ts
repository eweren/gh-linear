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
  private static hasGHCli(): boolean {
    try {
      const hasCLI = execSync(`gh auth status`).toString().includes("Logged in to github.com as");
      if (!hasCLI) {
        console.log("Please install the Github CLI (https://cli.github.com/) and login to your account.");
      }
      return hasCLI;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if there are changes in the repository.
   */
  private static hasChanges(): boolean {
    try {
      return !execSync(`git status`).toString().includes("working tree clean");
    } catch (e) {
      return false;
    }
  }

  /**
   * Stashes all current changes
   */
  private static stash(): void {
    try {
      execSync(`git stash &>/dev/null`);
    } catch (e) {
      console.log("Error stashing. Trying to finish execution either way.");
    }
  }

  /**
   * Applies the previously created stash and drops it.
   */
  private static applyAndDropStash(): void {
    try {
      execSync(`git stash apply --index &>/dev/null`);
      execSync(`git stash drop stash@{0} &>/dev/null`);
    } catch (e) {
      console.log("Error when trying to apply stash. Trying to finish execution either way.");
    }
  }

  /**
   * Creates an empty commit based on the ticket parameters.
   * @param ticket - The current ticket to be worked on.
   */
  public static gitCreateEmptyCommit(ticket: LinearTicket, preserveChanges = false): boolean {
    const hasChanges = Git.hasChanges();

    if (preserveChanges && hasChanges) {
      Git.stash();
    }
    try {
      execSync(`git commit --allow-empty -m "${Linear.getTicketType(ticket)}(${ticket.team.key}-${ticket.number}): ${ticket.title.toLowerCase()}" &>/dev/null`);
      if (preserveChanges && hasChanges) {
        Git.applyAndDropStash();
      }
      return true;
    } catch (e) {
      if (preserveChanges && hasChanges) {
        Git.applyAndDropStash();
      }
      console.log("Could not create empty commit. Proceeding with procedure.")
      return false;
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
    if (Git.hasGHCli()) {
      const type = Linear.getTicketType(ticket);
      execSync(`gh pr create --title "${type && type !== "undefined" ? type : "chore"}(${ticket.team.key}-${ticket.number}): ${ticket.title}" -d -b "" &>/dev/null`);
    }
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
    if (Git.hasGHCli()) {
      const noPr = execSync(`gh pr view`).toString().includes("no pull requests found for branch");
      if (noPr) {
        console.log("There is no PR associated with this branch")
        return;
      }
      execSync(`gh pr ready`);
    }
  }

  /**
   * Merges a PR.
   */
  public static mergePR(): void {
    if (Git.hasGHCli()) {
      const noPr = execSync(`gh pr view`).toString().includes("no pull requests found for branch");
      if (noPr) {
        console.log("There is no PR associated with this branch")
        return;
      }
      console.log("Requesting merge...")
      execSync(`gh pr merge -m --auto -d`);
    }
  }

  /**
   * Starts codeReview on a PR.
   */
  public static startCodeReview(reviewers: string[]): void {
    if (Git.hasGHCli()) {
      execSync(`gh pr edit ${reviewers.map(t => `--add-reviewer=${t}`).join(" ")}`);
    }
  }

  /**
   * Removes codeReviewers from a PR.
   */
  public static removeReviewers(reviewers: string[]): void {
    if (Git.hasGHCli()) {
      execSync(`gh pr edit ${reviewers.map(t => `--remove-reviewer=${t}`).join(" ")}`);
    }
  }

  /**
   * Opens the PR related to the current branch on remote.
   */
  public static openWebView(): void {
    if (Git.hasGHCli()) {
      execSync("gh pr view -w");
    }
  }
}