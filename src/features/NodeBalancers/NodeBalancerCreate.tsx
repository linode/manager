import * as React from 'react';
import * as Joi from 'joi';
import {
  append,
  clamp,
  clone,
  compose,
  defaultTo,
  lensPath,
  map,
  over,
  path,
  pathOr,
  reduce,
  set,
  view,
} from 'ramda';
import * as Promise from 'bluebird';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';

import Button from 'src/components/Button';
import {
  createNodeBalancer,
  createNodeBalancerSchema,
  createNodeBalancerConfig,
  createNodeBalancerConfigNode,
} from 'src/services/nodebalancers';
import { dcDisplayNames } from 'src/constants';
import Grid from 'src/components/Grid';
import ActionsPanel from 'src/components/ActionsPanel';
import PromiseLoader from 'src/components/PromiseLoader';
import CheckoutBar from 'src/components/CheckoutBar';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import ClientConnectionThrottlePanel from './ClientConnectionThrottlePanel';
import defaultNumeric from 'src/utilities/defaultNumeric';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import NodeBalancerConfigPanel from './NodeBalancerConfigPanel';
import Notice from 'src/components/Notice';

import {
  NodeBalancerConfigFields,
  transformConfigsForRequest,
  formatAddress,
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
} from './utils';

type Styles =
  'root'
  | 'main'
  | 'sidebar'
  | 'title';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
  main: {
  },
  sidebar: {
  },
  title: {
    marginTop: theme.spacing.unit * 3,
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
  client_conn_throttle?: number;
  configs: NodeBalancerConfigFields[];
}


interface State {
  submitting: boolean;
  nodeBalancerFields: NodeBalancerFieldsState;
  errors?: Linode.ApiFieldError[];
  deleteConfigConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    idxToDelete?: number;
  };
}

const preloaded = PromiseLoader<Props>({});

const errorResources = {
  label: 'label',
  region: 'region',
  client_conn_throttle: 'client connection throttle',
};

class NodeBalancerCreate extends React.Component<CombinedProps, State> {
  static defaultDeleteConfigConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
    idxToDelete: undefined,
  };

  static defaultFieldsStates = {
    configs: [createNewNodeBalancerConfig(true)],
  };

  state: State = {
    submitting: false,
    nodeBalancerFields: NodeBalancerCreate.defaultFieldsStates,
    deleteConfigConfirmDialog:
      clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
  };

  addNodeBalancerConfig = () => this.setState({
    nodeBalancerFields: {
      ...this.state.nodeBalancerFields,
      configs: [
        ...this.state.nodeBalancerFields.configs,
        createNewNodeBalancerConfig(),
      ],
    },
  })

  addNodeBalancerConfigNode = (configIdx: number) => this.setState(
    over(
      lensPath(['nodeBalancerFields', 'configs', configIdx, 'nodes']),
      append(createNewNodeBalancerConfigNode()),
    ))

  removeNodeBalancerConfigNode = (configIdx: number) => (nodeIdx: number) =>
    this.setState(
      over(
        lensPath(['nodeBalancerFields', 'configs', configIdx, 'nodes']),
        nodes => nodes.filter((n: any, idx: number) => idx !== nodeIdx),
      ))

  setNodeValue = (cidx: number, nodeidx: number, key: string, value: any) =>
    this.setState(
      set(
        lensPath(['nodeBalancerFields', 'configs', cidx, 'nodes', nodeidx, key]),
        value,
      ))

  onNodeLabelChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'label', value)

  onNodeAddressChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'address', value)

  onNodePortChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value)

  onNodeWeightChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'weight', value)

  clearNodeErrors = () => {
    // Build paths to all node errors
    const nestedPaths = this.state.nodeBalancerFields.configs.map((config, idxC) => {
      return config.nodes.map((nodes, idxN) => {
        return ['configs', idxC, 'nodes', idxN, 'errors'];
      });
    });
    const paths = nestedPaths.reduce((acc, pathArr) => [...acc, ...pathArr], []);
    if (paths.length === 0) { return; }
    /* Map those paths to an array of updater functions */
    const setFns = paths.map((path: any[]) => {
      return set(lensPath(['nodeBalancerFields', ...path]), []);
    });
    /* Apply all of those update functions at once to state */
    this.setState(
      (compose as any)(...setFns),
    );
  }

  setNodeErrors = (errors: Linode.ApiFieldError[]) => {
    /* Map the objects with this shape
        {
          path: ['configs', 2, 'nodes', 0, 'errors'],
          error: {
            field: 'label',
            reason: 'label cannot be blank"
          }
        }
      to an array of functions that will append the error at the
      given path in the config state
    */
    const nodePathErrors = fieldErrorsToNodePathErrors(errors);

    if (nodePathErrors.length === 0) { return; }

    const setFns = nodePathErrors.map((nodePathError: any) => {
      return compose(
        over(lensPath(['nodeBalancerFields', ...nodePathError.path]),
              append(nodePathError.error)),
        defaultTo([]),
      );
    });

    // Apply the error updater functions with a compose
    this.setState(
      (compose as any)(...setFns),
    );
  }

  createNodeBalancer = () => {
    const { nodeBalancerFields } = this.state;

    /* transform node data for the requests */
    const nodeBalancerRequestData = clone(nodeBalancerFields);
    nodeBalancerRequestData.configs = transformConfigsForRequest(
      nodeBalancerRequestData.configs);

    /* Clear node errors */
    this.clearNodeErrors();

    /* Clear config errors */
    this.setState({ errors: undefined });

    const { error } = Joi.validate(
      nodeBalancerRequestData,
      createNodeBalancerSchema,
      { abortEarly: false },
    );

    if (error) {
      const errors = validationErrorsToFieldErrors(error);

      /* Insert the node errors */
      this.setNodeErrors(errors);

      /* Then update the config errors */
      this.setState({
        errors,
      });
      return;
    }

    this.setState({ submitting: true });

    createNodeBalancer(nodeBalancerRequestData)
      .then((nodeBalancer) => {
        /**
         * @note Beyond this point the NodeBalancer has been created and any
         * error reporting will have to be done on the NodeBalancer summary page.
         * ie "Unable to create configuration for port 123 because... you can do it here!"
         * ie "Unable to add node XYZ because... you can do it here!"
         */

        const { id: nodeBalancerId } = nodeBalancer;
        const { configs } = nodeBalancerRequestData;

        return Promise.map(
          configs,
          nodeBalancerConfig => new Promise((resolveConfig) => {
            createNodeBalancerConfig(nodeBalancerId, nodeBalancerConfig)
              .then((response) => {
                const { id: nodeBalancerConfigId } = response;
                return Promise.map(
                  nodeBalancerConfig.nodes,
                  nodeBalancerConfigNode => new Promise((resolveNode) => {
                    createNodeBalancerConfigNode(
                      nodeBalancerId,
                      nodeBalancerConfigId,
                      formatAddress(nodeBalancerConfigNode),
                    )
                      .then((response) => {
                        resolveNode(response);
                      })
                      .catch((error) => {
                        resolveNode({
                          errors: error.response.data.errors,
                          config: nodeBalancerConfigNode,
                        });
                      });
                  }),
                )
                  .then(nodeBalancerConfigNodes => ({
                    ...nodeBalancerConfig,
                    nodes: nodeBalancerConfigNodes,
                  }));
              })
              .then(response => resolveConfig(response))
              .catch(error => resolveConfig({
                errors: error.response.data.errors,
                config: nodeBalancerConfig,
              }));
          }),
        )
          .then(nodeBalancerConfigs => ({
            ...nodeBalancer,
            configs: nodeBalancerConfigs,
          }));
      })
      .then((nodeBalancer) => {
        const { history } = this.props;
        const { id } = nodeBalancer;


        const errors: Linode.ApiFieldError[] = [
          ...nodeBalancer.configs.filter(c => c.hasOwnProperty('errors')),
          ...nodeBalancer.configs
            .map((c: any) => c.nodes)
            .reduce((prev, current) => [...prev, ...current], [])
            .filter(Boolean)
            .filter((c: any) => c.hasOwnProperty('errors')),
        ];

        return history.push(`/nodebalancers/${id}/summary`, { errors });
      })
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);

        if (errors) {
          return this.setState({ errors, submitting: false });
        }

        return this.setState({
          errors: [
            { field: 'none', reason: `An unexpected error has occured..` }],
        });
      });
  }

  onDeleteConfig = (configIdx: number) => () =>
    this.setState({
      deleteConfigConfirmDialog: {
        ...clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
        open: true,
        idxToDelete: configIdx,
      },
    })

  onRemoveConfig = () => {
    const { deleteConfigConfirmDialog: { idxToDelete } } = this.state;

    /* show the submitting indicator */
    this.setState({
      deleteConfigConfirmDialog: {
        ...this.state.deleteConfigConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    /* remove the config */
    this.setState({
      nodeBalancerFields: {
        ...this.state.nodeBalancerFields,
        configs: this.state.nodeBalancerFields.configs.filter(
          (config: NodeBalancerConfigFields, idx: number) => {
            return idx !== idxToDelete;
          }),
      },
    });

    /* remove the errors related to that config */
    if (this.state.errors) {
      this.setState({
        errors: this.state.errors!.filter((error: Linode.ApiFieldError) => {
          const t = new RegExp(`configs_${idxToDelete}_`);
          return !t.test(error.field);
        }),
      });
    }

    /* clear the submitting indicator */
    this.setState({
      deleteConfigConfirmDialog:
        clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
    });
  }

  labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      set(
        lensPath(['nodeBalancerFields', 'label']),
        e.target.value,
      ),
    );
  }

  regionChange = (region: string) => {
    this.setState(
      set(
        lensPath(['nodeBalancerFields', 'region']),
        region,
      ),
    );
  }

  clientConnThrottleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      set(
        lensPath(['nodeBalancerFields', 'client_conn_throttle']),
        controlClientConnectionThrottle(e.target.value),
      ),
    );
  }

  onCloseConfirmation = () => this.setState({
    deleteConfigConfirmDialog:
      clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
  })

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || []).map(e => e.reason).join(',')

  renderConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        data-qa-confirm-cancel
        onClick={this.onRemoveConfig}
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
    const { classes, regions } = this.props;
    const { nodeBalancerFields } = this.state;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');

    return (
      <StickyContainer>
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography
              variant="headline"
              data-qa-create-nodebalancer-header
            >
              Create a NodeBalancer
          </Typography>

            {generalError && <Notice error>{generalError}</Notice>}

            <LabelAndTagsPanel
              labelFieldProps={{
                label: 'NodeBalancer Label',
                value: nodeBalancerFields.label || '',
                errorText: hasErrorFor('label'),
                onChange: this.labelChange,
              }}
            />
            <SelectRegionPanel
              regions={regions}
              error={hasErrorFor('region')}
              selectedID={nodeBalancerFields.region || null}
              handleSelection={this.regionChange}
            />
            <Grid item xs={12}>
              <Typography variant="title" className={classes.title}>
                NodeBalancer Settings
              </Typography>
            </Grid>
            <ClientConnectionThrottlePanel
              textFieldProps={{
                errorText: hasErrorFor('client_conn_throttle'),
                value: defaultTo(0, nodeBalancerFields.client_conn_throttle),
                InputProps: {
                  endAdornment: <Typography
                    variant="caption"
                    component="span"
                    style={{ marginRight: '8px' }}
                  >
                    / second
                  </Typography>,
                },
                onChange: this.clientConnThrottleChange,
              }}
            />
            <Grid
              container
              justify="space-between"
              alignItems="flex-end"
              style={{ marginTop: 8 }}
              data-qa-nodebalancer-settings-section
            >
              {
                this.state.nodeBalancerFields.configs.map((nodeBalancerConfig, idx) => {
                  const lensTo = lensFrom(['nodeBalancerFields', 'configs', idx]);

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

                  const errors = reduce((
                    prev: Linode.ApiFieldError[],
                    next: Linode.ApiFieldError): Linode.ApiFieldError[] => {
                    const t = new RegExp(`configs_${idx}_`);

                    return t.test(next.field)
                      ? [...prev, { ...next, field: next.field.replace(t, '') }]
                      : prev;

                  }, [])(this.state.errors || []);

                  return <Paper key={idx} style={{ padding: 24, margin: 8, width: '100%' }}>
                    <NodeBalancerConfigPanel
                      errors={errors}
                      configIdx={idx}

                      algorithm={view(algorithmLens, this.state)}
                      onAlgorithmChange={(algorithm: string) =>
                        this.setState(state =>
                          set(algorithmLens, algorithm, state))}

                      checkPassive={view(checkPassiveLens, this.state)}
                      onCheckPassiveChange={(checkPassive: boolean) =>
                        this.setState(state =>
                          set(checkPassiveLens, checkPassive, state))}

                      checkBody={view(checkBodyLens, this.state)}
                      onCheckBodyChange={(checkBody: string) =>
                        this.setState(state =>
                          set(checkBodyLens, checkBody, state))}

                      checkPath={view(checkPathLens, this.state)}
                      onCheckPathChange={(checkPath: string) =>
                        this.setState(state =>
                          set(checkPathLens, checkPath, state))}

                      port={view(portLens, this.state)}
                      onPortChange={(port: string | number) =>
                        this.setState(state =>
                          set(portLens, port, state))}

                      protocol={view(protocolLens, this.state)}
                      onProtocolChange={(protocol: string) =>
                        this.setState(state =>
                          set(protocolLens, protocol, state))}

                      healthCheckType={view(healthCheckTypeLens, this.state)}
                      onHealthCheckTypeChange={(healthCheckType: string) =>
                        this.setState(state =>
                          set(healthCheckTypeLens, healthCheckType, state))}

                      healthCheckAttempts={view(healthCheckAttemptsLens, this.state)}
                      onHealthCheckAttemptsChange={(healthCheckAttempts: string) =>
                        this.setState(state =>
                          set(healthCheckAttemptsLens, healthCheckAttempts, state))}

                      healthCheckInterval={view(healthCheckIntervalLens, this.state)}
                      onHealthCheckIntervalChange={(healthCheckInterval: number | string) =>
                        this.setState(state =>
                          set(healthCheckIntervalLens, healthCheckInterval, state))}

                      healthCheckTimeout={view(healthCheckTimeoutLens, this.state)}
                      onHealthCheckTimeoutChange={(healthCheckTimeout: number | string) =>
                        this.setState(state =>
                          set(healthCheckTimeoutLens, healthCheckTimeout, state))}

                      sessionStickiness={view(sessionStickinessLens, this.state)}
                      onSessionStickinessChange={(sessionStickiness: number | string) =>
                        this.setState(state =>
                          set(sessionStickinessLens, sessionStickiness, state))}

                      sslCertificate={view(sslCertificateLens, this.state)}
                      onSslCertificateChange={(sslCertificate: string) =>
                        this.setState(state =>
                          set(sslCertificateLens, sslCertificate, state))}

                      privateKey={view(privateKeyLens, this.state)}
                      onPrivateKeyChange={(privateKey: string) =>
                        this.setState(state =>
                          set(privateKeyLens, privateKey, state))}

                      nodes={this.state.nodeBalancerFields.configs[idx].nodes}

                      addNode={() => this.addNodeBalancerConfigNode(idx)}

                      removeNode={this.removeNodeBalancerConfigNode(idx)}

                      onNodeLabelChange={(nodeIndex, value) =>
                        this.onNodeLabelChange(idx, nodeIndex, value)}

                      onNodeAddressChange={(nodeIndex, value) =>
                        this.onNodeAddressChange(idx, nodeIndex, value)}

                      onNodePortChange={(nodeIndex, value) =>
                        this.onNodePortChange(idx, nodeIndex, value)}

                      onNodeWeightChange={(nodeIndex, value) =>
                        this.onNodeWeightChange(idx, nodeIndex, value)}

                      onDelete={this.onDeleteConfig(idx)}
                    />
                  </Paper>;
                })
              }
              <Grid item>
                <Button
                  type="secondary"
                  onClick={() => this.addNodeBalancerConfig()}
                  data-qa-add-config
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
                      disabled={this.state.submitting}
                      {...props}
                    />
                  );
                }
              }
            </Sticky>
          </Grid>
        </Grid>

        <ConfirmationDialog
          onClose={this.onCloseConfirmation}
          title="Confirm Deletion"
          error={this.confirmationConfigError()}
          actions={this.renderConfigConfirmationActions}
          open={this.state.deleteConfigConfirmDialog.open}
        >
          <Typography>Are you sure you want to delete this NodeBalancer Configuration?</Typography>
        </ConfirmationDialog>
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

/* @todo: move to own file */
export const lensFrom = (p1: (string | number)[]) => (p2: (string | number)[]) =>
  lensPath([...p1, ...p2]);

export const fieldErrorsToNodePathErrors = (errors: Linode.ApiFieldError[]) => {
  /* Return objects with this shape
      {
        path: ['configs', 2, 'nodes', 0, 'errors'],
        error: {
          field: 'label',
          reason: 'label cannot be blank"
        }
      }
  */
  const nodePathErrors = errors.reduce(
    (acc: any, error: Linode.ApiFieldError) => {
      const match = /^configs_(\d+)_nodes_(\d+)_(\w+)$/.exec(error.field);
      if (match && match[1] && match[2] && match[3]) {
        return [
          ...acc,
          {
            path: ['configs', +match[1], 'nodes', +match[2], 'errors'],
            error: {
              field: match[3],
              reason: error.reason,
            },
          },
        ];
      }
      return acc;
    },
    [],
  );
  return nodePathErrors;
};

/* @todo: move to own file */
export const validationErrorsToFieldErrors = (error: Joi.ValidationError) => {
  return error
    .details
    .map(detail => ({
      key: detail.context && detail.context.key,
      path: detail.path.join('_'),
      message: detail.message,
      type: detail.type.split('.').shift(),
      constraint: detail.type.split('.').pop(),
    }))

    /**
     * This is a one-off solution for dealing with port uniqueness constraint on the configs.
     * */
    .map((detail) => {
      const path = detail.path.split('_');

      if (path.includes('configs') && detail.constraint === 'unique') {
        return {
          ...detail,
          message: 'Port must be unique',
          path: [...path, 'port'].join('_'),
        };
      }

      if (path.includes('nodes')
          && path.includes('label')
          && detail.constraint === 'min') {
        return {
          ...detail,
          message: 'Label must be at least 3 characters',
        };
      }

      if (path.includes('nodes')
          && path.includes('address')
          && detail.constraint === 'base') {
        return {
          ...detail,
          message: 'IP Address must be a Linode private address',
        };
      }

      if (path.includes('nodes')
          && path.includes('port')
          && (detail.constraint === 'base'
              || detail.constraint === 'min'
              || detail.constraint === 'max')) {
        return {
          ...detail,
          message: 'Port must be between 1 and 65535',
        };
      }

      if (path.includes('nodes')
          && path.includes('weight')
          && (detail.constraint === 'base'
              || detail.constraint === 'min'
              || detail.constraint === 'max')) {
        return {
          ...detail,
          message: 'Weight must be between 1 and 255',
        };
      }

      return detail;
    })
    .map((detail) => {
      return {
        field: detail.path,
        reason: detail.message,
      };
    });
};

export default compose(
  connected,
  preloaded,
  styled,
  withRouter,
)(NodeBalancerCreate);
