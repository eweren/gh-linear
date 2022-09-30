import React, {FC, useEffect, useMemo, useState} from 'react';
import {Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { IssueSelection } from './pages/IssueSelection.page';
import { Arguments, Config, LinearTicket } from './shared/types';
import { createConfigPath, getConfig } from './shared/config';
import Git from './helpers/git.helper';
import { SearchPage } from './pages/Search.page';
import { StartWorkPage } from './pages/StartWorking.page';
import { LinearTokenInputPage } from './pages/LinearTokenInput.page';
import { GitRepoOnlyPage } from './pages/GitRepoOnly.page';
import Linear from './helpers/linear.helper';

const App: FC<{args: Arguments}> = ({args}) => {
	const [config, setConfig] = useState<Config>({linearToken: null, defaultBranch: "staging"});
	const [loading, setLoading] = useState(false);
	const [isValidApiKey, setIsValidApiKey] = useState(false);
	const [hasProcessedArgs, setHasProcessedArgs] = useState(false);
	const [textToDisplay, setTextToDisplay] = useState<string | undefined>();
	const isGitRepo = useMemo(() => Git.checkIfGitRepo(), [config]);
	const [selectedTicket, setSelectedTicket] = useState<LinearTicket | null>(null);
	const [tickets, setTickets] = useState<LinearTicket[] | null>(null);
	const [appHeight, setHeight] = useState<number>(50);
	const showSelectedText = false as const;

	useEffect(() => {
		if (!config) {
			setIsValidApiKey(true);
			return;
		}
		Linear.isValidApiKey().then(setIsValidApiKey)
	}, [config])

	useEffect(() => {
		if (hasProcessedArgs) {
			return;
		}

		if (args.search || args.ticket || args.i) {
			setLoading(true);
			const fetchTickets = async () => {
				const tickets = await Linear.getTickets((args.ticket ?? args.search ?? "") as string, args.ticket ? false : args.i ?? false);
				setTextToDisplay(JSON.stringify(tickets));
				if (tickets.length > 1) {
					setTickets(tickets);
				} else if (tickets.length === 1 && tickets[0]) {
					setSelectedTicket(tickets[0]);
				}
				setLoading(false);
			}
			fetchTickets();
		}
		setHasProcessedArgs(true);

		const intervalStatusCheck = setInterval(() => {
			setHeight(process.stdout.rows)
		}, 1000);
		setHeight(process.stdout.rows);

		try {
			setConfig(getConfig());
		} catch (e) {
			createConfigPath();
		}

		Linear.isValidApiKey().then(setIsValidApiKey)

		return () => {
			clearInterval(intervalStatusCheck);
		};
	}, []);

	const handleSearchSubmit = async (tickets: LinearTicket[]) => {
		setTickets(tickets);
		setLoading(false);
		return true;
	}

	if (textToDisplay && showSelectedText) return <Text>{textToDisplay}</Text>
	if (!isGitRepo) return <GitRepoOnlyPage />;
	if (!config.linearToken || !isValidApiKey) return <LinearTokenInputPage onConfigChange={setConfig} />

	if (tickets && !selectedTicket) {
		return <IssueSelection
			data={tickets.map(ticket => ({ label: ticket.id, value: ticket}))}
			onAbort={() => {setTickets(null)}}
			onSelect={({value}) => setSelectedTicket(value)}
		/>
	}

	return (
		<Box height={appHeight} alignItems='flex-start' justifyContent='flex-start'>
			{loading && <Box>
				<Spinner type="arc" />
				<Text>  Loading...</Text>
			</Box>
			}
			{selectedTicket && !loading && <StartWorkPage selectedTicket={selectedTicket} onAbort={() => setSelectedTicket(null)} />}
			{!tickets && !selectedTicket && !loading && <SearchPage onSubmit={handleSearchSubmit} onLoadingChange={setLoading} />}
		</Box>
	);
};

module.exports = App;
export default App;
