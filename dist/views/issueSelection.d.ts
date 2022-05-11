import { FC } from 'react';
import { Item } from 'ink-select-input/build/SelectInput';
/** use the label in the following form: url~~~title~~~branchName~~colorCode~~~state~~~dueDate */
export declare const IssueSelection: FC<{
    data: {
        label: string;
        value: string;
    }[];
    onSelect?: (item: Item<string>) => void;
}>;
