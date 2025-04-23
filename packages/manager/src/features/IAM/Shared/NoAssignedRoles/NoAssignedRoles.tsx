import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import EmptyNotificationIcon from 'src/assets/icons/emptynotification.svg';

interface Props {
  text: string;
}

export const NoAssignedRoles = (props: Props) => {
  const { text } = props;

  return (
    <Paper variant="outlined">
      <Stack alignItems="center" paddingY={10} spacing={2}>
        <EmptyNotificationIcon />
        <Typography sx={{ marginTop: 1 }}>{text}</Typography>
      </Stack>
    </Paper>
  );
};
