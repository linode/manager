import { Paper, Typography } from '@linode/ui';
import * as React from 'react';

interface Props {
  children?: React.ReactNode;
  helperText?: string;
  title: string;
}

export const GraphCard = (props: Props) => {
  const { helperText, title } = props;

  return (
    <Paper
      sx={(theme) => ({
        '& > h6': {
          '& > strong': {
            color: theme.color.headline,
          },
        },
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
      })}
    >
      <Typography variant="subtitle1">
        <React.Fragment>
          <strong>{title}</strong>
          {!!helperText && <React.Fragment> &ndash; </React.Fragment>}
          {helperText}
        </React.Fragment>
      </Typography>
      <div>{props.children}</div>
    </Paper>
  );
};

export default GraphCard;
