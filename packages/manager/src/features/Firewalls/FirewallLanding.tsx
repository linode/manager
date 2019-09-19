import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'blue'
  }
}));

type CombinedProps = RouteComponentProps<{}>;

const FirewallLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return <div className={classes.root}>hello world</div>;
};

export default compose<CombinedProps, {}>(React.memo)(FirewallLanding);
