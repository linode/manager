import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > h6': {
      '& > strong': {
        color: theme.color.headline,
      },
      color: theme.color.grey1,
    },
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

interface Props {
  helperText?: string;
  title: string;
}

export const GraphCard: React.FC<Props> = (props) => {
  const { helperText, title } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
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
