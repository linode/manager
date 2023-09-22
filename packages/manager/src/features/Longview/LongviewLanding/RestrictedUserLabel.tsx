import * as React from 'react';

import { Typography } from 'src/components/Typography';

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
