import React, {FC, useEffect, useState} from 'react';
import {Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'cross-fetch';
import SelectInput, { ItemProps } from 'ink-select-input';
import { Item } from 'ink-select-input/build/SelectInput';
import { TaskList, Task } from 'ink-task-list';
import spinners from 'cli-spinners';
import Link from 'ink-link';
import { execSync } from "child_process";

const configFilePath = "~/.gh/linear/config.yaml";

const gitBranchCreateSteps = {
	check: "Check if branch exists...",
	create: "Creating and switching to branch...",
	switch: "Switching to branch...",
	push: "Pushing branch...",
	draft: "Creating a Draft PR...",
	success: "Branch created successfully! You can start Working now",
}

const App: FC = () => {
	const [value, setValue] = useState("");
	const [response, setResponse] = useState("");
	const [linearApiToken, setLinearApiToken] = useState("");
	const [linearApiTokenPresent, setLinearApiTokenPresent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [gitBranchCreateStep, setGitBranchCreateStep] = useState(gitBranchCreateSteps.check);
	const [creatingBranch, setCreatingBranch] = useState(false);
	const [selected, setSelected] = useState<string | undefined>();
	const [loaded, setLoaded] = useState(false);
	const [issues, setIssues] = useState<{id: string, title: string, url: string, number: number, priority: number, dueDate: any, branchName: string, state: {name: string, color: string, position: number}, team: {key: string}}[]>([]);
	const [data, setData] = useState<{label: string, value: string}[]>([]);

	const [appheight, setHeight] = useState<string | number>(50)

	useEffect(() => {
		if (!linearApiToken) {
			return;
		}
	}, [linearApiToken])

	useEffect(() => {
		const intervalStatusCheck = setInterval(() => {
			setHeight(process.stdout.rows)
		}, 1000);
		setHeight(process.stdout.rows);

		return () => {
			clearInterval(intervalStatusCheck);
		};
	}, []);

	const handleSubmit = async () => {
		setLoading(true);

		const httpLink = new HttpLink({
			fetch,
			uri: "https://api.linear.app/graphql",
			headers: {
				authorization: `Bearer ${linearApiToken.trim()}`
			}
		});

		const client = new ApolloClient({
			link: httpLink,
			cache: new InMemoryCache()
		});

		const response = await client.query({query: gql`
			query MyIssues($filter: IssueFilter) {
				issues(filter: $filter) {
					nodes {
						id
						title
						number
						priority
						dueDate
						branchName
						state {
							name
							color
							position
						}
						team {
							key
						}
						url
					}
				}
			}
		`, variables: {
			"filter": {
				"assignee": {
					"isMe": {
						"eq": true
					}
				},
				"completedAt": {
					"null": true
				}
			}
		}});


    if (response?.data?.issues) {
			let is = (response.data.issues.nodes as typeof issues).slice().filter(n => n.branchName.includes(value.toLowerCase()))
			if (is.length === 0) {
				is = (response.data.issues.nodes as typeof issues).slice();
			}
			is = is.sort((a, b) => a.state.position === b.state.position ? b.priority - a.priority : b.state.position - a.state.position);
			setIssues(is);
			setData(is.map(issue => ({ label: `${issue.url}~~~${issue.team.key}-${`${issue.number}`.padEnd(4)} ${issue.title}~~~${issue.branchName}`, value: issue.id})));
			setLoaded(true);
			setLoading(false);
      return true;
    }
		setLoading(false);

    return false;
	}

	useEffect(() => {
		try {
			const token = execSync(`cat ${configFilePath}`).toString();
			setLinearApiToken(token);

			setLinearApiTokenPresent(true);
		} catch (e) {
			let previousPath = "";
			configFilePath.split("/").forEach((path) => {
				if (path !== "config.yaml" && path !== "~") {
					previousPath += path + "/";
					execSync(`mkdir ~/${previousPath}`).toString();
				}
			})
			setLinearApiTokenPresent(false);
		}
	}, []);

	const selectIssue = (item: Item<string>) => {
		setSelected(issues.find(i => i.id === item.value)?.branchName);
	}

	const handleResponse = (value: string) => {
		setLoading(true);
		if (value === "Y" || value === "y" || value === "") {
			setCreatingBranch(true);
			setGitBranchCreateStep(gitBranchCreateSteps.check);

			const remoteBranchExists = execSync(`git ls-remote origin ${selected}`).toString();

			if (remoteBranchExists) {
				setGitBranchCreateStep(gitBranchCreateSteps.switch);
				execSync(`git checkout ${selected}`);
			} else {
				setGitBranchCreateStep(gitBranchCreateSteps.create);
				execSync(`git checkout -b ${selected}`);
				setGitBranchCreateStep(gitBranchCreateSteps.push);
				execSync(`git push --set-upstream origin ${selected}`);
			}
			setGitBranchCreateStep(gitBranchCreateSteps.success);
		} else if (value === "N" || value === "n") {
			setCreatingBranch(false);
			setSelected(undefined);
			setLoading(false);
		}
	}

	const saveLinearToken = (value: string) => {
		execSync(`echo ${value} > ${configFilePath}`);
		setLinearApiTokenPresent(true);
	}

	if (!linearApiTokenPresent) {
		return <Box marginY={1} flexDirection='column'>
			<Text color="blue" bold>Please provide your Linear API token.</Text>
			<Text color="gray">The token will only be saved locally.</Text>
			<TextInput value={linearApiToken} placeholder="lin_api_..." onChange={setLinearApiToken} onSubmit={saveLinearToken} />
		</Box>
	}

	return (
		<Box height={appheight} alignItems='flex-start' justifyContent='flex-start'>
			{loading && !creatingBranch && <Box>
				<Spinner type="arc" />
				<Text>  Loading...</Text>
			</Box>
			}
			{loaded && !selected &&
				<SelectInput items={data} limit={5} onSelect={selectIssue} itemComponent={ItemComponent} />
			}
			{loading && creatingBranch &&
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
			}
			{loaded && selected && !loading && gitBranchCreateStep !== gitBranchCreateSteps.success &&
				<>
					<Text>Start work on: <Text color="blue">{selected}</Text> (Y/n)</Text>
					<TextInput value={response} onChange={setResponse} onSubmit={handleResponse} />
				</>
			}
			{!loaded && !selected && !loading && <Box marginY={1}>
					<Text color="blue" bold>Filter for Ticket/Project/Title: </Text>
					<TextInput value={value} placeholder="(Empty to show all)" onChange={setValue} onSubmit={handleSubmit} />

				</Box>
			}
		</Box>
	);
};

const ItemComponent: FC<ItemProps> = (props) => {
	return <Link url={props.label.split("~~~")[0]} >
		<Text color="blue">{props.label.split("~~~")[1]}</Text>
	</Link>
};

module.exports = App;
export default App;
