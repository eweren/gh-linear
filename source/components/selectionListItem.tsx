import { ItemProps } from 'ink-select-input/build';
import React, { FC } from 'react';
import {Box, Text, Transform } from 'ink';
import { LinearTicket, StatusType } from '../ui';
import chalk from 'chalk';

export const ItemComponent: FC<ItemProps> = (props) => {
  const {team, title, number, state, dueDate} = JSON.parse(props.label) as LinearTicket;

  const status = state.type as StatusType;

	return (
  <Box flexDirection="row">
    <Text italic={true} color="white">
      {/* {props.label} */}
        {/* {id} */}
         {team.key}-{number.toFixed().padEnd(7)}
        {/* {priority} */}
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