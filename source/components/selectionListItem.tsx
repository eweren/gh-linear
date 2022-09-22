import React, { FC } from 'react';
import {Box, Text, Transform } from 'ink';
import chalk from 'chalk';
import { LinearTicket, StatusType } from '../shared/types';
import { Props } from './selectInput/item';

export const ItemComponent: FC<Props<LinearTicket>> = (props) => {
  if (!props.value) {
    return <></>
  }
  const {team, title, number, state, dueDate} = props.value;

  const status = state.type as StatusType;

	return (
  <Box flexDirection="row">
    <Text italic={true} color="white">
      {team.key}-{number.toFixed().padEnd(7)}
    </Text>

    <Text bold={true}>
      <Transform transform={chalk.hex(state.color ? state.color : "#FFF")}>
        {status === "backlog" && '◌ '}
        {status === "unstarted" && '◯ '}
        {status === "started" && '◑ '}
        {status === "canceled" && '⌀ '}
        {state.name ? (state.name.length >= 20 ? state.name.slice(0, 15) + "..." : state.name).padEnd(20) : ""}
      </Transform>
    </Text>
      <Text italic={true} color="white">
        {title}
      </Text>
    {dueDate !== "null" && <Box marginLeft={1}>
      <Text>
        <Transform transform={chalk.hex(state.color ? state.color : "#FFF")}>
          {dueDate}
        </Transform>
      </Text>
    </Box>}
  </Box>
)};