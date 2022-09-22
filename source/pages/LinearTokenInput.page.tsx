import React, { FC, useState } from 'react';
import { Config } from '../shared/types';
import {Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { getConfig, saveConfig } from '../shared/config';

export const LinearTokenInputPage: FC<{onConfigChange: (config: Config) => void}> = ({onConfigChange}) => {
  const [config, setConfig] = useState(getConfig());

	return <Box marginY={1} flexDirection='column'>
  <Text color="blue" bold>Please provide your Linear API token.</Text>
  <Text color="gray">The token will only be saved locally.</Text>
  <TextInput
    value={config.linearToken ?? ""}
    placeholder="lin_api_..."
    onChange={(linearToken) => setConfig({...config, linearToken})}
    onSubmit={(linearToken) => {
      const newConfig = saveConfig({linearToken});
      setConfig(newConfig);
      onConfigChange(newConfig);
    }}
  />
</Box>
};