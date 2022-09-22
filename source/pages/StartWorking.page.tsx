import React, { FC, useState } from 'react'
import type { LinearTicket, ValueOf } from '../shared/types'
import TextInput from 'ink-text-input';
import {Box, Text, useApp } from 'ink';
import { gitBranchCreateSteps } from '../shared/constants';
import { checkIfRemoteBranchExists, gitCheckoutBranch, gitCreateEmptyCommit, gitPublishBranch, gitCreatePr } from '../helpers/git.helper';
import { Task, TaskList } from 'ink-task-list';
import spinners from 'cli-spinners';

export const StartWorkPage: FC<{selectedTicket: LinearTicket, onAbort: () => void}> = ({selectedTicket, onAbort}) => {
	const [gitBranchCreateStep, setGitBranchCreateStep] = useState<ValueOf<typeof gitBranchCreateSteps> | null>(null);
	const {exit} = useApp();

	const onSubmit = (value: string) => {

		if (selectedTicket && (value === "Y" || value === "y" || value === "")) {
			setGitBranchCreateStep(gitBranchCreateSteps.check);

			if (checkIfRemoteBranchExists(selectedTicket.branchName)) {
				gitCheckoutBranch(selectedTicket.branchName);
				setGitBranchCreateStep(gitBranchCreateSteps.switch);
			} else if (selectedTicket) {
				setGitBranchCreateStep(gitBranchCreateSteps.create);
				gitCheckoutBranch(selectedTicket.branchName, true);
				gitCreateEmptyCommit(selectedTicket, true);

				setGitBranchCreateStep(gitBranchCreateSteps.push);
				gitPublishBranch(selectedTicket.branchName);

				setGitBranchCreateStep(gitBranchCreateSteps.draft);
				gitCreatePr(selectedTicket);
			}
			setGitBranchCreateStep(gitBranchCreateSteps.success);
			exit();
		} else {
			onAbort();
		}
	}

	if (gitBranchCreateStep !== null) {
		return <Box marginTop={2}>
			<TaskList>
				{gitBranchCreateStep !== gitBranchCreateSteps.success && <Task
						label="Loading"
						state="loading"
						output={gitBranchCreateStep}
						spinner={spinners.arc}
				/>}

				{gitBranchCreateStep === gitBranchCreateSteps.success &&<Task
						label={gitBranchCreateSteps.success!}
						state="success"
				/>}
			</TaskList>
		</Box>
	}

	return <StartWorkPageDialog selectedTicket={selectedTicket} onSubmit={onSubmit} />
}

/**
 * Just the dialog.
 */
export const StartWorkPageDialog: FC<{selectedTicket: LinearTicket, onSubmit: (value: string) => void}> = ({selectedTicket, onSubmit}) => {
	const [value, setValue] = useState("");

	return <>
		<Text>Start work on: <Text color="blue">{selectedTicket.branchName}</Text> (Y/n) </Text>
		<TextInput value={value} onChange={setValue} onSubmit={onSubmit} />
	</>
};