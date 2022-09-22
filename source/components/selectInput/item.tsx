import React from 'react';
import {Text} from 'ink';

export interface Props<V> {
	isSelected?: boolean;
	label: string;
	value?: V;
}

function Item<V>(args: Props<V>): JSX.Element {
	return <Text color={args.isSelected ? 'blue' : undefined}>{args.label}</Text>
};

export default Item;
