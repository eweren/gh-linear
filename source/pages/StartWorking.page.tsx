import React, { FC, useState } from 'react'
import type { LinearTicket, ValueOf } from '../shared/types'
import TextInput from 'ink-text-input';
import {Box, Text, useApp } from 'ink';
import { gitBranchCreateSteps } from '../shared/constants';
import { checkIfRemoteBranchExists, gitCheckoutBranch, gitCreateEmptyCommit, gitPublishBranch, gitCreatePr, gitGetCurrentBranch } from '../helpers/git.helper';
import { Task, TaskList } from 'ink-task-list';
import spinners from 'cli-spinners';

export const StartWorkPage: FC<{selectedTicket: LinearTicket, onAbort: () => void}> = ({selectedTicket, onAbort}) => {
	const [gitBranchCreateStep, setGitBranchCreateStep] = useState<ValueOf<typeof gitBranchCreateSteps> | null>(null);
	const [secondStep, setShowSecondStep] = useState(false);
	const {exit} = useApp();

	const onSubmit = (branch: string) => {

		if (selectedTicket) {
			setGitBranchCreateStep(gitBranchCreateSteps.check);

			if (checkIfRemoteBranchExists(selectedTicket.branchName)) {
				gitCheckoutBranch(selectedTicket.branchName);
				setGitBranchCreateStep(gitBranchCreateSteps.switch);
			} else if (selectedTicket) {
				if (branch !== gitGetCurrentBranch()) {
					gitCheckoutBranch(branch);
				}
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

	if (secondStep) {
		return <WhichBranchToBranchFrom onSubmit={onSubmit} />
	} else {
		return <StartWorkPageDialog selectedTicket={selectedTicket} onSubmit={() => setShowSecondStep(true)} onAbort={onAbort} />
	}

}

/**
 * Just the dialog.
 */
export const StartWorkPageDialog: FC<{selectedTicket: LinearTicket, onSubmit: () => void, onAbort: () => void}> = ({selectedTicket, onSubmit, onAbort}) => {
	const [value, setValue] = useState("");

	function handleSubmit(value: string) {
		if (value === "Y" || value === "y" || value === "") {
			onSubmit();
		} else {
			onAbort();
		}
	}

	return <>
		<Text>Start work on: <Text color="blue">{selectedTicket.branchName}</Text> (Y/n) </Text>
		<TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
	</>
};

/**
 * Just another dialog.
 */
export const WhichBranchToBranchFrom: FC<{onSubmit: (branch: string) => void}> = ({onSubmit}) => {
	const currentBranch = gitGetCurrentBranch();
	const [value, setValue] = useState("");

	return <>
		<Text>Which branch do you want to branch from: </Text>
		<TextInput placeholder={`(Enter for ${currentBranch.trim()})`} value={value} onChange={setValue} onSubmit={onSubmit} />
	</>
};