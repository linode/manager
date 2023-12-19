import React from 'react';

import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';

interface Props {
  down: number;
  up: number;
}

export const EndpointHealth = (props: Props) => {
  const { down, up } = props;

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <StatusIcon status={up === 0 ? 'inactive' : 'active'} />
      <Typography noWrap>{up} up</Typography>
      <Typography>-</Typography>
      <StatusIcon status={down === 0 ? 'inactive' : 'error'} />
      <Typography noWrap>{down} down</Typography>
    </Stack>
  );
};
