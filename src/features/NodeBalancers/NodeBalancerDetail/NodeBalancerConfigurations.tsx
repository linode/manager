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
  compose,
  append,
  clone,
  defaultTo,
  path,
  lensPath,
  lensIndex,
  pathOr,
  set,
  view,
  over,
  map,
  Lens,
} from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Typography from 'material-ui/Typography';

import {
  getNodeBalancerConfigs,
  updateNodeBalancerConfig,
  deleteNodeBalancerConfig,
  createNodeBalancerConfigSchema,
  createNodeBalancerConfigNodeSchema,
  getNodeBalancerConfigNodes,
  createNodeBalancerConfigNode,
  updateNodeBalancerConfigNode,
  deleteNodeBalancerConfigNode,
} from 'src/services/nodebalancers';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';

import { lensFrom, validationErrorsToFieldErrors } from '../NodeBalancerCreate';
import NodeBalancerConfigPanel from '../NodeBalancerConfigPanel';
import {
  nodeForRequest,
  transformConfigsForRequest,
  NodeBalancerConfigFields,
  formatAddress,
  parseAddress,
  parseAddresses,
} from '../utils';

type ClassNames =
  'root'
  | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

type MatchProps = { nodeBalancerId?: number };
type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  configs: PromiseLoaderResponse<Linode.ResourcePage<NodeBalancerConfigFields>>;
}

interface State {
  configs: NodeBalancerConfigFields[];
  unmodifiedConfigs: NodeBalancerConfigFields[];
  configErrors: Linode.ApiFieldError[][];
  configSubmitting: boolean[];
  panelMessages: string[];
  deleteConfigConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    idToDelete?: number;
  };
  deleteNodeConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    configIdxToDelete?: number;
    nodeIdxToDelete?: number;
  };
}

type CombinedProps =
  Props
  & RouteProps
  & WithStyles<ClassNames>
  & PreloadedProps;

const blankNode = (): Linode.NodeBalancerConfigNode => ({
  label: '',
  address: '',
  port: '80',
  weight: 100,
});

const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then((configs) => {
    return Promise.map(configs.data, (config) => {
      return getNodeBalancerConfigNodes(nodeBalancerId, config.id)
        .then(({ data: nodes }) => {
          /**
           * Include a blank node (for the sake of local state) that can be "added"
           * with the Add button.
           **/
          nodes.push(blankNode());
          return {
            ...config,
            nodes: parseAddresses(nodes),
          };
        });
    })
      .catch(e => []);
  });
};

class NodeBalancerConfigurations extends React.Component<CombinedProps, State> {
  static defaultDeleteConfigConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    idToDelete: undefined,
  };

  static defaultDeleteNodeConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    configIdxToDelete: undefined,
    nodeIdxToDelete: undefined,
  };

  state: State = {
    configs: pathOr([], ['response'], this.props.configs),
    unmodifiedConfigs: pathOr([], ['response'], this.props.configs),
    configErrors: [],
    configSubmitting: [],
    panelMessages: [],
    deleteConfigConfirmDialog:
      clone(NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState),
    deleteNodeConfirmDialog:
      clone(NodeBalancerConfigurations.defaultDeleteNodeConfirmDialogState),
  };

  updateConfig = (idx: number) => {
    const { match: { params: { nodeBalancerId } } } = this.props;
    const config = this.state.configs[idx];

    const configPayload: Partial<Linode.NodeBalancerConfig> =
      transformConfigsForRequest([config], true)[0];

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

    updateNodeBalancerConfig(nodeBalancerId!, config.id!, configPayload)
      .then((nodeBalancerConfig) => {
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs[idx] = nodeBalancerConfig as NodeBalancerConfigFields;
        const newNodes = clone(this.state.configs[idx].nodes);
        //    while maintaing node data
        newConfigs[idx].nodes = newNodes;

        // update config data for reverting edits
        const newUnmodifiedConfigs = clone(this.state.unmodifiedConfigs);
        newUnmodifiedConfigs[idx] = nodeBalancerConfig as NodeBalancerConfigFields;
        //    while maintaing node data
        newUnmodifiedConfigs[idx].nodes = newNodes;

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

  deleteConfig = (e: any) => {
    const { deleteConfigConfirmDialog: { idToDelete } } = this.state;
    const { match: { params: { nodeBalancerId } } } = this.props;
    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancerConfig(nodeBalancerId!, idToDelete!)
      .then((response) => {
        /* find index of deleted config */
        const idx = this.state.configs.findIndex(config => config.id === idToDelete);
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs.splice(idx, 1);
        // update config data for reverting edits
        const newUnmodifiedConfigs = clone(this.state.unmodifiedConfigs);
        newUnmodifiedConfigs.splice(idx, 1);
        this.setState({
          configs: newConfigs,
          unmodifiedConfigs: newUnmodifiedConfigs,
          deleteConfigConfirmDialog:
            clone(NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState),
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfigConfirmDialog: {
            ...this.state.deleteConfigConfirmDialog,
            submitting: false,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        });
      });
  }

  updateNodeErrors = (configIdx: number, nodeIdx: number, errors: Linode.ApiFieldError[]) => {
    this.setState(
      set(
        lensPath(['configs', configIdx, 'nodes', nodeIdx, 'errors']),
        errors,
      ),
    );
  }

  removeNode = (e: any) => {
    const { match: { params: { nodeBalancerId } } } = this.props;
    const { deleteNodeConfirmDialog: { configIdxToDelete, nodeIdxToDelete } } = this.state;
    const nodes = this.state.configs[configIdxToDelete!].nodes;
    const { id: configId } = this.state.configs[configIdxToDelete!];
    const { id: nodeId } = nodes[nodeIdxToDelete!];

    this.setState({
      deleteNodeConfirmDialog: {
        ...this.state.deleteNodeConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancerConfigNode(nodeBalancerId!, configId!, nodeId!)
      .then(() => {
        this.setState(
          over(
            lensPath(['configs', configIdxToDelete!, 'nodes']),
            nodes => nodes.filter((n: any, idx: number) => idx !== nodeIdxToDelete!),
          ),
        );
        this.setState({
          deleteNodeConfirmDialog:
            clone(NodeBalancerConfigurations.defaultDeleteNodeConfirmDialogState),
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteNodeConfirmDialog: {
            ...this.state.deleteNodeConfirmDialog,
            submitting: false,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        });
      });
  }

  addNode = (configIdx: number) => (nodeIdx: number) => {
    const { match: { params: { nodeBalancerId } } } = this.props;
    const config = this.state.configs[configIdx];
    const node = this.state.configs[configIdx].nodes[nodeIdx];

    const nodeData = nodeForRequest(node);
    /* Perform client-side validation */
    const { error } = Joi.validate(
      nodeData,
      createNodeBalancerConfigNodeSchema,
      { abortEarly: false },
    );

    if (error) {
      this.updateNodeErrors(configIdx, nodeIdx, validationErrorsToFieldErrors(error));
      return;
    }

    createNodeBalancerConfigNode(nodeBalancerId!, config.id!, formatAddress(nodeData))
      .then((node) => {
        this.setState(
          set(
            lensPath(['configs', configIdx, 'nodes']),
            compose<any, any, any>(
              /**
               * Include a blank node (for the sake of local state) that can be "added"
               * with the Add button.
               **/
              append(blankNode()),
              set(lensIndex(nodeIdx), parseAddress(node)),
            )(this.state.configs[configIdx].nodes),
          ),
        );
        /* clear errors for this node */
        this.updateNodeErrors(configIdx, nodeIdx, []);
      })
      .catch((errResponse) => {
        const errors = pathOr([], ['response', 'data', 'errors'], errResponse);
        this.updateNodeErrors(configIdx, nodeIdx, errors);
      });
  }

  updateNode = (configIdx: number, nodeIdx: number) => {
    const { match: { params: { nodeBalancerId } } } = this.props;
    const config = this.state.configs[configIdx];
    const node = this.state.configs[configIdx].nodes[nodeIdx];

    const nodeData = nodeForRequest(node);
    /* Perform client-side validation */
    const { error } = Joi.validate(
      nodeData,
      createNodeBalancerConfigNodeSchema,
      { abortEarly: false },
    );

    if (error) {
      this.updateNodeErrors(configIdx, nodeIdx, validationErrorsToFieldErrors(error));
      return;
    }

    /* set the "updating" flag for this node */
    this.setState(
      set(
        lensPath(['configs', configIdx, 'nodes']),
        map((_node: any) => {
          if (_node.id! === node.id) {
            return { ..._node, updating: true };
          }
          return _node;
        })(this.state.configs[configIdx].nodes),
      ),
    );

    updateNodeBalancerConfigNode(nodeBalancerId!, config.id!, node!.id!, formatAddress(nodeData))
      .then((node) => {
        /* clear the "updating" flag for this node */
        this.setState(
          set(
            lensPath(['configs', configIdx, 'nodes']),
            map((_node: any) => {
              if (_node.id! === node.id) {
                return { ..._node, updating: false };
              }
              return _node;
            })(this.state.configs[configIdx].nodes),
          ),
        );
        /* clear errors for this node */
        this.updateNodeErrors(configIdx, nodeIdx, []);
      })
      .catch((errResponse) => {
        /* clear the "updating" flag for this node */
        this.setState(
          set(
            lensPath(['configs', configIdx, 'nodes']),
            map((_node: any) => {
              if (_node.id! === node.id) {
                return { ..._node, updating: false };
              }
              return _node;
            })(this.state.configs[configIdx].nodes),
          ),
        );
        /* set the errors for this node */
        const errors = pathOr([], ['response', 'data', 'errors'], errResponse);
        this.updateNodeErrors(configIdx, nodeIdx, errors);
      });
  }

  setNodeValue = (cidx: number, nodeidx: number, key: string, value: any) =>
    this.setState(
      set(
        lensPath(['configs', cidx, 'nodes', nodeidx, key]),
        value,
      ))

  onNodeLabelChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'label', value)

  onNodeAddressChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'address', value)

  onNodePortChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value)

  onNodeWeightChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'weight', value)

  cancelEditing = (idx: number) => {
    // reset errors
    const newErrors = clone(this.state.configErrors);
    newErrors[idx] = [];
    this.setState({
      configs: this.state.unmodifiedConfigs,
      configErrors: newErrors,
    });
  }

  onCloseConfirmation = () => this.setState({
    deleteConfigConfirmDialog:
      clone(NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState),
    deleteNodeConfirmDialog:
      clone(NodeBalancerConfigurations.defaultDeleteNodeConfirmDialogState),
  })

  onUpdateNode = (configIdx: number) => (nodeIndex: number) =>
    this.updateNode(configIdx, nodeIndex)

  confirmationNodeError = () =>
    (this.state.deleteNodeConfirmDialog.errors || []).map(e => e.reason).join(',')

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || []).map(e => e.reason).join(',')

  updateState = (lens: Lens) => (value: any) => this.setState(set(lens, value));

  onSaveConfig = (idx: number) => () => this.updateConfig(idx);

  onCancelEditingConfig = (idx: number) => () => this.cancelEditing(idx);

  onDeleteConfig = (id: number) => () =>
    this.setState({
      deleteConfigConfirmDialog: {
        ...clone(NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState),
        open: true,
        idToDelete: id,
      },
    })

  onDeleteNode = (configIdx: number) => (nodeIdx: number) =>
    this.setState({
      deleteNodeConfirmDialog: {
        ...clone(NodeBalancerConfigurations.defaultDeleteNodeConfirmDialogState),
        open: true,
        configIdxToDelete: configIdx,
        nodeIdxToDelete: nodeIdx,
      },
    })

  renderConfig = (
    panelMessages: any[],
    configErrors: any[],
    configSubmitting: any[],
  ) => (
    config: Linode.NodeBalancerConfig & { nodes: Linode.NodeBalancerConfigNode[] }, idx: number,
    ) => {
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

    return (
      <ExpansionPanel
        key={idx}
        updateFor={[
          config,
          configSubmitting[idx],
          configErrors[idx],
        ]}
        defaultExpanded={true}
        heading={`Port ${config.port}`}
        success={panelMessages[idx]}
      >
        <NodeBalancerConfigPanel
          forEdit
          onSave={this.onSaveConfig(idx)}
          onCancel={this.onCancelEditingConfig(idx)}
          submitting={configSubmitting[idx]}
          onDelete={this.onDeleteConfig(config.id)}

          errors={configErrors[idx]}

          algorithm={defaultTo('roundrobin', view(algorithmLens, this.state))}
          onAlgorithmChange={this.updateState(algorithmLens)}

          checkPassive={defaultTo(true, view(checkPassiveLens, this.state))}
          onCheckPassiveChange={this.updateState(checkPassiveLens)}

          checkBody={defaultTo('', view(checkBodyLens, this.state))}
          onCheckBodyChange={this.updateState(checkBodyLens)}

          checkPath={defaultTo('', view(checkPathLens, this.state))}
          onCheckPathChange={this.updateState(checkPathLens)}

          port={defaultTo(80, view(portLens, this.state))}
          onPortChange={this.updateState(portLens)}

          protocol={defaultTo('http', view(protocolLens, this.state))}
          onProtocolChange={(value: any) => {
            this.updateState(protocolLens)(value);
            /* clear cert and private key upon changing protocol so that they are re-validated */
            this.setState(
              compose(
                set(sslCertificateLens, ''),
                set(privateKeyLens, ''),
              ),
            );
          }}

          healthCheckType={defaultTo('connection', view(healthCheckTypeLens, this.state))}
          onHealthCheckTypeChange={this.updateState(healthCheckTypeLens)}

          healthCheckAttempts={defaultTo(2, view(healthCheckAttemptsLens, this.state))}
          onHealthCheckAttemptsChange={this.updateState(healthCheckAttemptsLens)}

          healthCheckInterval={defaultTo(5, view(healthCheckIntervalLens, this.state))}
          onHealthCheckIntervalChange={this.updateState(healthCheckIntervalLens)}

          healthCheckTimeout={defaultTo(3, view(healthCheckTimeoutLens, this.state))}
          onHealthCheckTimeoutChange={this.updateState(healthCheckTimeoutLens)}

          sessionStickiness={defaultTo('table', view(sessionStickinessLens, this.state))}
          onSessionStickinessChange={this.updateState(sessionStickinessLens)}

          sslCertificate={defaultTo('', view(sslCertificateLens, this.state))}
          onSslCertificateChange={this.updateState(sslCertificateLens)}

          privateKey={defaultTo('', view(privateKeyLens, this.state))}
          onPrivateKeyChange={this.updateState(privateKeyLens)}

          nodes={config.nodes}

          addNode={this.addNode(idx)}

          removeNode={this.onDeleteNode(idx)}

          onUpdateNode={this.onUpdateNode(idx)}

          onNodeLabelChange={this.onNodeLabelChange(idx)}

          onNodeAddressChange={this.onNodeAddressChange(idx)}

          onNodePortChange={this.onNodePortChange(idx)}

          onNodeWeightChange={this.onNodeWeightChange(idx)}
        />
      </ExpansionPanel>
    );
  }

  renderNodeConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        data-qa-confirm-cancel
        onClick={this.removeNode}
        type="secondary"
        destructive
        loading={this.state.deleteNodeConfirmDialog.submitting}
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
  )

  renderConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        data-qa-confirm-cancel
        onClick={this.deleteConfig}
        type="secondary"
        destructive
        loading={this.state.deleteConfigConfirmDialog.submitting}
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
  )

  render() {
    const { classes } = this.props;
    const { configs, panelMessages, configErrors, configSubmitting } = this.state;

    return (
      <React.Fragment>
        <Typography
          variant="headline"
          data-qa-title
          className={classes.title}
        >
          NodeBalancer Configurations
        </Typography>
        {/* <Grid container>
          <Grid item> */}
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
          {/* </Grid>
        </Grid> */}
        {configs.map(this.renderConfig(panelMessages, configErrors, configSubmitting))}

        <ConfirmationDialog
          onClose={this.onCloseConfirmation}
          title="Confirm Deletion"
          error={this.confirmationConfigError()}
          actions={this.renderConfigConfirmationActions}
          open={this.state.deleteConfigConfirmDialog.open}
        >
          <Typography>Are you sure you want to delete this NodeBalancer Configuration?</Typography>
        </ConfirmationDialog>

        <ConfirmationDialog
          onClose={this.onCloseConfirmation}
          title="Confirm Deletion"
          error={this.confirmationNodeError()}
          actions={this.renderNodeConfirmationActions}
          open={this.state.deleteNodeConfirmDialog.open}
        >
          <Typography>Are you sure you want to delete this NodeBalancer Node?</Typography>
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
