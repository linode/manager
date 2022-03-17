import { APIError } from '@linode/api-v4/lib/types';
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
  view,
} from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CheckoutBar, { DisplaySectionList } from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ExtendedRegion } from 'src/components/EnhancedSelect/variants/RegionSelect';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import { Tag } from 'src/components/TagsInput';
import withProfile, { ProfileProps } from 'src/components/withProfile';
import { dcDisplayCountry } from 'src/constants';
import withRegions from 'src/containers/regions.container';
import { hasGrant } from 'src/features/Profile/permissionsHelpers';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions,
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import { sendCreateNodeBalancerEvent } from 'src/utilities/ga';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { Agreements, signAgreement } from '@linode/api-v4/lib/account';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';
import withAgreements, {
  AgreementsProps,
} from '../Account/Agreements/withAgreements';
import NodeBalancerConfigPanel from './NodeBalancerConfigPanel';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  NodeBalancerConfigFieldsWithStatus,
  transformConfigsForRequest,
} from './utils';
import { queryClient, simpleMutationHandlers } from 'src/queries/base';
import {
  queryKey,
  reportAgreementSigningError,
} from 'src/queries/accountAgreements';

type ClassNames = 'title' | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginTop: theme.spacing(3),
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '60px !important',
      },
      [theme.breakpoints.down('md')]: {
        '&.MuiGrid-item': {
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
  });

type CombinedProps = WithNodeBalancerActions &
  ProfileProps &
  WithRegions &
  RouteComponentProps<{}> &
  WithStyles<ClassNames> &
  AgreementsProps;

interface NodeBalancerFieldsState {
  label?: string;
  region?: string;
  tags?: string[];
  configs: (NodeBalancerConfigFieldsWithStatus & { errors?: any })[];
}

interface State {
  signedAgreement: boolean;
  submitting: boolean;
  nodeBalancerFields: NodeBalancerFieldsState;
  errors?: APIError[];
  deleteConfigConfirmDialog: {
    open: boolean;
    submitting: boolean;
    errors?: APIError[];
    idxToDelete?: number;
  };
}

const errorResources = {
  label: 'label',
  region: 'region',
  address: 'address',
  tags: 'tags',
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
    signedAgreement: false,
    submitting: false,
    nodeBalancerFields: NodeBalancerCreate.defaultFieldsStates,
    deleteConfigConfirmDialog: clone(
      NodeBalancerCreate.defaultDeleteConfigConfirmDialogState
    ),
  };

  disabled =
    Boolean(this.props.profile.data?.restricted) &&
    !hasGrant('add_nodebalancers', this.props.grants.data);

  addNodeBalancer = () => {
    if (this.disabled) {
      return;
    }
    this.setState({
      nodeBalancerFields: {
        ...this.state.nodeBalancerFields,
        configs: [
          ...this.state.nodeBalancerFields.configs,
          createNewNodeBalancerConfig(),
        ],
      },
    });
  };

  addNodeBalancerConfigNode = (configIdx: number) => () =>
    this.setState(
      over(
        lensPath(['nodeBalancerFields', 'configs', configIdx, 'nodes']),
        append(createNewNodeBalancerConfigNode())
      )
    );

  removeNodeBalancerConfigNode = (configIdx: number) => (nodeIdx: number) =>
    this.setState(
      over(
        lensPath(['nodeBalancerFields', 'configs', configIdx, 'nodes']),
        (nodes) => nodes.filter((n: any, idx: number) => idx !== nodeIdx)
      )
    );

  setNodeValue = (cidx: number, nodeidx: number, key: string, value: any) =>
    this.setState(
      set(
        lensPath([
          'nodeBalancerFields',
          'configs',
          cidx,
          'nodes',
          nodeidx,
          key,
        ]),
        value
      )
    );

  onNodeLabelChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'label', value);

  onNodeAddressChange = (configIdx: number, nodeIdx: number, value: string) => {
    this.setNodeValue(configIdx, nodeIdx, 'address', value);
  };

  onNodePortChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'port', value);

  onNodeWeightChange = (configIdx: number, nodeIdx: number, value: string) =>
    this.setNodeValue(configIdx, nodeIdx, 'weight', value);

  afterProtocolUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose(set(L.sslCertificateLens, ''), set(L.privateKeyLens, ''))
    );
  };

  afterHealthCheckTypeUpdate = (L: { [key: string]: Lens }) => () => {
    this.setState(
      compose(
        set(
          L.checkPathLens,
          NodeBalancerCreate.defaultFieldsStates.configs[0].check_path
        ),
        set(
          L.checkBodyLens,
          NodeBalancerCreate.defaultFieldsStates.configs[0].check_body
        ),
        set(
          L.healthCheckAttemptsLens,
          NodeBalancerCreate.defaultFieldsStates.configs[0].check_attempts
        ) as () => any,
        set(
          L.healthCheckIntervalLens,
          NodeBalancerCreate.defaultFieldsStates.configs[0].check_interval
        ),
        set(
          L.healthCheckTimeoutLens,
          NodeBalancerCreate.defaultFieldsStates.configs[0].check_timeout
        ) as () => any
      )
    );
  };

  clearNodeErrors = () => {
    // Build paths for all config errors.
    const configPaths = this.state.nodeBalancerFields.configs.map(
      (config, idxC) => {
        return ['configs', idxC, 'errors'];
      }
    );

    // Build paths to all node errors
    const nodePaths = this.state.nodeBalancerFields.configs.map(
      (config, idxC) => {
        return config.nodes.map((nodes, idxN) => {
          return ['configs', idxC, 'nodes', idxN, 'errors'];
        });
      }
    );

    const paths = [
      ...configPaths,
      ...nodePaths.reduce((acc, pathArr) => [...acc, ...pathArr], []),
    ];

    if (paths.length === 0) {
      return;
    }

    /* Map those paths to an array of updater functions */
    const setFns = paths.map((path: any[]) => {
      return set(lensPath(['nodeBalancerFields', ...path]), []);
    });
    /* Apply all of those update functions at once to state */
    this.setState((compose as any)(...setFns));
  };

  setNodeErrors = (errors: APIError[]) => {
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
    if (nodePathErrors.length === 0) {
      return this.setState({ errors });
    }

    const setFns = nodePathErrors.map((nodePathError: any) => {
      return compose(
        over(
          lensPath(['nodeBalancerFields', ...nodePathError.path]),
          append(nodePathError.error)
        ),
        defaultTo([]) as () => Array<{}>
      );
    });

    // Apply the error updater functions with a compose
    this.setState((compose as any)(...setFns), () => {
      scrollErrorIntoView();
    });
  };

  createNodeBalancer = () => {
    const {
      nodeBalancerActions: { createNodeBalancer },
    } = this.props;
    const { nodeBalancerFields, signedAgreement } = this.state;

    /* transform node data for the requests */
    const nodeBalancerRequestData = clone(nodeBalancerFields);
    nodeBalancerRequestData.configs = transformConfigsForRequest(
      nodeBalancerRequestData.configs
    );

    /* Clear node errors */
    this.clearNodeErrors();

    /* Clear config errors */
    this.setState({ submitting: true, errors: undefined });

    createNodeBalancer(nodeBalancerRequestData)
      .then((nodeBalancer) => {
        this.props.history.push(`/nodebalancers/${nodeBalancer.id}/summary`);
        // GA Event
        sendCreateNodeBalancerEvent(
          `${nodeBalancer.label}: ${nodeBalancer.region}`
        );
        if (signedAgreement) {
          queryClient.executeMutation<{}, APIError[], Partial<Agreements>>({
            variables: { eu_model: true, privacy_policy: true },
            mutationFn: signAgreement,
            mutationKey: queryKey,
            onError: reportAgreementSigningError,
            ...simpleMutationHandlers(queryKey),
          });
        }
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(errorResponse);
        this.setNodeErrors(
          errors.map((e: APIError) => ({
            ...e,
            ...(e.field && { field: e.field.replace(/(\[|\]\.)/g, '_') }),
          }))
        );

        return this.setState({ errors, submitting: false }, () =>
          scrollErrorIntoView()
        );
      });
  };

  onDeleteConfig = (configIdx: number) => () =>
    this.setState({
      deleteConfigConfirmDialog: {
        ...clone(NodeBalancerCreate.defaultDeleteConfigConfirmDialogState),
        open: true,
        idxToDelete: configIdx,
      },
    });

  onRemoveConfig = () => {
    const {
      deleteConfigConfirmDialog: { idxToDelete },
    } = this.state;

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
          (config: NodeBalancerConfigFieldsWithStatus, idx: number) => {
            return idx !== idxToDelete;
          }
        ),
      },
    });

    /* remove the errors related to that config */
    if (this.state.errors) {
      this.setState({
        errors: this.state.errors!.filter((error: APIError) => {
          const t = new RegExp(`configs_${idxToDelete}_`);
          return error.field && !t.test(error.field);
        }),
      });
    }

    /* clear the submitting indicator */
    this.setState({
      deleteConfigConfirmDialog: clone(
        NodeBalancerCreate.defaultDeleteConfigConfirmDialogState
      ),
    });
  };

  labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      set(lensPath(['nodeBalancerFields', 'label']), e.target.value)
    );
  };

  tagsChange = (tags: Tag[]) => {
    this.setState(
      set(
        lensPath(['nodeBalancerFields', 'tags']),
        tags.map((tag) => tag.value)
      )
    );
  };

  resetNodeAddresses = () => {
    /** Reset the IP addresses of all nodes at once */
    const { configs } = this.state.nodeBalancerFields;
    const newConfigs = configs.reduce((accum, thisConfig) => {
      return [
        ...accum,
        {
          ...thisConfig,
          nodes: [
            ...thisConfig.nodes.map((thisNode) => {
              return { ...thisNode, address: '' };
            }),
          ],
        },
      ];
    }, []);
    this.setState(set(lensPath(['nodeBalancerFields', 'configs']), newConfigs));
  };

  regionChange = (region: string) => {
    // No change; no need to update the state.
    if (this.state.nodeBalancerFields.region === region) {
      return;
    }
    this.setState(set(lensPath(['nodeBalancerFields', 'region']), region));
    // We just changed the region so any selected IP addresses are likely invalid
    this.resetNodeAddresses();
  };

  onCloseConfirmation = () =>
    this.setState({
      deleteConfigConfirmDialog: clone(
        NodeBalancerCreate.defaultDeleteConfigConfirmDialogState
      ),
    });

  updateState = (
    lens: Lens,
    L?: { [key: string]: Lens },
    callback?: (L: { [key: string]: Lens }) => () => void
  ) => (value: any) => {
    this.setState(set(lens, value), L && callback ? callback(L) : undefined);
  };

  confirmationConfigError = () =>
    (this.state.deleteConfigConfirmDialog.errors || [])
      .map((e) => e.reason)
      .join(',');

  renderConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        onClick={onClose}
        className="cancel"
        data-qa-cancel-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={this.onRemoveConfig}
        loading={this.state.deleteConfigConfirmDialog.submitting}
        data-qa-confirm-cancel
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  render() {
    const { classes, regionsData, agreements, profile } = this.props;
    const { nodeBalancerFields, signedAgreement } = this.state;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');

    const showAgreement = Boolean(
      isEURegion(nodeBalancerFields.region) &&
        !profile.data?.restricted &&
        !agreements.data?.eu_model
    );

    const { region } = this.state.nodeBalancerFields;
    let displaySections;
    if (region) {
      const foundRegion = regionsData.find((r) => r.id === region);
      if (foundRegion) {
        displaySections = [
          {
            title: dcDisplayCountry[foundRegion.id],
            details: foundRegion.display,
          },
        ];
      } else {
        displaySections = [{ title: 'Unknown Region' }];
      }
    }

    if (this.props.regionsLoading) {
      return <CircleProgress />;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create a NodeBalancer" />
        <Grid container className="m0">
          <Grid item className={`mlMain p0`}>
            <Breadcrumb
              pathname="/nodebalancers/create"
              data-qa-create-nodebalancer-header
            />
            {generalError && !this.disabled && (
              <Notice spacingTop={8} error>
                {generalError}
              </Notice>
            )}
            {this.disabled && (
              <Notice
                text={
                  "You don't have permissions to create a new NodeBalancer. Please contact an account administrator for details."
                }
                error={true}
                spacingTop={16}
                important
              />
            )}
            <LabelAndTagsPanel
              data-qa-label-input
              labelFieldProps={{
                errorText: hasErrorFor('label'),
                label: 'NodeBalancer Label',
                onChange: this.labelChange,
                value: nodeBalancerFields.label || '',
                disabled: this.disabled,
              }}
              tagsInputProps={{
                value: nodeBalancerFields.tags
                  ? nodeBalancerFields.tags.map((tag) => ({
                      label: tag,
                      value: tag,
                    }))
                  : [],
                onChange: this.tagsChange,
                tagError: hasErrorFor('tags'),
                disabled: this.disabled,
              }}
            />
            <SelectRegionPanel
              regions={regionsData}
              error={hasErrorFor('region')}
              selectedID={nodeBalancerFields.region}
              handleSelection={this.regionChange}
              disabled={this.disabled}
            />
            <Grid item xs={12}>
              <Typography variant="h2" className={classes.title}>
                NodeBalancer Settings
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent="space-between"
              alignItems="flex-end"
              style={{ marginTop: 8 }}
              data-qa-nodebalancer-settings-section
            >
              {this.state.nodeBalancerFields.configs.map(
                (nodeBalancerConfig, idx) => {
                  const lensTo = lensFrom([
                    'nodeBalancerFields',
                    'configs',
                    idx,
                  ]);

                  const L = {
                    algorithmLens: lensTo(['algorithm']),
                    checkPassiveLens: lensTo(['check_passive']),
                    checkBodyLens: lensTo(['check_body']),
                    checkPathLens: lensTo(['check_path']),
                    portLens: lensTo(['port']),
                    protocolLens: lensTo(['protocol']),
                    proxyProtocolLens: lensTo(['proxy_protocol']),
                    healthCheckTypeLens: lensTo(['check']),
                    healthCheckAttemptsLens: lensTo(['check_attempts']),
                    healthCheckIntervalLens: lensTo(['check_interval']),
                    healthCheckTimeoutLens: lensTo(['check_timeout']),
                    sessionStickinessLens: lensTo(['stickiness']),
                    sslCertificateLens: lensTo(['ssl_cert']),
                    privateKeyLens: lensTo(['ssl_key']),
                  };

                  return (
                    <Paper
                      key={idx}
                      style={{ padding: 24, margin: 8, width: '100%' }}
                    >
                      <NodeBalancerConfigPanel
                        nodeBalancerRegion={
                          this.state.nodeBalancerFields.region
                        }
                        errors={nodeBalancerConfig.errors}
                        configIdx={idx}
                        algorithm={view(L.algorithmLens, this.state)}
                        onAlgorithmChange={this.updateState(L.algorithmLens)}
                        checkPassive={view(L.checkPassiveLens, this.state)}
                        onCheckPassiveChange={this.updateState(
                          L.checkPassiveLens
                        )}
                        checkBody={view(L.checkBodyLens, this.state)}
                        onCheckBodyChange={this.updateState(L.checkBodyLens)}
                        checkPath={view(L.checkPathLens, this.state)}
                        onCheckPathChange={this.updateState(L.checkPathLens)}
                        port={view(L.portLens, this.state)}
                        onPortChange={this.updateState(L.portLens)}
                        protocol={view(L.protocolLens, this.state)}
                        proxyProtocol={view(L.proxyProtocolLens, this.state)}
                        onProtocolChange={this.updateState(
                          L.protocolLens,
                          L,
                          this.afterProtocolUpdate
                        )}
                        onProxyProtocolChange={this.updateState(
                          L.proxyProtocolLens
                        )}
                        healthCheckType={view(
                          L.healthCheckTypeLens,
                          this.state
                        )}
                        onHealthCheckTypeChange={this.updateState(
                          L.healthCheckTypeLens,
                          L,
                          this.afterHealthCheckTypeUpdate
                        )}
                        healthCheckAttempts={view(
                          L.healthCheckAttemptsLens,
                          this.state
                        )}
                        onHealthCheckAttemptsChange={this.updateState(
                          L.healthCheckAttemptsLens
                        )}
                        healthCheckInterval={view(
                          L.healthCheckIntervalLens,
                          this.state
                        )}
                        onHealthCheckIntervalChange={this.updateState(
                          L.healthCheckIntervalLens
                        )}
                        healthCheckTimeout={view(
                          L.healthCheckTimeoutLens,
                          this.state
                        )}
                        onHealthCheckTimeoutChange={this.updateState(
                          L.healthCheckTimeoutLens
                        )}
                        sessionStickiness={view(
                          L.sessionStickinessLens,
                          this.state
                        )}
                        onSessionStickinessChange={this.updateState(
                          L.sessionStickinessLens
                        )}
                        sslCertificate={view(L.sslCertificateLens, this.state)}
                        onSslCertificateChange={this.updateState(
                          L.sslCertificateLens
                        )}
                        privateKey={view(L.privateKeyLens, this.state)}
                        onPrivateKeyChange={this.updateState(L.privateKeyLens)}
                        nodes={this.state.nodeBalancerFields.configs[idx].nodes}
                        addNode={this.addNodeBalancerConfigNode(idx)}
                        removeNode={this.removeNodeBalancerConfigNode(idx)}
                        onNodeLabelChange={(nodeIndex, value) =>
                          this.onNodeLabelChange(idx, nodeIndex, value)
                        }
                        onNodeAddressChange={(nodeIndex, value) =>
                          this.onNodeAddressChange(idx, nodeIndex, value)
                        }
                        onNodePortChange={(nodeIndex, value) =>
                          this.onNodePortChange(idx, nodeIndex, value)
                        }
                        onNodeWeightChange={(nodeIndex, value) =>
                          this.onNodeWeightChange(idx, nodeIndex, value)
                        }
                        onDelete={this.onDeleteConfig(idx)}
                        disabled={this.disabled}
                      />
                    </Paper>
                  );
                }
              )}
              <Grid item>
                <Button
                  buttonType="secondary"
                  onClick={this.addNodeBalancer}
                  data-qa-add-config
                  disabled={this.disabled}
                >
                  Add another Configuration
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={`mlSidebar ${classes.sidebar}`}>
            <CheckoutBar
              heading={`${
                this.state.nodeBalancerFields.label || 'NodeBalancer'
              } Summary`}
              onDeploy={this.createNodeBalancer}
              calculatedPrice={10}
              disabled={
                this.state.submitting ||
                this.disabled ||
                (showAgreement && !signedAgreement)
              }
              submitText="Create NodeBalancer"
              agreement={
                showAgreement ? (
                  <EUAgreementCheckbox
                    checked={signedAgreement}
                    onChange={(e) =>
                      this.setState({ signedAgreement: e.target.checked })
                    }
                  />
                ) : undefined
              }
            >
              <DisplaySectionList displaySections={displaySections} />
            </CheckoutBar>
          </Grid>
        </Grid>

        <ConfirmationDialog
          onClose={this.onCloseConfirmation}
          title={'Delete this configuration?'}
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

/* @todo: move to own file */
export const lensFrom = (p1: (string | number)[]) => (
  p2: (string | number)[]
) => lensPath([...p1, ...p2]);

const getPathAndFieldFromFieldString = (value: string) => {
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
    field = field.replace(nodeRegExp, '');
  }
  return { field, path };
};

export interface FieldAndPath {
  field: string;
  path: any[];
}

export const fieldErrorsToNodePathErrors = (errors: APIError[]) => {
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
  return errors.reduce((acc: any, error: APIError) => {
    const errorFields = pathOr('', ['field'], error).split('|');
    const pathErrors: FieldAndPath[] = errorFields.map((field: string) =>
      getPathAndFieldFromFieldString(field)
    );

    if (!pathErrors.length) {
      return acc;
    }

    return [
      ...acc,
      ...pathErrors.map((err: FieldAndPath) => {
        return {
          error: {
            field: err.field,
            reason: error.reason,
          },
          path: [...err.path, 'errors'],
        };
      }),
    ];
  }, []);
};

interface WithRegions {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
  regionsError: APIError[];
}

export default recompose<CombinedProps, {}>(
  withRegions,
  withNodeBalancerActions,
  styled,
  withRouter,
  withProfile,
  withAgreements
)(NodeBalancerCreate);
