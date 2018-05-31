import * as React from 'react';
import { pathOr } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Typography from 'material-ui/Typography';

import { getNodeBalancerConfigs } from 'src/services/nodebalancers';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

type ClassNames =
  'root'
  | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {}

type MatchProps = { nodeBalancerId?: number };

type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  configs: PromiseLoaderResponse<Linode.ResourcePage<Linode.NodeBalancerConfig>>;
}

interface State {
  configs: Linode.NodeBalancerConfig[];
}

type CombinedProps =
  Props
  & RouteProps
  & WithStyles<ClassNames>
  & PreloadedProps;

class NodeBalancerConfigurations extends React.Component<CombinedProps, State> {
  state: State = {
    configs: pathOr([], ['response', 'data'], this.props.configs),
  };

  render() {
    const { classes } = this.props;
    const { configs } = this.state;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              NodeBalancer Configurations
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <IconTextLink
                  SideIcon={PlusSquare}
                  onClick={() => console.log('add configuration')}
                  title="Add a Configuration"
                  text="Add a Configuration"
                >
                  Add a Configuration
                </IconTextLink>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {configs.map(config => <div key={config.id}>{config.id}</div>)}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader<CombinedProps>({
  linodes: (props) => {
    const { match: { params: { nodeBalancerId } } } = props;
    return getNodeBalancerConfigs(nodeBalancerId!);
  },
});

export default withRouter(styled(preloaded(NodeBalancerConfigurations))) as any;
