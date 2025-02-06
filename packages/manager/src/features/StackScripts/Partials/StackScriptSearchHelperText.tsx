import { Box, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Code } from 'src/components/Code/Code';

export const StackScriptSearchHelperText = () => {
  return (
    <Stack spacing={1}>
      <Typography>
        You can search for a specific item by prepending your search term with
        "username:", "label:", or "description:".
      </Typography>
      <Box>
        <Typography sx={(theme) => ({ font: theme.font.bold })}>
          Examples
        </Typography>
        <Typography fontSize="0.8rem">
          <Code>username: linode</Code>
        </Typography>
        <Typography fontSize="0.8rem">
          <Code>label: sql</Code>
        </Typography>
        <Typography fontSize="0.8rem">
          <Code>description: "ubuntu server"</Code>
        </Typography>
        <Typography fontSize="0.8rem">
          <Code>label: sql or label: php</Code>
        </Typography>
      </Box>
    </Stack>
  );
};
