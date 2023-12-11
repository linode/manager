import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
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
