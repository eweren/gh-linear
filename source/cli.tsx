#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';

import App from './ui';

import { getConfig, saveConfig } from './shared/config';
import { gitReadyPR, gitRemoveReviewers, gitStartCodeReview } from './helpers/git.helper';
import { ARGS } from './shared/constants';

if (ARGS['add-reviewer'] && Object.keys(ARGS).length === 1) {
  // Add reviewer to default
  saveConfig({...getConfig(), defaultReviewers: [...(getConfig().defaultReviewers ?? []), ...ARGS["add-reviewer"].map(r => r.trim())]});
  console.log("Default reviewers added");

} else if (ARGS['remove-reviewer'] && Object.keys(ARGS).length === 1) {
  // Remove reviewer from default
  const config = getConfig();
  let reviewers = config.defaultReviewers;
  const toBeRemovedReviewers = ARGS["remove-reviewer"].map(r => r.trim());
  saveConfig({...config, defaultReviewers: reviewers?.filter(r => !toBeRemovedReviewers.includes(r))});
  console.log("Default reviewers updated");

} else if (ARGS.ready) {
  // Make PR ready
  gitReadyPR();

} else if (ARGS["code-review"]) {
  // Request CodeReview on PR - either with default reviewer or with provided ones
  const reviewers = ARGS['add-reviewer'] ? ARGS['add-reviewer'] : getConfig().defaultReviewers;
  if (reviewers && !ARGS['remove-reviewer']) {
    gitStartCodeReview(reviewers as string[]);
    console.log("Code review requested.")
  } else {
    if (ARGS['remove-reviewer']) {
      gitRemoveReviewers(ARGS['remove-reviewer'] as string[]);
      console.log("Code reviewers removed.")
    } else {
      console.log("Could not find any reviewers. Please provide some by using the --add-reviewer flag.")
    }
  }
} else if (!ARGS.help) {
  // Show App in all other cases
  render(<App args={ARGS} />);
}
