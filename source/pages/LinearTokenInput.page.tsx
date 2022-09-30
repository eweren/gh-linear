import React, { FC, useEffect, useState } from 'react';
import { Config } from '../shared/types';
import {Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { getConfig, saveConfig } from '../shared/config';
import Linear from '../helpers/linear.helper';

export const LinearTokenInputPage: FC<{onConfigChange: (config: Config) => void}> = ({onConfigChange}) => {
  const [config, setConfig] = useState(getConfig());
  const [isInvalidKey, setIsInvalidKey] = useState(false);

  useEffect(() => {
    Linear.isValidApiKey().then((t) => setIsInvalidKey(!t));
  }, [])

	return <Box marginY={1} flexDirection='column'>
    <Text color="blue" bold>Please provide your Linear API token (https://linear.app/settings/api)</Text>
    {!isInvalidKey && <Text color="gray">The token will only be saved locally</Text>}
    {isInvalidKey && <Text color="red">The given token seems to be invalid</Text>}
  <TextInput
    value={config.linearToken ?? ""}
    placeholder="lin_api_..."
    onChange={(linearToken) => setConfig({...config, linearToken})}
      onSubmit={async (linearToken) => {
      const newConfig = saveConfig({linearToken});
      const isValid = await Linear.isValidApiKey();
      if (isValid) {
        setConfig(newConfig);
        onConfigChange(newConfig);
        setIsInvalidKey(false);
      } else {
        setIsInvalidKey(true);
      }
    }}
  />
</Box>
};