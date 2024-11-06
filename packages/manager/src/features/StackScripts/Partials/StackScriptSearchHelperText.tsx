import { Box } from '@linode/ui';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

export const StackScriptSearchHelperText = () => {
  return (
    <Stack spacing={1}>
      <Typography>
        You can search for a specific item by prepending your search term with
        "username:", "label:", or "description:".
      </Typography>
      <Box>
        <Typography fontFamily={(theme) => theme.font.bold}>
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