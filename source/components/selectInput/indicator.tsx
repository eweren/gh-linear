import * as React from 'react';
import type {FC} from 'react';
import {Box, Text} from 'ink';

export interface Props {
	isSelected?: boolean;
}

const Indicator: FC<Props> = ({isSelected = false}) => (
	<Box marginRight={1}>
		{isSelected ? <Text color="blue">❯</Text> : <Text> </Text>}
	</Box>
);

export default Indicator;
