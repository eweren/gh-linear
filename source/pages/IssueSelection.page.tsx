import React, { FC, useEffect, useState } from 'react';
import {Box, Text, useApp, useInput } from 'ink';
import { ItemComponent } from '../components/selectionListItem';
import { useFullHeight } from '../hooks/useFullHeight';
import { Item } from 'ink-select-input/build/SelectInput';
import { execSync } from "child_process";
import { LinearTicket } from '../shared/types';
import SelectInput from '../components/selectInput/selectInput';

export const IssueSelection: FC<{data: Item<LinearTicket>[], onAbort?: () => void; onSelect?: (item: Item<LinearTicket>) => void}> = (props) => {
  const fullHeight = useFullHeight();
	const {exit} = useApp();

  const [highlightedItem, setHighlightedItem] = useState<Item<LinearTicket>>();
  const [selectedItem, setSelectedItem] = useState<LinearTicket>();

  useEffect(() => {
    setHighlightedItem(props.data[0]);
  }, [props.data]);

  useEffect(() => {
    if (highlightedItem && highlightedItem.value) {
      setSelectedItem(highlightedItem.value);
    } else {
      setSelectedItem(undefined);
    }
  }, [highlightedItem])

  useInput((input, key) => {
    if (!highlightedItem) {
      return;
    }
    const selectedItem = highlightedItem.value;

		if ((input === 'S' || input === "s") && props.onSelect) {
      props.onSelect(highlightedItem);
		} else if (input === "W" || input === "w") {
      execSync(`open ${selectedItem.url}`);
		} else if ((input === "P" || input === "p") && selectedItem && selectedItem.integrationResources.nodes[0] && selectedItem.integrationResources.nodes[0].pullRequest.url) {
      execSync(`open ${selectedItem.integrationResources.nodes[0].pullRequest.url}`);
		} else if ((input === "F" || input === "f") && props.onAbort) {
      props.onAbort();
		} else if (input === "Q" || input === "q") {
      exit();
      return;
    }

		if (key.leftArrow) {
			// Left arrow key pressed
		}
	});


	return (<Box flexDirection='column'>
    <Box flexDirection='row' justifyContent='space-between' borderStyle='round' marginRight={5}>
      <Box flexDirection='row'>
        <Text color="green">{"  ID".padEnd(12)}</Text>
        <Text color="green">{"Status".padEnd(22)}</Text>
        <Text color="green">Title</Text>
      </Box>
      <Text color="green">{"Due Date".padEnd(16)}</Text>
    </Box>
    <SelectInput<LinearTicket> items={props.data} limit={fullHeight - 6} onHighlight={setHighlightedItem} onSelect={props.onSelect} itemComponent={ItemComponent} />
    <Box flexDirection='row' marginTop={Math.max(0, fullHeight - 6 - props.data.length)} marginRight={5} justifyContent='space-between' borderStyle='round'>
      <Box flexDirection='row'paddingLeft={2}>
          <Text color="green">{"(S) to start working  "}</Text>
          <Text color="blue">{"(W) to view in browser  "}</Text>
          <Text color="yellow">{"(F) to search again  "}</Text>
          {selectedItem && selectedItem.integrationResources.nodes[0] && selectedItem.integrationResources.nodes[0].pullRequest.url && <Text color="magenta">{"(P) to show PR  "}</Text>}
      </Box>
      <Text color="grey">{"(Q) to quit  "}</Text>
    </Box>
  </Box>
)};
