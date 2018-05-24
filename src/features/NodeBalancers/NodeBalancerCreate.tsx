import * as React from 'react';
import {
  clamp,
  compose,
  defaultTo,
  lensPath,
  map,
  path,
  pathOr,
  set,
  view,
} from 'ramda';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import Button from 'src/components/Button';
import { createNodeBalancer } from 'src/services/nodebalancers';
import { dcDisplayNames } from 'src/constants';
import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';
import CheckoutBar from 'src/components/CheckoutBar';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import ClientConnectionThrottlePanel from './ClientConnectionThrottlePanel';
import defaultNumeric from 'src/utilities/defaultNumeric';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import NodeBalancerConfigPanel from './NodeBalancerConfigPanel';

type Styles =
  'root'
  | 'main'
  | 'sidebar';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
  main: {
  },
  sidebar: {
  },
});

interface Props {
}

interface ConnectedProps {
  regions: ExtendedRegion[];
}

interface PreloadedProps { }

type CombinedProps = Props
  & ConnectedProps
  & RouteComponentProps<{}>
  & WithStyles<Styles>
  & PreloadedProps;

interface NodeBalancerFieldsState {
  label?: string;
  region?: string;
  clientConnThrottle?: number;
}

interface NodeBalancerConfigFields {
  algorithm?: 'roundrobin' | 'leastconn' | 'source';
  check_attempts?: number; /** 1..30 */
  check_body?: string;
  check_interval?: number;
  check_passive?: boolean;
  check_path?: string;
  check_timout?: number; /** 1..30 */
  check?: 'none' | 'connection' | 'http' | 'http_body';
  cipher_suite?: 'recommended' | 'legacy';
  port?: number; /** 1..65535 */
  protocol?: 'http' | 'https' | 'tcp';
  ssl_cert?: string;
  ssl_key?: string;
  stickiness?: 'none' | 'table' | 'http_cookie';
}

interface State {
  submitting: boolean;
  nodeBalancerFields: NodeBalancerFieldsState;
  nodeBalancerConfigs: NodeBalancerConfigFields[];
  errors?: Linode.ApiFieldError[];
}

const preloaded = PromiseLoader<Props>({});

const errorResources = {
  label: 'label',
  region: 'region',
  client_conn_throttle: 'client connection throttle',
};

class NodeBalancerCreate extends React.Component<CombinedProps, State> {
  static defaultFieldsStates = {};
  static createNewNodeBalancerConfig = (): NodeBalancerConfigFields => ({
    algorithm: 'roundrobin',
    check_attempts: 2,
    check_body: '',
    check_interval: 5,
    check_passive: true,
    check_path: '',
    check_timout: 3,
    check: 'connection',
    cipher_suite: 'recommended',
    port: 80,
    protocol: 'tcp',
    ssl_cert: '',
    ssl_key: '',
    stickiness: 'table',
  })

  state: State = {
    submitting: false,
    nodeBalancerFields: NodeBalancerCreate.defaultFieldsStates,
    nodeBalancerConfigs: [
      NodeBalancerCreate.createNewNodeBalancerConfig(),
    ],
  };

  mounted: boolean = false;

  addNodeBalancerConfig = () => this.setState({
    nodeBalancerConfigs: [
      ...this.state.nodeBalancerConfigs,
      NodeBalancerCreate.createNewNodeBalancerConfig(),
    ],
  })

  createNodeBalancer = () => {
    const { nodeBalancerFields } = this.state;
    const { history } = this.props;

    /** Clear Errors */
    this.setState({ errors: undefined });

    /** Validation */
    if (!nodeBalancerFields.region) {
      return this.setState({ errors: [{ field: 'region', reason: 'A region is required.' }] });
    }

    /** Set requesting state. */
    this.setState({ submitting: true });

    /** Send request. */
    createNodeBalancer({
      ...nodeBalancerFields,
      client_conn_throttle: nodeBalancerFields.clientConnThrottle,
    })
      .then((response) => {
        history.push('/nodebalancers');
      })
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);

        if (errors) {
          return this.setState({ errors });
        }

        return this.setState({
          errors: [
            { field: 'none', reason: `An unexpected error has occured..` }],
        });
      });
  }

  render() {
    const { classes, regions } = this.props;
    const { nodeBalancerFields } = this.state;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);

    return (
      <StickyContainer>
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography variant="headline">
              Create a NodeBalancer
            </Typography>
            <LabelAndTagsPanel
              labelFieldProps={{
                label: 'NodeBalancer Label',
                value: nodeBalancerFields.label || '',
                errorText: hasErrorFor('label'),
                onChange: e => this.setState({
                  nodeBalancerFields: {
                    ...nodeBalancerFields,
                    label: e.target.value,
                  },
                }),
              }}
            />
            <SelectRegionPanel
              regions={regions}
              error={hasErrorFor('region')}
              selectedID={nodeBalancerFields.region || null}
              handleSelection={region => this.setState({
                nodeBalancerFields: {
                  ...nodeBalancerFields,
                  region,
                },
              })}
            />
            <ClientConnectionThrottlePanel
              textFieldProps={{
                errorText: hasErrorFor('client_conn_throttle'),
                value: defaultTo(0, nodeBalancerFields.clientConnThrottle),
                onChange: e => this.setState({
                  nodeBalancerFields: {
                    ...nodeBalancerFields,
                    clientConnThrottle: controlClientConnectionThrottle(e.target.value),
                  },
                }),
              }}
            />
            <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
              <Grid item>
                <Typography variant="title">NodeBalancer Settings</Typography>
              </Grid>
              {
                this.state.nodeBalancerConfigs.map((nodeBalancerConfig, idx) => {
                  const portLens = lensPath(['nodeBalancerConfigs', idx, 'port']);

                  return <NodeBalancerConfigPanel
                    port={defaultTo(80, view(portLens, this.state))}
                    onPortChange={(port: number) =>
                        this.setState(state => set(portLens, port, state))}
                  />;
                })
              }
              <Grid item>
                <Button
                  type="secondary"
                  onClick={() => this.addNodeBalancerConfig()}
                >
                  Add another Configuration
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <Sticky topOffset={-24} disableCompensation>
              {
                (props: StickyProps) => {
                  const { region } = this.state.nodeBalancerFields;
                  const { regions } = this.props;
                  let displaySections;
                  if (region) {
                    const foundRegion = regions.find(r => r.id === region);
                    if (foundRegion) {
                      displaySections = { title: foundRegion.display };
                    } else {
                      displaySections = { title: 'Unknown Region' };
                    }
                  }
                  return (
                    <CheckoutBar
                      heading={`${this.state.nodeBalancerFields.label || 'NodeBalancer'} Summary`}
                      onDeploy={() => this.createNodeBalancer()}
                      calculatedPrice={20}
                      displaySections={displaySections && [displaySections]}
                    />
                  );
                }
              }
            </Sticky>
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}
const controlClientConnectionThrottle = compose(
  clamp(0, 20),
  defaultNumeric(0),
);

const connected = connect((state: Linode.AppState) => ({
  regions: compose(
    map((region: Linode.Region) => ({
      ...region,
      display: dcDisplayNames[region.id],
    })),
    pathOr([], ['resources', 'regions', 'data', 'data']),
  )(state),
}));

const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  preloaded,
  styled,
  withRouter,
)(NodeBalancerCreate);

// const state => idx => prop =>
