import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'blue'
  }
}));

type CombinedProps = RouteComponentProps<{}> & FireProps;

const FirewallLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  React.useEffect(() => {
    props.getFirewalls({ hello: 'hello' }, { world: 'world' });
  }, []);

  return <div className={classes.root}>hello world</div>;
};

export default compose<CombinedProps, {}>(
  React.memo,
  withFirewalls<{}, CombinedProps>()
)(FirewallLanding);
