import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    '& > h6': {
      color: theme.color.grey1,
      '& > strong': {
        color: theme.color.headline,
      },
    },
  },
}));

interface Props {
  title: string;
  helperText?: string;
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
