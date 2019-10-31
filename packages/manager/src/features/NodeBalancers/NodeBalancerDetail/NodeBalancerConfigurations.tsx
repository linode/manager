import * as Promise from 'bluebird';
import {
  createNodeBalancerConfigNode,
  CreateNodeBalancerConfigPayload,
  deleteNodeBalancerConfigNode,
  getNodeBalancerConfigNodes,
  getNodeBalancerConfigs,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
  updateNodeBalancerConfigNode
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError, ResourcePage } from 'linode-js-sdk/lib/types';
import {
  append,
  clone,
  compose,
  defaultTo,
  Lens,
  lensPath,
  over,
  pathOr,
  set,
  view
} from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose as composeC } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import PromiseLoader, {
  PromiseLoaderResponse
} from 'src/components/PromiseLoader/PromiseLoader';
import {
  withNodeBalancerConfigActions,
  WithNodeBalancerConfigActions
} from 'src/store/nodeBalancerConfig/nodeBalancerConfig.containers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import NodeBalancerConfigPanel from '../NodeBalancerConfigPanel';
import { lensFrom } from '../NodeBalancerCreate';
import {
  clampNumericString,
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  CreateNodeWithStatus,
  RequestedConfig,
  transformConfigsForRequest
} from '../utils';

type ClassNames = 'root' | 'title' | 'port' | 'nbStatuses';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    port: {
      marginRight: theme.spacing(2)
    },
    nbStatuses: {
      display: 'block',
      [theme.breakpoints.up('sm')]: {
        display: 'inline'
      }
    }
  });

interface Props {
  nodeBalancerLabel: string;
  nodeBalancerRegion: string;
}

interface MatchProps {
  nodeBalancerId?: string;
  configId?: string;
}
type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  configs: PromiseLoaderResponse<ResourcePage<ConfigWithNodes>>;
}

interface State {
  configs: (RequestedConfig)[];
  configErrors: APIError[][];
  configSubmitting: boolean[];
  panelMessages: string[];
  panelNodeMessages: string[];
  /*
   * If the following is set to true, then the last element of each of the above
   * arrays is related to this unsaved config.
   */
  hasUnsavedConfig: boolean;
  deleteConfigConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: APIError[];
    idxToDelete?: number;
    portToDelete?: number;
  };
}

type CombinedProps = Props &
  WithNodeBalancerConfigActions &
  RouteProps &
  WithStyles<ClassNames> &
  PreloadedProps;

type ConfigWithNodes = NodeBalancerConfig & { nodes: NodeBalancerConfigNode[] };

const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then(configs => {
    return Promise.map(configs.data, config => {
      return getNodeBalancerConfigNodes(nodeBalancerId, config.id).then(
        ({ data: nodes }) => {
          return {
            ...config,
            nodes
          };
        }
      );
    }).catch(e => []);
  });
};

const formatNodesStatus = (nodes: CreateNodeWithStatus[]) => {
  const statuses = nodes.reduce(
    (acc, node) => {
      if (node.status) {
        acc[node.status]++;
      }
      return acc;
    },
    { UP: 0, DOWN: 0, unknown: 0 }
  );

  return `Node status: ${statuses.UP} up, ${statuses.DOWN} down${
    statuses.unknown ? `, ${statuses.unknown} unknown` : ''
  }`;
};

class NodeBalancerConfigurations extends React.Component<CombinedProps, State> {
  static defaultDeleteConfigConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    idxToDelete: undefined,
    portToDelete: undefined
  };

  static defaultDeleteNodeConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    configIdxToDelete: undefined,
    nodeIdxToDelete: undefined
  };

  static defaultFieldsStates = {
    configs: [createNewNodeBalancerConfig(true)]
  };

  state: State = {
    configs: pathOr([], ['response'], this.props.configs),
    configErrors: [],
    configSubmitting: [],
    panelMessages: [],
    panelNodeMessages: [],
    deleteConfigConfirmDialog: clone(
      NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
    ),
    hasUnsavedConfig: false
  };

  resetSubmitting = (configIdx: number) => {
    // reset submitting
    const newSubmitting = clone(this.state.configSubmitting);
    newSubmitting[configIdx] = false;
    this.setState({
      configSubmitting: newSubmitting
    });
  };

  clearNodeErrors = (configIdx: number) => {
    // Build paths to all node errors
    const paths = (this.state.configs[configIdx].nodes || []).map(
      (nodes, idxN) => {
        return ['nodes', idxN, 'errors'];
      }
    );
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
    const nodePathErrors = errors.reduce((acc: any, error: APIError) => {
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
            path: [+match[1], 'errors'],
            error: {
              field: match[2],
              reason: error.reason
            }
          }
        ];
      }
      return acc;
    }, []);
    return nodePathErrors;
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

  saveConfigUpdatePath = (
    idx: number,
    config: RequestedConfig,
    configPayload: CreateNodeBalancerConfigPayload
  ) => {
    /* Update a config and its nodes simultaneously */
    const {
      nodeBalancerConfigActions: { updateNodeBalancerConfig },
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    const nodeBalUpdate = updateNodeBalancerConfig({
      nodeBalancerId: Number(nodeBalancerId),
      nodeBalancerConfigId: config.id,
      ...configPayload
    })
      .then(nodeBalancerConfig => {
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
          configs: newConfigs,
          configErrors: newErrors,
          configSubmitting: newSubmitting
        });
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch(errorResponse => {
        // update errors
        const errors = getAPIErrorOrDefault(errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        this.setState(
          {
            configErrors: newErrors
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
    const nodeUpdates = (config.nodes || []).map((node, nodeIdx) => {
      if (node.modifyStatus === 'delete') {
        return this.deleteNode(idx, nodeIdx);
      }
      if (node.modifyStatus === 'new') {
        return this.createNode(idx, nodeIdx);
      }
      if (node.modifyStatus === 'update') {
        return this.updateNode(idx, nodeIdx);
      }
      return new Promise(resolve => resolve(undefined));
    });

    /* Set the success message if all of the requests succeed */
    Promise.all([nodeBalUpdate, ...nodeUpdates] as any)
      .then(responseVals => {
        const [nodeBalSuccess, ...nodeResults] = responseVals;
        if (nodeBalSuccess) {
          // replace Config success message with a new one
          const newMessages = [];
          newMessages[idx] = 'NodeBalancer Configuration updated successfully';
          this.setState({
            panelMessages: newMessages
          });
        }
        const filteredNodeResults = nodeResults.filter(el => el !== undefined);
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
              panelNodeMessages: newMessages
            });
          }
        }
        this.resetSubmitting(idx);
      })
      .catch(requestFailure => {
        this.resetSubmitting(idx);
      });
  };

  saveConfigNewPath = (
    idx: number,
    config: RequestedConfig,
    configPayload: CreateNodeBalancerConfigPayload
  ) => {
    /*
     * Create a config and then its nodes.
     * If the config creation succeeds here, the UpdatePath will be used upon
     * subsequent saves.
     */

    const {
      nodeBalancerConfigActions: { createNodeBalancerConfig },
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;

    if (!nodeBalancerId) {
      return;
    }

    createNodeBalancerConfig({
      nodeBalancerId: Number(nodeBalancerId),
      ...configPayload
    })
      .then(nodeBalancerConfig => {
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
            configs: newConfigs,
            configErrors: newErrors
          },
          () => {
            // replace success message with a new one
            const newMessages = [];
            newMessages[idx] =
              'New NodeBalancer Configuration created successfully';
            this.setState({
              panelMessages: newMessages
            });

            // Allow the user to add yet another config
            this.setState({
              hasUnsavedConfig: false
            });

            // Execute Node operations now that the config has been created
            const nodeUpdates = (config.nodes || []).map((node, nodeIdx) => {
              if (node.modifyStatus !== 'delete') {
                /* All of the Nodes are new since the config was just created */
                return this.createNode(idx, nodeIdx);
              }
              return new Promise(resolve => resolve(true));
            });

            /* Set the success message if all of the requests succeed */
            Promise.all([...nodeUpdates] as any)
              .then(responseVals => {
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
                    panelNodeMessages: newNodeMessages
                  });
                }
                this.resetSubmitting(idx);
              })
              .catch(_ => {
                this.resetSubmitting(idx);
              });
          }
        );
      })
      .catch(errorResponse => {
        // update errors
        const errors = getAPIErrorOrDefault(errorResponse);
        const newErrors = clone(this.state.configErrors);
        newErrors[idx] = errors || [];
        this.setNodeErrors(idx, newErrors[idx]);
        this.setState(
          {
            configErrors: newErrors
          },
          () => {
            scrollErrorIntoView(`${idx}`);
          }
        );
        // reset submitting
        this.resetSubmitting(idx);
      });
  };

  clearMessages = () => {
    // clear any success messages
    this.setState({
      panelMessages: [],
      panelNodeMessages: []
    });
  };

  saveConfig = (idx: number) => {
    const config = this.state.configs[idx];

    const configPayload = transformConfigsForRequest([config])[0];

    // clear node errors for this config if there are any
    this.clearNodeErrors(idx);

    this.clearMessages();

    const newSubmitting = clone(this.state.configSubmitting);
    newSubmitting[idx] = true;
    this.setState({
      configSubmitting: newSubmitting
    });

    if (config.modifyStatus !== 'new') {
      // If updating Config, perform the update and Node operations simultaneously.
      this.saveConfigUpdatePath(idx, config, configPayload);
    } else {
      // If it's a new Config, perform the update and Node operations sequentially.
      this.saveConfigNewPath(idx, config, configPayload);
    }
  };

  deleteConfig = (e: any) => {
    const {
      deleteConfigConfirmDialog: { idxToDelete }
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
        hasUnsavedConfig: false
      });
      return;
    }

    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        errors: undefined,
        submitting: true
      }
    });

    const {
      nodeBalancerConfigActions: { deleteNodeBalancerConfig },
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    // actually delete a real config
    deleteNodeBalancerConfig({
      nodeBalancerId: Number(nodeBalancerId),
      nodeBalancerConfigId: config.id
    })
      .then(response => {
        // update config data
        const newConfigs = clone(this.state.configs);
        newConfigs.splice(idxToDelete, 1);
        this.setState({
          configs: newConfigs,
          deleteConfigConfirmDialog: clone(
            NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
          )
        });
      })
      .catch(err => {
        return this.setState(
          {
            deleteConfigConfirmDialog: {
              ...this.state.deleteConfigConfirmDialog,
              submitting: false,
              errors: err
            }
          },
          () => {
            scrollErrorIntoView(`${idxToDelete}`);
          }
        );
      });
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

  removeNode = (configIdx: number) => (nodeIdx: number) => {
    this.clearMessages();
    if ((this.state.configs[configIdx].nodes || [])[nodeIdx].id !== undefined) {
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
        over(lensPath(['configs', configIdx, 'nodes']), nodes =>
          nodes.filter((n: any, idx: number) => idx !== nodeIdx)
        )
      );
    }
  };

  deleteNode = (configIdx: number, nodeIdx: number) => {
    const {
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;

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
    const node = (config.nodes || [])[nodeIdx];
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
          over(lensPath(['configs', configIdx!, 'nodes']), nodes =>
            nodes.filter((n: any, idx: number) => idx !== nodeIdx!)
          )
        );
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch(err => {
        /* Return false as a Promise for the sake of aggregating results */
        return false;
        /* @todo:
            place an error on the node and set toDelete to undefined
        */
      });
  };

  addNode = (configIdx: number) => () => {
    this.setState(
      set(
        lensPath(['configs', configIdx, 'nodes']),
        append(createNewNodeBalancerConfigNode())(
          pathOr([], [configIdx, 'nodes'], this.state.configs)
        )
      )
    );
  };

  createNode = (configIdx: number, nodeIdx: number) => {
    const {
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;
    const config = this.state.configs[configIdx];
    const node = pathOr({}, [configIdx, 'nodes', nodeIdx], this.state.configs);

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }

    /** Need to post to API in _address:port_ format */
    const cleanedNode = {
      ...node,
      address: `${node.address}:${node.port}`
    };

    return createNodeBalancerConfigNode(
      Number(nodeBalancerId),
      config.id,
      cleanedNode
    )
      .then(responseNode => {
        /* Set the new Node data including the ID
           This also clears the errors and modify status. */
        this.setState(
          set(lensPath(['configs', configIdx, 'nodes', nodeIdx]), responseNode)
        );
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch(errResponse => {
        /* Set errors for this node */
        const errors = getAPIErrorOrDefault(errResponse);
        this.updateNodeErrors(configIdx, nodeIdx, errors);
        /* Return false as a Promise for the sake of aggregating results */
        return false;
      });
  };

  setNodeValue = (cidx: number, nodeidx: number, key: string, value: any) => {
    this.clearMessages();
    /* Check if the node is new */
    const { modifyStatus } = pathOr(
      '',
      [cidx, 'nodes', nodeidx],
      this.state.configs
    );
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
    const {
      match: {
        params: { nodeBalancerId }
      }
    } = this.props;
    const config = (this.state.configs || [])[configIdx];
    const node = pathOr(
      {},
      ['configs', configIdx, 'nodes', nodeIdx],
      this.state
    );

    if (!nodeBalancerId) {
      return;
    }
    if (!config || !config.id) {
      return;
    }
    if (!node || !node.id) {
      return;
    }

    /**
     * We need to PUT to the API with _address:port_ format here,
     * so we need to get the user-inputted address and concat that with that
     * user-inputted port
     */
    const [pureAddress, existingPort] = node.address.split(':');

    const cleanedNode = {
      ...node,
      address: `${pureAddress}:${node.port || existingPort}`,
      weight: +node.weight
    };

    return updateNodeBalancerConfigNode(
      Number(nodeBalancerId),
      config.id,
      node.id,
      cleanedNode
    )
      .then(responseNode => {
        /* Set the new Node data including the ID
             This also clears the errors and modify status. */
        this.setState(
          set(lensPath(['configs', configIdx, 'nodes', nodeIdx]), responseNode)
        );
        /* Return true as a Promise for the sake of aggregating results */
        return true;
      })
      .catch(errResponse => {
        /* Set errors for this node */
        const errors = getAPIErrorOrDefault(errResponse);
        this.updateNodeErrors(configIdx, nodeIdx, errors);
        /* Return false as a Promise for the sake of aggregating results */
        return false;
      });
  };

  addNodeBalancerConfig = () => {
    this.setState({
      configs: append(
        createNewNodeBalancerConfig(false) as any,
        this.state.configs
      ),
      configErrors: append([], this.state.configErrors),
      configSubmitting: append(false, this.state.configSubmitting),
      hasUnsavedConfig: true
    });
  };

  onNodeLabelChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'label', value);

  onNodeAddressChange = (configIdx: number) => (
    nodeIdx: number,
    value: string
  ) => this.setNodeValue(configIdx, nodeIdx, 'address', value);

  onNodePortChange = (configIdx: number) => (nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value);

  onNodeWeightChange = (configIdx: number) => (
    nodeIdx: number,
    value: string
  ) => this.setNodeValue(configIdx, nodeIdx, 'weight', value);

  onNodeModeChange = (configIdx: number) => (
    nodeIdx: number,
    value: string
  ) => {
    this.setNodeValue(configIdx, nodeIdx, 'mode', value);
  };

  afterProtocolUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose(
        set(L.sslCertificateLens, ''),
        set(L.privateKeyLens, '')
      )
    );
  };

  afterHealthCheckTypeUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose(
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
        ) as () => string,
        set(
          L.healthCheckTimeoutLens,
          NodeBalancerConfigurations.defaultFieldsStates.configs[0]
            .check_timeout
        )
      )
    );
  };

  onCloseConfirmation = () =>
    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        open: false
      }
    });

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || [])
      .map(e => e.reason)
      .join(',');

  updateState = (
    lens: Lens,
    L?: { [key: string]: Lens },
    callback?: (L: { [key: string]: Lens }) => () => void
  ) => (value: any) => {
    this.clearMessages();
    this.setState(set(lens, value), L && callback ? callback(L) : undefined);
  };

  updateStateWithClamp = (
    lens: Lens,
    L?: { [key: string]: Lens },
    callback?: (L: { [key: string]: Lens }) => () => void
  ) => (value: any) => {
    const clampedValue = clampNumericString(0, Number.MAX_SAFE_INTEGER)(value);
    this.updateState(lens, L, callback)(clampedValue);
  };

  onSaveConfig = (idx: number) => () => this.saveConfig(idx);

  onDeleteConfig = (idx: number, port: number) => () => {
    this.setState({
      deleteConfigConfirmDialog: {
        ...clone(
          NodeBalancerConfigurations.defaultDeleteConfigConfirmDialogState
        ),
        open: true,
        idxToDelete: idx,
        portToDelete: port
      }
    });
  };

  renderConfig = (
    panelMessages: string[],
    configErrors: any[],
    configSubmitting: any[]
  ) => (config: RequestedConfig, idx: number) => {
    const isNewConfig =
      this.state.hasUnsavedConfig && idx === this.state.configs.length - 1;
    const { panelNodeMessages } = this.state;
    const { classes } = this.props;

    const lensTo = lensFrom(['configs', idx]);

    // Check whether config is expended based on the URL
    const expandedConfigId = this.props.match.params.configId;
    const isExpanded = expandedConfigId
      ? parseInt(expandedConfigId, 10) === config.id
      : false;

    const L = {
      algorithmLens: lensTo(['algorithm']),
      checkPassiveLens: lensTo(['check_passive']),
      checkBodyLens: lensTo(['check_body']),
      checkPathLens: lensTo(['check_path']),
      portLens: lensTo(['port']),
      protocolLens: lensTo(['protocol']),
      healthCheckTypeLens: lensTo(['check']),
      healthCheckAttemptsLens: lensTo(['check_attempts']),
      healthCheckIntervalLens: lensTo(['check_interval']),
      healthCheckTimeoutLens: lensTo(['check_timeout']),
      sessionStickinessLens: lensTo(['stickiness']),
      sslCertificateLens: lensTo(['ssl_cert']),
      privateKeyLens: lensTo(['ssl_key'])
    };

    return (
      <ExpansionPanel
        key={`nb-config-${idx}`}
        updateFor={[
          idx,
          config,
          configSubmitting[idx],
          configErrors[idx],
          panelMessages[idx],
          panelNodeMessages[idx],
          classes
        ]}
        defaultExpanded={isNewConfig || isExpanded}
        success={panelMessages[idx]}
        heading={
          <React.Fragment>
            <span className={classes.port}>
              Port {config.port !== undefined ? config.port : ''}
            </span>
            <Typography className={classes.nbStatuses} component="span">
              {formatNodesStatus(config.nodes)}
            </Typography>
          </React.Fragment>
        }
      >
        <NodeBalancerConfigPanel
          nodeBalancerRegion={this.props.nodeBalancerRegion}
          forEdit
          configIdx={idx}
          onSave={this.onSaveConfig(idx)}
          submitting={configSubmitting[idx]}
          onDelete={this.onDeleteConfig(idx, config.port || -1)}
          errors={configErrors[idx]}
          nodeMessage={panelNodeMessages[idx]}
          algorithm={view(L.algorithmLens, this.state)}
          onAlgorithmChange={this.updateState(L.algorithmLens)}
          checkPassive={view(L.checkPassiveLens, this.state)}
          onCheckPassiveChange={this.updateState(L.checkPassiveLens)}
          checkBody={view(L.checkBodyLens, this.state)}
          onCheckBodyChange={this.updateState(L.checkBodyLens)}
          checkPath={view(L.checkPathLens, this.state)}
          onCheckPathChange={this.updateState(L.checkPathLens)}
          port={view(L.portLens, this.state)}
          onPortChange={this.updateState(L.portLens)}
          protocol={view(L.protocolLens, this.state)}
          onProtocolChange={this.updateState(
            L.protocolLens,
            L,
            this.afterProtocolUpdate
          )}
          healthCheckType={view(L.healthCheckTypeLens, this.state)}
          onHealthCheckTypeChange={this.updateState(
            L.healthCheckTypeLens,
            L,
            this.afterHealthCheckTypeUpdate
          )}
          healthCheckAttempts={view(L.healthCheckAttemptsLens, this.state)}
          onHealthCheckAttemptsChange={this.updateStateWithClamp(
            L.healthCheckAttemptsLens
          )}
          healthCheckInterval={view(L.healthCheckIntervalLens, this.state)}
          onHealthCheckIntervalChange={this.updateStateWithClamp(
            L.healthCheckIntervalLens
          )}
          healthCheckTimeout={view(L.healthCheckTimeoutLens, this.state)}
          onHealthCheckTimeoutChange={this.updateStateWithClamp(
            L.healthCheckTimeoutLens
          )}
          sessionStickiness={view(L.sessionStickinessLens, this.state)}
          onSessionStickinessChange={this.updateState(L.sessionStickinessLens)}
          sslCertificate={view(L.sslCertificateLens, this.state)}
          onSslCertificateChange={this.updateState(L.sslCertificateLens)}
          privateKey={view(L.privateKeyLens, this.state)}
          onPrivateKeyChange={this.updateState(L.privateKeyLens)}
          nodes={config.nodes}
          addNode={this.addNode(idx)}
          removeNode={this.removeNode(idx)}
          onNodeLabelChange={this.onNodeLabelChange(idx)}
          onNodeAddressChange={this.onNodeAddressChange(idx)}
          onNodePortChange={this.onNodePortChange(idx)}
          onNodeWeightChange={this.onNodeWeightChange(idx)}
          onNodeModeChange={this.onNodeModeChange(idx)}
        />
      </ExpansionPanel>
    );
  };

  renderConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        onClick={onClose}
        buttonType="cancel"
        className="cancel"
        data-qa-cancel-cancel
      >
        Cancel
      </Button>
      <Button
        data-qa-confirm-cancel
        onClick={this.deleteConfig}
        buttonType="secondary"
        destructive
        loading={this.state.deleteConfigConfirmDialog.submitting}
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  render() {
    const { classes, nodeBalancerLabel } = this.props;
    const {
      configs,
      configErrors,
      configSubmitting,
      panelMessages,
      hasUnsavedConfig
    } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment
          segment={`${nodeBalancerLabel} - Configurations`}
        />
        <Typography variant="h1" data-qa-title className={classes.title}>
          NodeBalancer Configurations
        </Typography>

        {Array.isArray(configs) &&
          configs.map(
            this.renderConfig(panelMessages, configErrors, configSubmitting)
          )}

        {!hasUnsavedConfig && (
          <Grid item style={{ marginTop: 16 }}>
            <Button
              buttonType="secondary"
              onClick={() => this.addNodeBalancerConfig()}
              data-qa-add-config
            >
              {configs.length === 0
                ? 'Add a Configuration'
                : 'Add another Configuration'}
            </Button>
          </Grid>
        )}

        <ConfirmationDialog
          onClose={this.onCloseConfirmation}
          title={
            typeof this.state.deleteConfigConfirmDialog.portToDelete !==
            'undefined'
              ? `Delete this configuration on port ${
                  this.state.deleteConfigConfirmDialog.portToDelete
                }?`
              : 'Delete this configuration?'
          }
          error={this.confirmationConfigError()}
          actions={this.renderConfigConfirmationActions}
          open={this.state.deleteConfigConfirmDialog.open}
        >
          <Typography>
            Are you sure you want to delete this NodeBalancer Configuration?
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const preloaded = PromiseLoader<CombinedProps>({
  configs: props => {
    const {
      match: {
        params: { nodeBalancerId }
      }
    } = props;
    return getConfigsWithNodes(+nodeBalancerId!);
  }
});

const enhanced = composeC<CombinedProps, Props>(
  styled,
  withRouter,
  preloaded,
  withNodeBalancerConfigActions
);

export default enhanced(NodeBalancerConfigurations);
