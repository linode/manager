import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import LineGraph, { Props as LineGraphProps } from 'src/components/LineGraph';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props extends LineGraphProps {
  title: string;
  subtitle: string;
}

type CombinedProps = Props;

const LongviewLineGraph: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { title, subtitle, ...rest } = props;

  return (
    <div className={classes.root}>
      <LineGraph {...rest} />
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewLineGraph);
