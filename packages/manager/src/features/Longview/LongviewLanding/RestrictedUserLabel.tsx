import { Typography } from '@linode/ui';
import * as React from 'react';

interface Props {
  label: string;
  subtext: string;
}

export const RestrictedUserLabel = React.memo((props: Props) => {
  return (
    <React.Fragment>
      <Typography>
        <strong>{props.label}</strong>
      </Typography>
      <Typography>{props.subtext}</Typography>
    </React.Fragment>
  );
});
