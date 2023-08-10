import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';

interface Props {
  className?: string;
  error?: string;
  title?: string;
}

export const Panel = (props: React.PropsWithChildren<Props>) => {
  const { children, error, title } = props;

  return (
    <Paper className={props.className} data-qa-tp="Select Image">
      {error && <Notice error text={error} />}
      <Typography data-qa-tp="Select Image" variant="h2">
        {title || 'Select an Image'}
      </Typography>
      {children}
    </Paper>
  );
};
