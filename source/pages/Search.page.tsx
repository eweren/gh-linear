import React, { FC, useState } from 'react'
import {Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Linear from '../helpers/linear.helper';
import { LinearTicket } from '../shared/types';

export const SearchPage: FC<{onLoadingChange: ((loading: boolean) => void) | undefined, onSubmit: ((tickets: LinearTicket[]) => void) | undefined}> = (props) => {
	const [value, setValue] = useState("");

  const onSubmit = async (value: string) => {
    let filterForMyIssues = false;
    if (value.startsWith("-")) {
      value = value.replace("-", "").trim();
      filterForMyIssues = true;
    }
    props.onLoadingChange?.(true);

    const tickets = await Linear.getTickets(value, filterForMyIssues);
    props.onLoadingChange?.(false);
    props.onSubmit?.(tickets);
  }

  return <Box flexDirection="column">
    <Box marginTop={1} flexDirection="column">
      <Text color="blue" bold>Filter for Ticket/Project/Title</Text>
    </Box>
    <Box>
      <TextInput value={value} placeholder="(Empty to show all, - to show yours)" onChange={setValue} onSubmit={onSubmit} />
    </Box>
  </Box>
}