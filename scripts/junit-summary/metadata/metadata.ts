/**
 * Additional information that can be assigned to a test run.
 */
export interface Metadata {

  /** Job or pipeline title. */
  pipelineTitle?: string;

  /** Code author name. */
  authorName?: string;

  /** Code author Slack handle. */
  authorSlack?: string;

  /** Code author GitHub username. */
  authorGitHub?: string;

  /** Change/pull request ID. */
  changeId?: number;

  /** Change/pull request URL. */
  changeUrl?: number;

  /** Change/pull request title. */
  changeTitle?: number;

  /** Git branch name. */
  branchName?: string;

  /** CI run URL. */
  runUrl?: string;

  /** CI run number/ID. */
  runId?: string;

  /** CI test results URL. */
  resultsUrl?: string;

  /** CI build artifacts URL. */
  artifactsUrl?: string;

  /** CI rerun trigger URL. */
  rerunUrl?: string;

  /** Arbitrary extra information that can be added to output. */
  extra?: string;
}
