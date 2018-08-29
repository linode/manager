import * as Joi from 'joi';
import {
  append,
  clone,
  compose,
  defaultTo,
  Lens,
  lensPath,
  map,
  omit,
  over,
  path,
  set,
  view
} from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Sticky, StickyContainer, StickyProps } from 'react-sticky';

import Paper from '@material-ui/core/Paper';
import { StyleRules, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckoutBar from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { dcDisplayCountry, dcDisplayNames } from 'src/constants';
import { withRegions } from 'src/context/regions';
import { getLinodes } from 'src/services/linodes';
import { createNodeBalancer, createNodeBalancerSchema } from 'src/services/nodebalancers';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import NodeBalancerConfigPanel from './NodeBalancerConfigPanel';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  NodeBalancerConfigFields,
  transformConfigsForRequest
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

interface RegionsContextProps {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
}

type CombinedProps = Props
  & RegionsContextProps
  & RouteComponentProps<{}>
  & WithStyles<Styles>;

interface NodeBalancerFieldsState {
  label?: string;
  region?: string;
  configs: (NodeBalancerConfigFields & { errors?: any })[];
}

interface State {
  linodesWithPrivateIPs: Linode.Linode[];
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
  address: 'address',
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
    linodesWithPrivateIPs: [],
    submitting: false,
    nodeBalancerFields: NodeBalancerCreate.defaultFieldsStates,
    deleteConfigConfirmDialog:
      clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
  };

  addNodeBalancer = () => this.setState({
    nodeBalancerFields: {
      ...this.state.nodeBalancerFields,
      configs: [
        ...this.state.nodeBalancerFields.configs,
        createNewNodeBalancerConfig(),
      ],
    },
  })

  addNodeBalancerConfigNode = (configIdx: number) => () => this.setState(
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

  onNodeAddressChange = (configIdx: number, nodeIdx: number, value: string) => {
    this.setNodeValue(configIdx, nodeIdx, 'address', value);
  }

  onNodePortChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value)

  onNodeWeightChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'weight', value)

  afterProtocolUpdate = (L: { [key: string]: Lens}) => () => {
    this.setState(compose(
      set(L.sslCertificateLens, ''),
      set(L.privateKeyLens, ''),
    ))
  }

  afterHealthCheckTypeUpdate = (L: { [key: string]: Lens}) => () => {
    this.setState(compose(
      set(L.checkPathLens,
        NodeBalancerCreate.defaultFieldsStates.configs[0].check_path),
      set(L.checkBodyLens,
        NodeBalancerCreate.defaultFieldsStates.configs[0].check_body),
      set(L.healthCheckAttemptsLens,
        NodeBalancerCreate.defaultFieldsStates.configs[0].check_attempts),
      set(L.healthCheckIntervalLens,
        NodeBalancerCreate.defaultFieldsStates.configs[0].check_interval),
      set(L.healthCheckTimeoutLens,
        NodeBalancerCreate.defaultFieldsStates.configs[0].check_timeout),
    ));
  }

  clearNodeErrors = () => {
    // Build paths for all config errors.
    const configPaths = this.state.nodeBalancerFields.configs.map((config, idxC) => {
      return ['configs', idxC, 'errors'];
    });

    // Build paths to all node errors
    const nodePaths = this.state.nodeBalancerFields.configs.map((config, idxC) => {
      return config.nodes.map((nodes, idxN) => {
        return ['configs', idxC, 'nodes', idxN, 'errors'];
      });
    });

    const paths = [...configPaths, ...nodePaths.reduce((acc, pathArr) => [...acc, ...pathArr], [])];

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

    /** We still need to set the errors */
    if (nodePathErrors.length === 0) { return this.setState({ errors }); }

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
      () => {
        scrollErrorIntoView();
      });
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
      }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    this.setState({ submitting: true });

    const mergeIPAndPort = (data: NodeBalancerFieldsState) => ({
      ...data,
      configs: data.configs
        .map((c) => ({
          ...c,
          nodes: c.nodes.map(n => ({ ...omit(['port'], n), address: `${n.address}:${c.port}` })),
        }))
    });

    createNodeBalancer(mergeIPAndPort(nodeBalancerRequestData))
      .then((nodeBalancer) => this.props.history.push(`/nodebalancers/${nodeBalancer.id}/summary`))
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);

        if (errors) {
          this.setNodeErrors(errors.map((e) => ({
            ...e,
            ...(e.field && { field: e.field.replace(/(\[|\]\.)/g, '_') })
          })));

          return this.setState({ errors, submitting: false }, () => scrollErrorIntoView());
        }

        return this.setState({
          errors: [
            { reason: `An unexpected error has occured..` }],
        }, () => {
          scrollErrorIntoView();
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
          return error.field && !t.test(error.field);
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

  onCloseConfirmation = () => this.setState({
    deleteConfigConfirmDialog:
      clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
  })

  updateState = (
    lens: Lens,
    L?: { [key: string]: Lens},
    callback?: (L: { [key: string]: Lens }) => () => void
  ) => (value: any) => {
    this.setState(set(lens, value), L && callback ? callback(L) : undefined);
  }

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || []).map(e => e.reason).join(',')

  renderConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        onClick={onClose}
        type="secondary"
        className="cancel"
        data-qa-cancel-cancel
      >
        Cancel
      </Button>
      <Button
        data-qa-confirm-cancel
        onClick={this.onRemoveConfig}
        type="secondary"
        destructive
        loading={this.state.deleteConfigConfirmDialog.submitting}
      >
        Delete
      </Button>
    </ActionsPanel>
  )

  componentDidMount() {
    getLinodes()
      .then(result => {
        const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
        const linodesWithPrivateIPs = result.data.filter((linode) => {
          return linode.ipv4.some(ipv4 => !!ipv4.match(privateIPRegex)); // does it have a private IP address
        });
        this.setState({ linodesWithPrivateIPs });
      })
      // we don't really need to do anything here because if the request fails
      // the user won't be presented with any suggestions when typing in the
      // node address field, which isn't the end of the world.
      .catch(err => err);
  }

  render() {
    const { classes, regionsData } = this.props;
    const { nodeBalancerFields, linodesWithPrivateIPs } = this.state;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');

    if (this.props.regionsLoading) { return <CircleProgress /> }

    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a NodeBalancer" />
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography
              role="header"
              variant="headline"
              data-qa-create-nodebalancer-header
            >
              Create a NodeBalancer
          </Typography>

            {generalError && <Notice error>{generalError}</Notice>}

            <LabelAndTagsPanel
              data-qa-label-input
              labelFieldProps={{
                errorText: hasErrorFor('label'),
                label: 'NodeBalancer Label',
                onChange: this.labelChange,
                value: nodeBalancerFields.label || '',
              }}
            />
            <SelectRegionPanel
              regions={regionsData || []}
              error={hasErrorFor('region')}
              selectedID={nodeBalancerFields.region || null}
              handleSelection={this.regionChange}
            />
            <Grid item xs={12}>
              <Typography role="header" variant="title" className={classes.title}>
                NodeBalancer Settings
              </Typography>
            </Grid>
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
                    privateKeyLens: lensTo(['ssl_key']),
                  };

                  return <Paper key={idx} style={{ padding: 24, margin: 8, width: '100%' }}>
                    <NodeBalancerConfigPanel
                      errors={nodeBalancerConfig.errors}
                      linodesWithPrivateIPs={linodesWithPrivateIPs}
                      configIdx={idx}

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
                        L.protocolLens, L, this.afterProtocolUpdate)}

                      healthCheckType={view(L.healthCheckTypeLens, this.state)}
                      onHealthCheckTypeChange={this.updateState(
                        L.healthCheckTypeLens, L, this.afterHealthCheckTypeUpdate)}

                      healthCheckAttempts={view(L.healthCheckAttemptsLens, this.state)}
                      onHealthCheckAttemptsChange={this.updateState(L.healthCheckAttemptsLens)}

                      healthCheckInterval={view(L.healthCheckIntervalLens, this.state)}
                      onHealthCheckIntervalChange={this.updateState(L.healthCheckIntervalLens)}

                      healthCheckTimeout={view(L.healthCheckTimeoutLens, this.state)}
                      onHealthCheckTimeoutChange={this.updateState(L.healthCheckTimeoutLens)}

                      sessionStickiness={view(L.sessionStickinessLens, this.state)}
                      onSessionStickinessChange={this.updateState(L.sessionStickinessLens)}

                      sslCertificate={view(L.sslCertificateLens, this.state)}
                      onSslCertificateChange={this.updateState(L.sslCertificateLens)}

                      privateKey={view(L.privateKeyLens, this.state)}
                      onPrivateKeyChange={this.updateState(L.privateKeyLens)}

                      nodes={this.state.nodeBalancerFields.configs[idx].nodes}

                      addNode={this.addNodeBalancerConfigNode(idx)}

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
                  onClick={() => this.addNodeBalancer()}
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
                  let displaySections;
                  if (region) {
                    const foundRegion = (regionsData || []).find(r => r.id === region);
                    if (foundRegion) {
                      displaySections = {
                        title: dcDisplayCountry[foundRegion.id],
                        details: foundRegion.display,
                      };
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

const regionsContext = withRegions(({
  data: regionsData,
  loading: regionsLoading,
}) => ({
  regionsData: compose(
    map((region: Linode.Region) => ({
      ...region,
      display: dcDisplayNames[region.id],
    })),
  )(regionsData || []),
  regionsLoading,
}))

const styled = withStyles(styles, { withTheme: true });

/* @todo: move to own file */
export const lensFrom = (p1: (string | number)[]) => (p2: (string | number)[]) =>
  lensPath([...p1, ...p2]);

const getPathAnFieldFromFieldString = (value: string) => {
  let field = value;
  let path: any[] = [];

  const configRegExp = new RegExp(/configs_(\d+)_/);
  const configMatch = configRegExp.exec(value);
  if (configMatch && configMatch[1]) {
    path = [...path, 'configs', +configMatch[1]];
    field = field.replace(configRegExp, '');
  }

  const nodeRegExp = new RegExp(/nodes_(\d+)_/);
  const nodeMatch = nodeRegExp.exec(value);
  if (nodeMatch && nodeMatch[1]) {
    path = [...path, 'nodes', +nodeMatch[1]];
    field = field.replace(nodeRegExp, '')
  }
  return { field, path };
}

export const fieldErrorsToNodePathErrors = (errors: Linode.ApiFieldError[]) => {
  /**
   * Potentials;
   *  JOI error config_0_nodes_0_address
   *  API error config[0].nodes[0].address
   */

  /* Return objects with this shape
      {
        path: ['configs', 2, 'nodes', 0, 'errors'],
        error: {
          field: 'label',
          reason: 'label cannot be blank"
        }
      }
  */
  return errors.reduce(
    (acc: any, error: Linode.ApiFieldError) => {
      const { field, path } = getPathAnFieldFromFieldString(error.field!);

      if (!path.length) { return acc; }

      return [
        ...acc,
        {
          error: {
            field,
            reason: error.reason,
          },
          path: [...path, 'errors'],
        },
      ];
      return acc;
    },
    [],
  );
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
     */
    .map((detail) => {
      const path = detail.path.split('_');

      if (path.includes('configs') && detail.constraint === 'unique') {
        return {
          ...detail,
          message: 'Port must be unique',
          path: [...path, 'port'].join('_'),
        };
      }

      if (path.includes('path')
        && detail.constraint === 'base') {
        return {
          ...detail,
          message: 'Path must start with a /',
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
  regionsContext,
  preloaded,
  styled,
  withRouter,
)(NodeBalancerCreate);
