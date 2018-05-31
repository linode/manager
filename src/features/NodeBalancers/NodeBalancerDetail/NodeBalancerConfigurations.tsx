import * as React from 'react';
import * as Joi from 'joi';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import {
//  append,
//  clamp,
//  compose,
  clone,
  defaultTo,
//  lensPath,
//  map,
//  over,
  path,
  pathOr,
//  reduce,
  filter,
  set,
  view,
} from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Typography from 'material-ui/Typography';

import {
  getNodeBalancerConfigs,
  updateNodeBalancerConfig,
  createNodeBalancerConfigSchema,
} from 'src/services/nodebalancers';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

import { lensFrom, validationErrorsToFieldErrors } from '../NodeBalancerCreate';
import NodeBalancerConfigPanel from '../NodeBalancerConfigPanel';

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
  unmodifiedConfigs: Linode.NodeBalancerConfig[];
  configErrors: Linode.ApiFieldError[][];
  panelMessages: string[];
}

type CombinedProps =
  Props
  & RouteProps
  & WithStyles<ClassNames>
  & PreloadedProps;

class NodeBalancerConfigurations extends React.Component<CombinedProps, State> {
  state: State = {
    configs: pathOr([], ['response', 'data'], this.props.configs),
    unmodifiedConfigs: pathOr([], ['response', 'data'], this.props.configs),
    configErrors: [],
    panelMessages: [],
  };

  updateConfig = (idx: number) => {
    const { match: { params: { nodeBalancerId } } } = this.props;
    const config = this.state.configs[idx];

    const configPayload: Partial<Linode.NodeBalancerConfig> = filter(
      el => el !== undefined,
      {
        ...config,
        check_body: config.check_body || undefined,
        check_path: config.check_path || undefined,
        ssl_cert: config.ssl_cert === '<REDACTED>'
          ? undefined
          : config.ssl_cert || undefined,
        ssl_key: config.ssl_key === '<REDACTED>'
          ? undefined
          : config.ssl_key || undefined,
        ssl_commonname: config.ssl_commonname || undefined,
        ssl_fingerprint: config.ssl_fingerprint || undefined,
        nodes_status: undefined,
        id: undefined,
        nodebalancer_id: undefined,
      },
    );

    // first, validate client-side
    const { error: validationErrors } = Joi.validate(
      configPayload,
      createNodeBalancerConfigSchema,
      { abortEarly: false },
    );

    if (validationErrors) {
      const newErrors = clone(this.state.configErrors);
      newErrors[idx] = validationErrorsToFieldErrors(validationErrors);
      this.setState({ configErrors: newErrors });
      return;
    }

    updateNodeBalancerConfig(nodeBalancerId!, config.id, configPayload)
      .then((nodeBalancerConfig) => {
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs[idx] = nodeBalancerConfig;
        // update config data for reverting edits
        const newUnmodifiedConfigs = clone(this.state.unmodifiedConfigs);
        newUnmodifiedConfigs[idx] = nodeBalancerConfig;
        // replace success message with a new one
        const newMessages = [];
        newMessages[idx] = 'NodeBalancer config updated successfully';
        // update errors
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = [];
        this.setState({
          configs: newConfigs,
          unmodifiedConfigs: newUnmodifiedConfigs,
          panelMessages: newMessages,
          configErrors: newErrors,
        });
      })
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        this.setState({ configErrors: newErrors });
      });
  }

  cancelEditing = () => {
    this.setState({ configs: this.state.unmodifiedConfigs });
  }

  render() {
    const { classes } = this.props;
    const { configs, panelMessages } = this.state;

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
        {configs.map((config, idx) => {
          const lensTo = lensFrom(['configs', idx]);

          const algorithmLens = lensTo(['algorithm']);
          const checkPassiveLens = lensTo(['check_passive']);
          const checkBodyLens = lensTo(['check_body']);
          const checkPathLens = lensTo(['check_path']);
          const portLens = lensTo(['port']);
          const protocolLens = lensTo(['protocol']);
          const healthCheckTypeLens = lensTo(['check']);
          const healthCheckAttemptsLens = lensTo(['check_attempts']);
          const healthCheckIntervalLens = lensTo(['check_interval']);
          const healthCheckTimeoutLens = lensTo(['check_timeout']);
          const sessionStickinessLens = lensTo(['stickiness']);
          const sslCertificateLens = lensTo(['ssl_cert']);
          const privateKeyLens = lensTo(['ssl_key']);

          return <ExpansionPanel
            key={idx}
            defaultExpanded={true}
            heading={`Port ${config.port}`}
            success={panelMessages[idx]}
          >
            <NodeBalancerConfigPanel
              forEdit
              onSave={() => this.updateConfig(idx)}
              onCancel={() => this.cancelEditing()}
              onDelete={() => console.log('deleting')}

              errors={this.state.configErrors[idx]}

              algorithm={defaultTo('roundrobin', view(algorithmLens, this.state))}
              onAlgorithmChange={(algorithm: string) =>
                this.setState(state =>
                  set(algorithmLens, algorithm, state))}

              checkPassive={defaultTo(true, view(checkPassiveLens, this.state))}
              onCheckPassiveChange={(checkPassive: boolean) =>
                this.setState(state =>
                  set(checkPassiveLens, checkPassive, state))}

              checkBody={defaultTo('', view(checkBodyLens, this.state))}
              onCheckBodyChange={(checkBody: string) =>
                this.setState(state =>
                  set(checkBodyLens, checkBody, state))}

              checkPath={defaultTo('', view(checkPathLens, this.state))}
              onCheckPathChange={(checkPath: string) =>
                this.setState(state =>
                  set(checkPathLens, checkPath, state))}

              port={defaultTo(80, view(portLens, this.state))}
              onPortChange={(port: string | number) =>
                this.setState(state =>
                  set(portLens, port, state))}

              protocol={defaultTo('http', view(protocolLens, this.state))}
              onProtocolChange={(protocol: string) =>
                this.setState(state =>
                  set(protocolLens, protocol, state))}

              healthCheckType={defaultTo('connection', view(healthCheckTypeLens, this.state))}
              onHealthCheckTypeChange={(healthCheckType: string) =>
                this.setState(state =>
                  set(healthCheckTypeLens, healthCheckType, state))}

              healthCheckAttempts={defaultTo(2, view(healthCheckAttemptsLens, this.state))}
              onHealthCheckAttemptsChange={(healthCheckAttempts: string) =>
                this.setState(state =>
                  set(healthCheckAttemptsLens, healthCheckAttempts, state))}

              healthCheckInterval={defaultTo(5, view(healthCheckIntervalLens, this.state))}
              onHealthCheckIntervalChange={(healthCheckInterval: number | string) =>
                this.setState(state =>
                  set(healthCheckIntervalLens, healthCheckInterval, state))}

              healthCheckTimeout={defaultTo(3, view(healthCheckTimeoutLens, this.state))}
              onHealthCheckTimeoutChange={(healthCheckTimeout: number | string) =>
                this.setState(state =>
                  set(healthCheckTimeoutLens, healthCheckTimeout, state))}

              sessionStickiness={defaultTo('table', view(sessionStickinessLens, this.state))}
              onSessionStickinessChange={(sessionStickiness: number | string) =>
                this.setState(state =>
                  set(sessionStickinessLens, sessionStickiness, state))}

              sslCertificate={defaultTo('', view(sslCertificateLens, this.state))}
              onSslCertificateChange={(sslCertificate: string) =>
                this.setState(state =>
                  set(sslCertificateLens, sslCertificate, state))}

              privateKey={defaultTo('', view(privateKeyLens, this.state))}
              onPrivateKeyChange={(privateKey: string) =>
                this.setState(state =>
                  set(privateKeyLens, privateKey, state))}

              // nodes={this.state.nodeBalancerFields.configs[idx].nodes}
              nodes={[]}

              // addNode={() => this.addNodeBalancerConfigNode(idx)}
              addNode={() => undefined}

              // removeNode={this.removeNodeBalancerConfigNode(idx)}
              removeNode={() => undefined}

              // onNodeLabelChange={(nodeIndex, value) =>
              //   this.onNodeLabelChange(idx, nodeIndex, value)}
              onNodeLabelChange={() => undefined}

              // onNodeAddressChange={(nodeIndex, value) =>
              //   this.onNodeAddressChange(idx, nodeIndex, value)}
              onNodeAddressChange={() => undefined}

              // onNodeWeightChange={(nodeIndex, value) =>
              //   this.onNodeWeightChange(idx, nodeIndex, value)}
              onNodeWeightChange={() => undefined}

              // onNodeModeChange={(nodeIndex, value) =>
              //   this.onNodeModeChange(idx, nodeIndex, value)}
              onNodeModeChange={() => undefined}
            />
          </ExpansionPanel>;
        })}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader<CombinedProps>({
  configs: (props) => {
    const { match: { params: { nodeBalancerId } } } = props;
    return getNodeBalancerConfigs(nodeBalancerId!);
  },
});

export default withRouter(styled(preloaded(NodeBalancerConfigurations))) as any;
