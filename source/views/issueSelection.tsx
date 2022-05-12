import SelectInput from 'ink-select-input/build';
import React, { FC, useEffect, useState } from 'react';
import {Box, Text, useApp, useInput } from 'ink';
import { ItemComponent } from '../components/selectionListItem';
import { useFullHeight } from '../hooks/useFullHeight';
import { Item } from 'ink-select-input/build/SelectInput';
import { execSync } from "child_process";
import { LinearTicket } from '../ui';

/** use the label in the following form: url~~~title~~~branchName~~colorCode~~~state~~~dueDate */
export const IssueSelection: FC<{data: {label: string, value: string}[], onAbort?: () => void; onSelect?: (item: Item<string>) => void}> = (props) => {
  const fullHeight = useFullHeight();
	const {exit} = useApp();
  // const [issues] = useState(props.data.map((d) => JSON.parse(d.label)) as unknown as LinearTicket);

  const [highlightedItem, setHighlightedItem] = useState<Item<string>>();
  const [selectedItem, setSelectedItem] = useState<LinearTicket>();

  useEffect(() => {
    setHighlightedItem(props.data[0]);
  }, [props.data]);

  useEffect(() => {
    if (highlightedItem?.label) {
      setSelectedItem(JSON.parse(highlightedItem.label));
    } else {
      setSelectedItem(undefined);
    }
  }, [highlightedItem])

  useInput((input, key) => {
    if (!highlightedItem) {
      return;
    }
    const selectedItem = JSON.parse(highlightedItem.label) as LinearTicket;

		if (input === 'S' || input === "s") {
      props.onSelect?.(highlightedItem);
		} else if (input === "V" || input === "v") {
      execSync(`open ${selectedItem.url}`);
		} else if ((input === "P" || input === "p") && selectedItem?.integrationResources?.nodes?.[0]?.pullRequest?.url) {
      execSync(`open ${selectedItem.integrationResources.nodes[0].pullRequest.url}`);
		} else if (input === "F" || input === "f") {
      props.onAbort?.();
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
    <SelectInput items={props.data} limit={fullHeight - 6} onHighlight={setHighlightedItem} onSelect={props.onSelect} itemComponent={ItemComponent} />
    <Box flexDirection='row' marginTop={Math.max(0, fullHeight - 6 - props.data.length)} marginRight={5} justifyContent='space-between' borderStyle='round'>
      <Box flexDirection='row'paddingLeft={2}>
          <Text color="green">{"(S) to start working  "}</Text>
          <Text color="blue">{"(V) to view in browser  "}</Text>
          <Text color="yellow">{"(F) to search again  "}</Text>
          {selectedItem?.integrationResources?.nodes?.[0]?.pullRequest?.url && <Text color="magenta">{"(P) to show PR  "}</Text>}
      </Box>
      <Text color="grey">{"(Q) to quit  "}</Text>
    </Box>
  </Box>
)};
