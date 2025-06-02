import {
  createNodeBalancerConfig,
  createNodeBalancerConfigNode,
  deleteNodeBalancerConfig,
  deleteNodeBalancerConfigNode,
  getNodeBalancerConfigNodesBeta,
  getNodeBalancerConfigs,
  updateNodeBalancerConfig,
  updateNodeBalancerConfigNode,
} from '@linode/api-v4';
import { nodebalancerQueries } from '@linode/queries';
import { Accordion, ActionsPanel, Box, Button, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import {
  append,
  clone,
  compose,
  defaultTo,
  lensPath,
  over,
  set,
  view,
} from 'ramda';
import * as React from 'react';
import { compose as composeC } from 'recompose';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import PromiseLoader from 'src/components/PromiseLoader/PromiseLoader';
import { withQueryClient } from 'src/containers/withQueryClient.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { NodeBalancerConfigPanel } from '../NodeBalancerConfigPanel';
import { lensFrom } from '../NodeBalancerCreate';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  getNodeForRequest,
  parseAddress,
  parseAddresses,
  transformConfigsForRequest,
} from '../utils';

import type {
  NodeBalancerConfigFieldsWithStatus,
  NodeBalancerConfigNodeFields,
} from '../types';
import type {
  APIError,
  Grants,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
} from '@linode/api-v4';
import type { Lens } from 'ramda';
import type { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import type { WithQueryClientProps } from 'src/containers/withQueryClient.container';

const StyledPortsSpan = styled('span', {
  label: 'StyledPortsSpan',
})(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const StyledNBStatusesTypography = styled(Typography, {
  label: 'StyledNBStatusesTypography',
})(({ theme }) => ({
  display: 'block',
  [theme.breakpoints.up('sm')]: {
    display: 'inline',
  },
}));

const StyledConfigsButton = styled(Button, {
  label: 'StyledConfigsButton',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
}));

export interface NodeBalancerConfigurationsBaseProps {
  grants: Grants | undefined;
  nodeBalancerLabel: string;
  nodeBalancerRegion: string;
}

interface Params {
  params: {
    configId?: string;
    id: string;
  };
}

interface PreloadedProps {
  configs: PromiseLoaderResponse<NodeBalancerConfigFieldsWithStatus[]>;
}

interface State {
  configErrors: APIError[][];
  configs: NodeBalancerConfigFieldsWithStatus[];
  configSubmitting: boolean[];
  deleteConfigConfirmDialog: {
    errors?: APIError[];
    idxToDelete?: number;
    open: boolean;
    portToDelete?: number;
    submitting: boolean;
  };
  /*
   * If the following is set to true, then the last element of each of the above
   * arrays is related to this unsaved config.
   */
  hasUnsavedConfig: boolean;
  panelMessages: string[];
  panelNodeMessages: string[];
}

interface NodeBalancerConfigWithNodes extends NodeBalancerConfig {
  nodes: NodeBalancerConfigNode[];
}

interface NodeBalancerConfigurationsProps
  extends NodeBalancerConfigurationsBaseProps,
    Params,
    PreloadedProps,
    WithQueryClientProps {}

const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then((configs) => {
    return Promise.all(
      configs.data.map((config) => {
        return getNodeBalancerConfigNodesBeta(nodeBalancerId, config.id).then(
          ({ data: nodes }) => {
            return {
              ...config,
              nodes: parseAddresses(nodes),
            };
          }
        );
      })
    );
  });
};

const formatNodesStatus = (nodes: NodeBalancerConfigNodeFields[]) => {
  const statuses = nodes.reduce(
    (acc, node) => {
      if (node.status) {
        acc[node.status]++;
      }
      return acc;
    },
    { DOWN: 0, UP: 0, unknown: 0 }
  );

  return `Backend status: ${statuses.UP} up, ${statuses.DOWN} down${
    statuses.unknown ? `, ${statuses.unknown} unknown` : ''
  }`;
};
class NodeBalancerConfigurations extends React.Component<
  NodeBalancerConfigurationsProps,
  State
> {
  static defaultDeleteConfigConfirmDialogState = {
    errors: undefined,
    idxToDelete: undefined,
    open: false,
    portToDelete: undefined,
    submitting: false,
  };

  static defaultDeleteNodeConfirmDialogState = {
    configIdxToDelete: undefined,
    errors: undefined,
    nodeIdxToDelete: undefined,
    open: false,
    submitting: false,
  };

  static defaultFieldsStates = {
    configs: [createNewNodeBalancerConfig(true)],
  };

  state: State = {
    configErrors: [],
    configSubmitting: [],
    configs: this.props.configs?.response ?? [],
    deleteConfigConfirmDialog: clone(
      NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
    ),
    hasUnsavedConfig: false,
    panelMessages: [],
    panelNodeMessages: [],
  };

  addNode = (configIdx: number) => () => {
    this.setState(
      set(
        lensPath(['configs', configIdx, 'nodes']),
        append(createNewNodeBalancerConfigNode())(
          this.state.configs[configIdx].nodes
        )
      )
    );
  };

  addNodeBalancerConfig = () => {
    this.setState({
      configErrors: append([], this.state.configErrors),
      configSubmitting: append(false, this.state.configSubmitting),
      configs: append(createNewNodeBalancerConfig(false), this.state.configs),
      hasUnsavedConfig: true,
    });
  };

  afterHealthCheckTypeUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose<State, State, State, State, State>(
        set(
          L.checkBodyLens,
          NodeBalancerConfigurations.defaultFieldsStates.configs[0].check_body
        ),
        set(
          L.healthCheckAttemptsLens,
          NodeBalancerConfigurations.defaultFieldsStates.configs[0]
            .check_attempts
        ),
        set(
          L.healthCheckIntervalLens,
          NodeBalancerConfigurations.defaultFieldsStates.configs[0]
            .check_interval
        ),
        set(
          L.healthCheckTimeoutLens,
          NodeBalancerConfigurations.defaultFieldsStates.configs[0]
            .check_timeout
        )
      )
    );
  };

  afterProtocolUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose<State, State, State>(
        set(L.sslCertificateLens, ''),
        set(L.privateKeyLens, '')
      )
    );
  };

  clearMessages = () => {
    // clear any success messages
    this.setState({
      panelMessages: [],
      panelNodeMessages: [],
    });
  };

  clearNodeErrors = (configIdx: number) => {
    // Build paths to all node errors
    const paths = this.state.configs[configIdx].nodes.map((nodes, idxN) => {
      return ['nodes', idxN, 'errors'];
    });
    if (paths.length === 0) {
      return;
    }
    /* Map those paths to an array of updater functions */
    const setFns = paths.map((eachPath: any[]) => {
      return set(lensPath(['configs', configIdx, ...eachPath]), []);
    });
    /* Apply all of those update functions at once to state */
    this.setState((compose as any)(...setFns));
  };

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || [])
      .map((e) => e.reason)
      .join(',');

  createNode = (configIdx: number, nodeIdx: number) => {
    const { id: nodeBalancerId } = this.props.params;
    const config = this.state.configs[configIdx];
    const node = this.state.configs[configIdx].nodes[nodeIdx];

    const nodeData = getNodeForRequest(node, config);

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    return createNodeBalancerConfigNode(
      Number(nodeBalancerId),
      config.id,
      nodeData
    )
      .then((responseNode) =>
        this.handleNodeSuccess(responseNode, configIdx, nodeIdx)
      )
      .catch((errResponse) =>
        this.handleNodeFailure(errResponse, configIdx, nodeIdx)
      );
  };

  deleteConfig = () => {
    const {
      deleteConfigConfirmDialog: { idxToDelete },
    } = this.state;
    if (idxToDelete === undefined) {
      return;
    }

    // remove an unsaved config from state
    const config = this.state.configs[idxToDelete];
    if (config.modifyStatus === 'new') {
      const newConfigs = clone(this.state.configs);
      newConfigs.splice(idxToDelete, 1);
      this.setState({
        configs: newConfigs,
        deleteConfigConfirmDialog: clone(
          NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
        ),
        /* Important to reset this so that we can add another config */
        hasUnsavedConfig: false,
      });
      return;
    }

    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    const { id: nodeBalancerId } = this.props.params;

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    // actually delete a real config
    deleteNodeBalancerConfig(Number(nodeBalancerId), config.id)
      .then((_) => {
        this.props.queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(Number(nodeBalancerId))
            ._ctx.configurations.queryKey,
        });
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs.splice(idxToDelete, 1);
        this.setState({
          configs: newConfigs,
          deleteConfigConfirmDialog: clone(
            NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
          ),
        });
      })
      .catch((err) => {
        return this.setState(
          {
            deleteConfigConfirmDialog: {
              ...this.state.deleteConfigConfirmDialog,
              errors: err,
              submitting: false,
            },
          },
          () => {
            scrollErrorIntoView(`${idxToDelete}`);
          }
        );
      });
  };

  deleteNode = (configIdx: number, nodeIdx: number) => {
    const { id: nodeBalancerId } = this.props.params;

    if (!nodeBalancerId) {
      return;
    }

    const { configs } = this.state;
    if (!configs) {
      return;
    }

    const config = configs[configIdx];
    if (!config || !config.id) {
      return;
    }
    const node = config.nodes[nodeIdx];
    if (!node || !node.id) {
      return;
    }

    return deleteNodeBalancerConfigNode(
      Number(nodeBalancerId),
      config.id,
      node.id
    )
      .then(() => {
        this.setState(
          over(lensPath(['configs', configIdx!, 'nodes']), (nodes) =>
            nodes.filter((n: any, idx: number) => idx !== nodeIdx!)
          )
        );
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch((_) => {
        /* Return false as a Promise for the sake of aggregating results */
        return false;
        /* @todo:
            place an error on the node and set toDelete to undefined
        */
      });
  };

  fieldErrorsToNodePathErrors = (errors: APIError[]) => {
    /* Return objects with this shape
        {
          path: [0, 'errors'],
          error: {
            field: 'label',
            reason: 'label cannot be blank"
          }
        }
    */
    return errors.reduce((acc: any, error: APIError) => {
      /**
       * Regex conditions are as follows:
       *
       * must match "nodes["
       * must have a digit 0-9
       * then have "]"
       * must end with ".anywordhere"
       */
      const match = /^nodes\[(\d+)\].(\w+)$/.exec(error.field!);
      if (match && match[1] && match[2]) {
        return [
          ...acc,
          {
            error: {
              field: match[2],
              reason: error.reason,
            },
            path: [+match[1], 'errors'],
          },
        ];
      }
      return acc;
    }, []);
  };

  handleNodeFailure = (
    errResponse: APIError[],
    configIdx: number,
    nodeIdx: number
  ) => {
    /* Set errors for this node */
    const errors = getAPIErrorOrDefault(errResponse);
    this.updateNodeErrors(configIdx, nodeIdx, errors);
    /* Return false as a Promise for the sake of aggregating results */
    return false;
  };

  handleNodeSuccess = (
    responseNode: NodeBalancerConfigNode,
    configIdx: number,
    nodeIdx: number
  ) => {
    /* Set the new Node data including the ID
      This also clears the errors and modified status. */
    this.setState(
      set(
        lensPath(['configs', configIdx, 'nodes', nodeIdx]),
        parseAddress(responseNode)
      )
    );
    /* Return true as a Promise for the sake of aggregating results */
    return true;
  };

  isNodeBalancerReadOnly = () => {
    const { grants } = this.props;
    const { id: nodeBalancerId } = this.props.params;
    return Boolean(
      grants?.nodebalancer?.some(
        (grant) =>
          grant.id === Number(nodeBalancerId) &&
          grant.permissions === 'read_only'
      )
    );
  };

  onCloseConfirmation = () =>
    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        open: false,
      },
    });

  onDeleteConfig = (idx: number, port: number) => () => {
    this.setState({
      deleteConfigConfirmDialog: {
        ...clone(
          NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
        ),
        idxToDelete: idx,
        open: true,
        portToDelete: port,
      },
    });
  };

  onNodeAddressChange =
    (configIdx: number) =>
    (nodeIdx: number, value: string, subnetId?: number) => {
      this.setNodeValue(configIdx, nodeIdx, 'address', value);
      if (subnetId) {
        this.setNodeValue(configIdx, nodeIdx, 'subnet_id', subnetId);
      }
    };

  onNodeLabelChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'label', value);

  onNodeModeChange =
    (configIdx: number) => (nodeIdx: number, value: string) => {
      this.setNodeValue(configIdx, nodeIdx, 'mode', value);
    };

  onNodePortChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value);

  onNodeWeightChange =
    (configIdx: number) => (nodeIdx: number, value: string) =>
      this.setNodeValue(configIdx, nodeIdx, 'weight', value);

  onSaveConfig = (idx: number) => () => this.saveConfig(idx);

  removeNode = (configIdx: number) => (nodeIdx: number) => {
    this.clearMessages();
    if (this.state.configs[configIdx].nodes[nodeIdx].id !== undefined) {
      /* If the node has an ID, mark it for deletion when the user saves the config */
      this.setState(
        set(
          lensPath(['configs', configIdx, 'nodes', nodeIdx, 'modifyStatus']),
          'delete'
        )
      );
    } else {
      /* If the node doesn't have an ID, remove it from state immediately */
      this.setState(
        over(lensPath(['configs', configIdx, 'nodes']), (nodes) =>
          nodes.filter((n: any, idx: number) => idx !== nodeIdx)
        )
      );
    }
  };

  render() {
    const { nodeBalancerLabel } = this.props;
    const {
      configErrors,
      configSubmitting,
      configs,
      hasUnsavedConfig,
      panelMessages,
    } = this.state;

    const isNodeBalancerReadOnly = this.isNodeBalancerReadOnly();

    return (
      <div>
        <DocumentTitleSegment
          segment={`${nodeBalancerLabel} - Configurations`}
        />
        {Array.isArray(configs) &&
          configs.map(
            this.renderConfig(panelMessages, configErrors, configSubmitting)
          )}

        {!hasUnsavedConfig && (
          <Box sx={{ marginTop: '16px' }}>
            <StyledConfigsButton
              buttonType="outlined"
              data-qa-add-config
              disabled={isNodeBalancerReadOnly}
              onClick={() => this.addNodeBalancerConfig()}
            >
              {configs.length === 0
                ? 'Add a Configuration'
                : 'Add Another Configuration'}
            </StyledConfigsButton>
          </Box>
        )}

        <ConfirmationDialog
          actions={
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'confirm-cancel',
                label: 'Delete',
                loading: this.state.deleteConfigConfirmDialog.submitting,
                onClick: this.deleteConfig,
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel-cancel',
                label: 'Cancel',
                onClick: this.onCloseConfirmation,
              }}
              style={{ padding: 0 }}
            />
          }
          error={this.confirmationConfigError()}
          onClose={this.onCloseConfirmation}
          open={this.state.deleteConfigConfirmDialog.open}
          title={
            typeof this.state.deleteConfigConfirmDialog.portToDelete !==
            'undefined'
              ? `Delete this configuration on port ${this.state.deleteConfigConfirmDialog.portToDelete}?`
              : 'Delete this configuration?'
          }
        >
          <Typography>
            Are you sure you want to delete this NodeBalancer Configuration?
          </Typography>
        </ConfirmationDialog>
      </div>
    );
  }

  renderConfig =
    (panelMessages: string[], configErrors: any[], configSubmitting: any[]) =>
    (config: NodeBalancerConfigWithNodes, idx: number) => {
      const isNewConfig =
        this.state.hasUnsavedConfig && idx === this.state.configs.length - 1;
      const { panelNodeMessages } = this.state;

      const lensTo = lensFrom(['configs', idx]);

      // Check whether config is expended based on the URL
      const expandedConfigId = this.props.params.configId;
      const isExpanded = expandedConfigId
        ? parseInt(expandedConfigId, 10) === config.id
        : false;

      const isNodeBalancerReadOnly = this.isNodeBalancerReadOnly();

      const L = {
        algorithmLens: lensTo(['algorithm']),
        checkBodyLens: lensTo(['check_body']),
        checkPassiveLens: lensTo(['check_passive']),
        checkPathLens: lensTo(['check_path']),
        healthCheckAttemptsLens: lensTo(['check_attempts']),
        healthCheckIntervalLens: lensTo(['check_interval']),
        healthCheckTimeoutLens: lensTo(['check_timeout']),
        healthCheckTypeLens: lensTo(['check']),
        portLens: lensTo(['port']),
        privateKeyLens: lensTo(['ssl_key']),
        protocolLens: lensTo(['protocol']),
        proxyProtocolLens: lensTo(['proxy_protocol']),
        sessionStickinessLens: lensTo(['stickiness']),
        sslCertificateLens: lensTo(['ssl_cert']),
        udpCheckPortLens: lensTo(['udp_check_port']),
      };

      return (
        <Accordion
          defaultExpanded={isNewConfig || isExpanded}
          heading={
            <React.Fragment>
              <StyledPortsSpan>
                Port {config.port !== undefined ? config.port : ''}
              </StyledPortsSpan>
              <StyledNBStatusesTypography>
                {formatNodesStatus(config.nodes)}
              </StyledNBStatusesTypography>
            </React.Fragment>
          }
          key={`nb-config-${idx}`}
          success={panelMessages[idx]}
        >
          <NodeBalancerConfigPanel
            addNode={this.addNode(idx)}
            algorithm={view(L.algorithmLens, this.state)}
            checkBody={view(L.checkBodyLens, this.state)}
            checkPassive={view(L.checkPassiveLens, this.state)}
            checkPath={view(L.checkPathLens, this.state)}
            configIdx={idx}
            disabled={isNodeBalancerReadOnly}
            errors={configErrors[idx]}
            forEdit
            healthCheckAttempts={view(L.healthCheckAttemptsLens, this.state)}
            healthCheckInterval={view(L.healthCheckIntervalLens, this.state)}
            healthCheckTimeout={view(L.healthCheckTimeoutLens, this.state)}
            healthCheckType={view(L.healthCheckTypeLens, this.state)}
            nodeBalancerRegion={this.props.nodeBalancerRegion}
            nodeMessage={panelNodeMessages[idx]}
            nodes={config.nodes}
            onAlgorithmChange={this.updateState(L.algorithmLens)}
            onCheckBodyChange={this.updateState(L.checkBodyLens)}
            onCheckPassiveChange={this.updateState(L.checkPassiveLens)}
            onCheckPathChange={this.updateState(L.checkPathLens)}
            onDelete={this.onDeleteConfig(idx, config.port)}
            onHealthCheckAttemptsChange={this.updateState(
              L.healthCheckAttemptsLens
            )}
            onHealthCheckIntervalChange={this.updateState(
              L.healthCheckIntervalLens
            )}
            onHealthCheckTimeoutChange={this.updateState(
              L.healthCheckTimeoutLens
            )}
            onHealthCheckTypeChange={this.updateState(
              L.healthCheckTypeLens,
              L,
              this.afterHealthCheckTypeUpdate
            )}
            onNodeAddressChange={this.onNodeAddressChange(idx)}
            onNodeLabelChange={this.onNodeLabelChange(idx)}
            onNodeModeChange={this.onNodeModeChange(idx)}
            onNodePortChange={this.onNodePortChange(idx)}
            onNodeWeightChange={this.onNodeWeightChange(idx)}
            onPortChange={this.updateState(L.portLens)}
            onPrivateKeyChange={this.updateState(L.privateKeyLens)}
            onProtocolChange={this.updateState(
              L.protocolLens,
              L,
              this.afterProtocolUpdate
            )}
            onProxyProtocolChange={this.updateState(L.proxyProtocolLens)}
            onSave={this.onSaveConfig(idx)}
            onSessionStickinessChange={this.updateState(
              L.sessionStickinessLens
            )}
            onSslCertificateChange={this.updateState(L.sslCertificateLens)}
            onUdpCheckPortChange={this.updateState(L.udpCheckPortLens, L)}
            port={view(L.portLens, this.state)}
            privateKey={view(L.privateKeyLens, this.state)}
            protocol={view(L.protocolLens, this.state)}
            proxyProtocol={view(L.proxyProtocolLens, this.state)}
            removeNode={this.removeNode(idx)}
            sessionStickiness={view(L.sessionStickinessLens, this.state)}
            sslCertificate={view(L.sslCertificateLens, this.state)}
            submitting={configSubmitting[idx]}
            udpCheckPort={view(L.udpCheckPortLens, this.state)}
          />
        </Accordion>
      );
    };

  resetSubmitting = (configIdx: number) => {
    // reset submitting
    const newSubmitting = clone(this.state.configSubmitting);
    newSubmitting[configIdx] = false;
    this.setState({
      configSubmitting: newSubmitting,
    });
  };

  saveConfig = (idx: number) => {
    const config = this.state.configs[idx];

    const configPayload: NodeBalancerConfigFieldsWithStatus =
      transformConfigsForRequest([config])[0];

    // clear node errors for this config if there are any
    this.clearNodeErrors(idx);

    this.clearMessages();

    const newSubmitting = clone(this.state.configSubmitting);
    newSubmitting[idx] = true;
    this.setState({
      configSubmitting: newSubmitting,
    });

    if (config.modifyStatus !== 'new') {
      // If updating Config, perform the update and Node operations simultaneously.
      this.saveConfigUpdatePath(idx, config, configPayload);
    } else {
      // If it's a new Config, perform the update and Node operations sequentially.
      this.saveConfigNewPath(idx, config, configPayload);
    }
  };

  saveConfigNewPath = (
    idx: number,
    config: NodeBalancerConfigFieldsWithStatus,
    configPayload: NodeBalancerConfigFieldsWithStatus
  ) => {
    /*
     * Create a config and then its nodes.
     * If the config creation succeeds here, the UpdatePath will be used upon
     * subsequent saves.
     */

    const { id: nodeBalancerId } = this.props.params;

    if (!nodeBalancerId) {
      return;
    }

    createNodeBalancerConfig(Number(nodeBalancerId), configPayload)
      .then((nodeBalancerConfig) => {
        this.props.queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(Number(nodeBalancerId))
            ._ctx.configurations.queryKey,
        });
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs[idx] = { ...nodeBalancerConfig, nodes: [] };
        const newNodes = clone(this.state.configs[idx].nodes);
        //    while maintaining node data
        newConfigs[idx].nodes = newNodes;

        // reset errors
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = [];

        this.setState(
          {
            configErrors: newErrors,
            configs: newConfigs,
          },
          () => {
            // replace success message with a new one
            const newMessages = [];
            newMessages[idx] =
              'New NodeBalancer Configuration created successfully';
            this.setState({
              panelMessages: newMessages,
            });

            // Allow the user to add yet another config
            this.setState({
              hasUnsavedConfig: false,
            });

            // Execute Node operations now that the config has been created
            const nodeUpdates = config.nodes.map((node, nodeIdx) => {
              if (node.modifyStatus !== 'delete') {
                /* All of the Nodes are new since the config was just created */
                return this.createNode(idx, nodeIdx);
              }
              return Promise.resolve(true);
            });

            /* Set the success message if all of the requests succeed */
            Promise.all([...nodeUpdates] as any)
              .then((responseVals) => {
                const success = responseVals.reduce(
                  (acc: boolean, val: boolean) => {
                    return acc && val;
                  },
                  true
                );
                if (success) {
                  // replace success message with a new one
                  const newNodeMessages = [];
                  newNodeMessages[idx] = 'All Nodes created successfully';
                  this.setState({
                    panelNodeMessages: newNodeMessages,
                  });
                }
                this.resetSubmitting(idx);
              })
              .catch((_) => {
                this.resetSubmitting(idx);
              });
          }
        );
      })
      .catch((errorResponse) => {
        // update errors
        const errors = getAPIErrorOrDefault(errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        this.setNodeErrors(idx, newErrors[idx]);
        this.setState(
          {
            configErrors: newErrors,
          },
          () => {
            scrollErrorIntoView(`${idx}`);
          }
        );
        // reset submitting
        this.resetSubmitting(idx);
      });
  };

  saveConfigUpdatePath = (
    idx: number,
    config: NodeBalancerConfigFieldsWithStatus,
    configPayload: NodeBalancerConfigFieldsWithStatus
  ) => {
    /* Update a config and its nodes simultaneously */
    const { id: nodeBalancerId } = this.props.params;

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    const nodeBalUpdate = updateNodeBalancerConfig(
      Number(nodeBalancerId),
      config.id,
      configPayload
    )
      .then((nodeBalancerConfig) => {
        this.props.queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(Number(nodeBalancerId))
            ._ctx.configurations.queryKey,
        });
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs[idx] = { ...nodeBalancerConfig, nodes: [] };
        const newNodes = clone(this.state.configs[idx].nodes);
        //    while maintaining node data
        newConfigs[idx].nodes = newNodes;

        // reset errors
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = [];

        // reset submitting
        const newSubmitting = clone(this.state.configSubmitting);
        newSubmitting[idx] = false;

        this.setState({
          configErrors: newErrors,
          configSubmitting: newSubmitting,
          configs: newConfigs,
        });
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch((errorResponse) => {
        // update errors
        const errors = getAPIErrorOrDefault(errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        this.setState(
          {
            configErrors: newErrors,
          },
          () => {
            scrollErrorIntoView(`${idx}`);
          }
        );
        this.resetSubmitting(idx);
        /* Return false as a Promise for the sake of aggregating results */
        return false;
      });

    // These Node operations execute while the config update request is being made
    const nodeUpdates = config.nodes.map((node, nodeIdx) => {
      if (node.modifyStatus === 'delete') {
        return this.deleteNode(idx, nodeIdx);
      }
      if (node.modifyStatus === 'new') {
        return this.createNode(idx, nodeIdx);
      }
      if (node.modifyStatus === 'update') {
        return this.updateNode(idx, nodeIdx);
      }
      return Promise.resolve(undefined);
    });

    /* Set the success message if all of the requests succeed */
    Promise.all([nodeBalUpdate, ...nodeUpdates])
      .then((responseVals) => {
        const [nodeBalSuccess, ...nodeResults] = responseVals;
        if (nodeBalSuccess) {
          // replace Config success message with a new one
          const newMessages = [];
          newMessages[idx] = 'NodeBalancer Configuration updated successfully';
          this.setState({
            panelMessages: newMessages,
          });
        }
        const filteredNodeResults = nodeResults.filter(
          (el) => el !== undefined
        );
        if (filteredNodeResults.length) {
          const nodeSuccess = filteredNodeResults.reduce(
            (acc: boolean, val: boolean) => {
              return acc && val;
            },
            true
          );
          if (nodeSuccess) {
            // replace Node success message with a new one
            const newMessages = [];
            newMessages[idx] = 'All Nodes updated successfully';
            this.setState({
              panelNodeMessages: newMessages,
            });
          }
        }
        this.resetSubmitting(idx);
      })
      .catch((_) => {
        this.resetSubmitting(idx);
      });
  };

  setNodeErrors = (configIdx: number, error: APIError[]) => {
    /* Map the objects with this shape
        {
          path: [0, 'errors'],
          error: {
            field: 'label',
            reason: 'label cannot be blank"
          }
        }
      to an array of functions that will append the error at the
      given path in the config state
    */
    const nodePathErrors = this.fieldErrorsToNodePathErrors(error);

    if (nodePathErrors.length === 0) {
      return;
    }

    const setFns = nodePathErrors.map((nodePathError: any) => {
      return compose(
        over(
          lensPath(['configs', configIdx, 'nodes', ...nodePathError.path]),
          append(nodePathError.error)
        ),
        defaultTo([]) as () => Array<{}>
      );
    });

    // Apply the error updater functions with a compose
    this.setState((compose as any)(...setFns), () => {
      scrollErrorIntoView(`${configIdx}`);
    });
  };

  setNodeValue = (cidx: number, nodeidx: number, key: string, value: any) => {
    this.clearMessages();
    /* Check if the node is new */
    const { modifyStatus } = this.state.configs[cidx].nodes[nodeidx];
    /* If it's not new or for deletion set it to be updated */
    if (!(modifyStatus === 'new' || modifyStatus === 'delete')) {
      this.setState(
        set(
          lensPath(['configs', cidx, 'nodes', nodeidx, 'modifyStatus']),
          'update'
        )
      );
    }
    /* Set the { key: value } pair requested */
    this.setState(
      set(lensPath(['configs', cidx, 'nodes', nodeidx, key]), value)
    );
  };

  updateNode = (configIdx: number, nodeIdx: number) => {
    const { id: nodeBalancerId } = this.props.params;
    const config = this.state.configs[configIdx];
    const node = this.state.configs[configIdx].nodes[nodeIdx];

    const nodeData = getNodeForRequest(node, config);

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }
    if (!node || !node.id) {
      return;
    }

    return updateNodeBalancerConfigNode(
      Number(nodeBalancerId),
      config.id,
      node.id,
      nodeData
    )
      .then((responseNode) =>
        this.handleNodeSuccess(responseNode, configIdx, nodeIdx)
      )
      .catch((errResponse) =>
        this.handleNodeFailure(errResponse, configIdx, nodeIdx)
      );
  };

  updateNodeErrors = (
    configIdx: number,
    nodeIdx: number,
    errors: APIError[]
  ) => {
    this.setState(
      set(lensPath(['configs', configIdx, 'nodes', nodeIdx, 'errors']), errors),
      () => {
        scrollErrorIntoView(`${configIdx}`);
      }
    );
  };

  updateState =
    (
      lens: Lens,
      L?: { [key: string]: Lens },
      callback?: (L: { [key: string]: Lens }) => () => void
    ) =>
    (value: any) => {
      this.clearMessages();
      this.setState(set(lens, value), L && callback ? callback(L) : undefined);
    };
}

const preloaded = PromiseLoader<NodeBalancerConfigurationsProps>({
  configs: (props) => {
    const { id: nodeBalancerId } = props.params;
    return getConfigsWithNodes(+nodeBalancerId!);
  },
});

const enhanced = composeC<
  NodeBalancerConfigurationsProps,
  NodeBalancerConfigurationsBaseProps
>(preloaded, withQueryClient);

export default enhanced(NodeBalancerConfigurations);
