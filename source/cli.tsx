#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';

import App from './ui';

import { parse } from 'ts-command-line-args';
import { Arguments } from './shared/types';

const args = parse<Arguments>(
    {
        ticket: { type: String, alias: 't', optional: true, description: 'Directly start working on a ticket (ex lh -t SPR-12)' },
        search: { type: String, alias: 's', optional: true, description: 'Search for tickets' },
        my: { type: Boolean, optional: true, alias: 'm', description: 'Show only my tickets' },
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    },
    {
        helpArg: 'help',
        headerContentSections: [{ header: 'Linhub', content: 'Thanks for using Linhub' }],
        footerContentSections: [{ header: 'Legal', content: `Copyright: THE ARC GmbH` }],
    },
);

console.log(args);
if (!args.help) {
  render(<App args={args} />);
}
