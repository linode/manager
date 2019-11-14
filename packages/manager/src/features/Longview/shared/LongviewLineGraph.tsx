import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {
  title: string;
  subtitle: string;
}

type CombinedProps = Props;

const LongviewLineGraph: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return <div className={classes.root}>hello world</div>;
};

export default compose<CombinedProps, Props>(React.memo)(LongviewLineGraph);
