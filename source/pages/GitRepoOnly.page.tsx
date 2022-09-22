import React, { FC } from 'react';
import {Box, Text } from 'ink';

export const GitRepoOnlyPage: FC = () => (<Box marginY={1} flexDirection='column'>
  <Text color="magentaBright" bold>This command can only be executed from a git directory.</Text>
</Box>
);