import { Box, Divider, Paper } from '@linode/ui';
import * as React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

interface Props {
  attachments: string[];
  icons: JSX.Element[];
}

export const TicketAttachmentRow = (props: Props) => {
  const { attachments, icons } = props;
  return (
    <Paper sx={{ padding: 2 }}>
      <Stack divider={<Divider />}>
        {attachments.map((attachment, idx) => {
          return (
            <Stack
              alignItems="center"
              data-qa-attachment-row
              direction="row"
              key={idx}
              spacing={2}
            >
              <Box>{icons[idx]}</Box>
              <Typography component="span">{attachment}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
};
