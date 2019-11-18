import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Divider from 'src/components/core/Divider';
import Typography from 'src/components/core/Typography';
import LineGraph, { Props as LineGraphProps } from 'src/components/LineGraph';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  title: {
    fontSize: theme.spacing(2.5),
    '& > span': {
      color: theme.color.grey4
    }
  }
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
    <React.Fragment>
      <Typography className={classes.title} variant="h6">
        {title}&nbsp;<span>({subtitle})</span>
      </Typography>
      <Divider type="landingHeader" className={classes.divider} />
      <LineGraph {...rest} />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewLineGraph);
