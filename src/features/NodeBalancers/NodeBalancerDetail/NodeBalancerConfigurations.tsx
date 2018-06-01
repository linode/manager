import * as React from 'react';
import * as Joi from 'joi';
import * as Promise from 'bluebird';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import {
  clone,
  defaultTo,
  path,
  pathOr,
  filter,
  set,
  view,
} from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Typography from 'material-ui/Typography';

import {
  getNodeBalancerConfigs,
  updateNodeBalancerConfig,
  deleteNodeBalancerConfig,
  createNodeBalancerConfigSchema,
  getNodeBalancerConfigNodes,
} from 'src/services/nodebalancers';
import Button from 'src/components/Button';
// import IconTextLink from 'src/components/IconTextLink';
// import PlusSquare from 'src/assets/icons/plus-square.svg';
import Grid from 'src/components/Grid';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';

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

interface ConfigWithNodes extends Linode.NodeBalancerConfig {
  nodes: Linode.NodeBalancerConfigNode[];
}

interface PreloadedProps {
  configs: PromiseLoaderResponse<Linode.ResourcePage<ConfigWithNodes>>;
}

interface State {
  configs: ConfigWithNodes[];
  unmodifiedConfigs: ConfigWithNodes[];
  configErrors: Linode.ApiFieldError[][];
  configSubmitting: boolean[];
  panelMessages: string[];
  deleteConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    configIdToDelete?: number;
  };
}

type CombinedProps =
  Props
  & RouteProps
  & WithStyles<ClassNames>
  & PreloadedProps;

const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then((configs) => {
    return Promise.map(configs.data, (config) => {
      return getNodeBalancerConfigNodes(nodeBalancerId, config.id)
        .then(({ data: nodes }) => {
          return {
            ...config,
            nodes,
          };
        });
    })
    .catch(e => []);
  });
};

class NodeBalancerConfigurations extends React.Component<CombinedProps, State> {
  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    configIdToDelete: undefined,
  };

  state: State = {
    configs: pathOr([], ['response'], this.props.configs),
    unmodifiedConfigs: pathOr([], ['response'], this.props.configs),
    configErrors: [],
    configSubmitting: [],
    panelMessages: [],
    deleteConfirmDialog: NodeBalancerConfigurations.defaultDeleteConfirmDialogState,
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

    const newSubmitting = clone(this.state.configSubmitting);
    newSubmitting[idx] = true;
    this.setState({
      configSubmitting: newSubmitting,
    });

    updateNodeBalancerConfig(nodeBalancerId!, config.id, configPayload)
      .then((nodeBalancerConfig) => {
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs[idx] = nodeBalancerConfig as ConfigWithNodes;
        //    while maintaing node data
        newConfigs[idx].nodes = this.state.configs[idx].nodes;

        // update config data for reverting edits
        const newUnmodifiedConfigs = clone(this.state.unmodifiedConfigs);
        newUnmodifiedConfigs[idx] = nodeBalancerConfig as ConfigWithNodes;
        //    while maintaing node data
        newUnmodifiedConfigs[idx].nodes = this.state.unmodifiedConfigs[idx].nodes;

        // replace success message with a new one
        const newMessages = [];
        newMessages[idx] = 'NodeBalancer config updated successfully';

        // reset errors
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = [];

        // reset submitting
        const newSubmitting = clone(this.state.configSubmitting);
        newSubmitting[idx] = false;

        this.setState({
          configs: newConfigs,
          unmodifiedConfigs: newUnmodifiedConfigs,
          panelMessages: newMessages,
          configErrors: newErrors,
          configSubmitting: newSubmitting,
        });
      })
      .catch((errorResponse) => {
        // update errors
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        // reset submitting
        const newSubmitting = clone(this.state.configSubmitting);
        newSubmitting[idx] = false;
        this.setState({
          configErrors: newErrors,
          configSubmitting: newSubmitting,
        });
      });
  }

  deleteConfig = () => {
    const { deleteConfirmDialog: { configIdToDelete } } = this.state;
    const { match: { params: { nodeBalancerId } } } = this.props;
    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancerConfig(nodeBalancerId!, configIdToDelete!)
      .then((response) => {
        /* find index of deleted config */
        const idx = this.state.configs.findIndex(config => config.id === configIdToDelete);
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs.splice(idx, 1);
        // update config data for reverting edits
        const newUnmodifiedConfigs = clone(this.state.unmodifiedConfigs);
        newUnmodifiedConfigs.splice(idx, 1);
        this.setState({
          configs: newConfigs,
          unmodifiedConfigs: newUnmodifiedConfigs,
          deleteConfirmDialog: NodeBalancerConfigurations.defaultDeleteConfirmDialogState,
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfirmDialog: {
            ...this.state.deleteConfirmDialog,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        });
      });
  }

  cancelEditing = (idx: number) => {
    // reset errors
    const newErrors = clone(this.state.configErrors);
    newErrors[idx] = [];
    this.setState({
      configs: this.state.unmodifiedConfigs,
      configErrors: newErrors,
    });
  }

  render() {
    const { classes } = this.props;
    const { configs, panelMessages, configErrors, configSubmitting } = this.state;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              NodeBalancer Configurations
            </Typography>
          </Grid>
          <Grid item>
            {/* @todo: implement add config
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
            */}
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
              onCancel={() => this.cancelEditing(idx)}
              submitting={configSubmitting[idx]}
              onDelete={() => this.setState({
                deleteConfirmDialog: {
                  ...NodeBalancerConfigurations.defaultDeleteConfirmDialogState,
                  open: true,
                  configIdToDelete: config.id,
                },
              })}

              errors={configErrors[idx]}

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
              nodes={config.nodes}

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

        <ConfirmationDialog
          onClose={() => this.setState({
            deleteConfirmDialog: NodeBalancerConfigurations.defaultDeleteConfirmDialogState,
          })}
          title="Confirm Deletion"
          error={(this.state.deleteConfirmDialog.errors || []).map(e => e.reason).join(',')}
          actions={({ onClose }) =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                data-qa-confirm-cancel
                onClick={() => this.deleteConfig()}
                type="secondary"
                destructive
                loading={this.state.deleteConfirmDialog.submitting}
              >
                Delete
              </Button>
              <Button
                onClick={() => onClose()}
                type="secondary"
                className="cancel"
                data-qa-cancel-cancel
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={this.state.deleteConfirmDialog.open}
        >
          <Typography>Are you sure you want to delete this NodeBalancer Configuration?</Typography>
        </ConfirmationDialog>

      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader<CombinedProps>({
  configs: (props) => {
    const { match: { params: { nodeBalancerId } } } = props;
    return getConfigsWithNodes(nodeBalancerId!);
  },
});

export default withRouter(styled(preloaded(NodeBalancerConfigurations))) as any;
