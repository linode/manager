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
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { hasGrant } from 'src/features/Profile/permissionsHelpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import { sendCreateNodeBalancerEvent } from 'src/utilities/ga';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';
import NodeBalancerConfigPanel from './NodeBalancerConfigPanel';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  NodeBalancerConfigFieldsWithStatus,
  transformConfigsForRequest,
} from './utils';
import {
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import LandingHeader from 'src/components/LandingHeader';
import { useNodebalancerCreateMutation } from 'src/queries/nodebalancers';
import Box from 'src/components/core/Box';
import { CheckoutSummary } from 'src/components/CheckoutSummary/CheckoutSummary';
import Accordion from 'src/components/Accordion';
import Paper from 'src/components/core/Paper';
import TextField from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';

interface NodeBalancerFieldsState {
  label?: string;
  region?: string;
  tags?: string[];
  configs: (NodeBalancerConfigFieldsWithStatus & { errors?: any })[];
}

const errorResources = {
  label: 'label',
  region: 'region',
  address: 'address',
  tags: 'tags',
};

const defaultDeleteConfigConfirmDialogState = {
  submitting: false,
  open: false,
  errors: undefined,
  idxToDelete: undefined,
};

const defaultFieldsStates = {
  configs: [createNewNodeBalancerConfig(true)],
};

const NodeBalancerCreate = () => {
  const { data: agreements } = useAccountAgreements();
  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const { data: regions } = useRegionsQuery();

  const {
    mutateAsync: createNodeBalancer,
    isLoading,
    error,
  } = useNodebalancerCreateMutation();

  const history = useHistory();

  const [
    nodeBalancerFields,
    setNodeBalancerFields,
  ] = React.useState<NodeBalancerFieldsState>(defaultFieldsStates);

  const [
    deleteConfigConfirmDialog,
    setDeleteConfigConfirmDialog,
  ] = React.useState<{
    open: boolean;
    submitting: boolean;
    errors?: APIError[];
    idxToDelete?: number;
  }>(defaultDeleteConfigConfirmDialogState);

  const { mutateAsync: updateAgreements } = useMutateAccountAgreements();

  const disabled =
    Boolean(profile?.restricted) && !hasGrant('add_nodebalancers', grants);

  const addNodeBalancer = () => {
    if (disabled) {
      return;
    }
    setNodeBalancerFields((prev) => ({
      ...prev,
      configs: [...prev.configs, createNewNodeBalancerConfig()],
    }));
  };

  const addNodeBalancerConfigNode = (configIdx: number) => () =>
    setNodeBalancerFields(
      over(
        lensPath(['configs', configIdx, 'nodes']),
        append(createNewNodeBalancerConfigNode())
      )
    );

  const removeNodeBalancerConfigNode = (configIdx: number) => (
    nodeIdx: number
  ) =>
    setNodeBalancerFields(
      over(lensPath(['configs', configIdx, 'nodes']), (nodes) =>
        nodes.filter((n: any, idx: number) => idx !== nodeIdx)
      )
    );

  const setNodeValue = (
    cidx: number,
    nodeidx: number,
    key: string,
    value: any
  ) =>
    setNodeBalancerFields(
      set(lensPath(['configs', cidx, 'nodes', nodeidx, key]), value)
    );

  const onNodeLabelChange = (
    configIdx: number,
    nodeIdx: number,
    value: string
  ) => setNodeValue(configIdx, nodeIdx, 'label', value);

  const onNodeAddressChange = (
    configIdx: number,
    nodeIdx: number,
    value: string
  ) => {
    setNodeValue(configIdx, nodeIdx, 'address', value);
  };

  const onNodePortChange = (
    configIdx: number,
    nodeIdx: number,
    value: string
  ) => setNodeValue(configIdx, nodeIdx, 'port', value);

  const onNodeWeightChange = (
    configIdx: number,
    nodeIdx: number,
    value: string
  ) => setNodeValue(configIdx, nodeIdx, 'weight', value);

  const afterProtocolUpdate = (L: { [key: string]: Lens }) => () => {
    setNodeBalancerFields(
      // @ts-expect-error compose is trash
      compose(set(L.sslCertificateLens, ''), set(L.privateKeyLens, ''))
    );
  };

  const afterHealthCheckTypeUpdate = (L: { [key: string]: Lens }) => () => {
    setNodeBalancerFields(
      // @ts-expect-error compose is trash
      compose(
        set(L.checkPathLens, defaultFieldsStates.configs[0].check_path),
        set(L.checkBodyLens, defaultFieldsStates.configs[0].check_body),
        set(
          L.healthCheckAttemptsLens,
          defaultFieldsStates.configs[0].check_attempts
        ) as () => any,
        set(
          L.healthCheckIntervalLens,
          defaultFieldsStates.configs[0].check_interval
        ),
        set(
          L.healthCheckTimeoutLens,
          defaultFieldsStates.configs[0].check_timeout
        ) as () => any
      )
    );
  };

  const clearNodeErrors = () => {
    // Build paths for all config errors.
    const configPaths = nodeBalancerFields.configs.map((config, idxC) => {
      return ['configs', idxC, 'errors'];
    });

    // Build paths to all node errors
    const nodePaths = nodeBalancerFields.configs.map((config, idxC) => {
      return config.nodes.map((nodes, idxN) => {
        return ['configs', idxC, 'nodes', idxN, 'errors'];
      });
    });

    const paths = [
      ...configPaths,
      ...nodePaths.reduce((acc, pathArr) => [...acc, ...pathArr], []),
    ];

    if (paths.length === 0) {
      return;
    }

    /* Map those paths to an array of updater functions */
    const setFns = paths.map((path: any[]) => {
      return set(lensPath([...path]), []);
    });
    /* Apply all of those update functions at once to state */
    setNodeBalancerFields((compose as any)(...setFns));
  };

  const setNodeErrors = (errors: APIError[]) => {
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

    const setFns = nodePathErrors.map((nodePathError: any) => {
      return compose(
        over(lensPath([...nodePathError.path]), append(nodePathError.error)),
        defaultTo([]) as () => Array<{}>
      );
    });

    // Apply the error updater functions with a compose
    setNodeBalancerFields((compose as any)(...setFns));
    scrollErrorIntoView();
  };

  const onCreate = () => {
    /* transform node data for the requests */
    const nodeBalancerRequestData = clone(nodeBalancerFields);
    nodeBalancerRequestData.configs = transformConfigsForRequest(
      nodeBalancerRequestData.configs
    );

    /* Clear node errors */
    clearNodeErrors();

    createNodeBalancer(nodeBalancerRequestData)
      .then((nodeBalancer) => {
        history.push(`/nodebalancers/${nodeBalancer.id}/summary`);
        // GA Event
        sendCreateNodeBalancerEvent(
          `${nodeBalancer.label}: ${nodeBalancer.region}`
        );
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(errorResponse);
        setNodeErrors(
          errors.map((e: APIError) => ({
            ...e,
            ...(e.field && { field: e.field.replace(/(\[|\]\.)/g, '_') }),
          }))
        );

        scrollErrorIntoView();
      });
  };

  const onDeleteConfig = (configIdx: number) => () =>
    setDeleteConfigConfirmDialog({
      ...clone(defaultDeleteConfigConfirmDialogState),
      open: true,
      idxToDelete: configIdx,
    });

  const onRemoveConfig = () => {
    /* show the submitting indicator */
    setDeleteConfigConfirmDialog((prev) => ({
      ...prev,
      errors: undefined,
      submitting: true,
    }));

    /* remove the config */
    setNodeBalancerFields((prev) => ({
      ...prev,
      configs: prev.configs.filter(
        (config: NodeBalancerConfigFieldsWithStatus, idx: number) => {
          return idx !== deleteConfigConfirmDialog.idxToDelete;
        }
      ),
    }));

    /* clear the submitting indicator */
    setDeleteConfigConfirmDialog(clone(defaultDeleteConfigConfirmDialogState));
  };

  const labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeBalancerFields(set(lensPath(['label']), e.target.value));
  };

  const tagsChange = (tags: Tag[]) => {
    setNodeBalancerFields(
      set(
        lensPath(['tags']),
        tags.map((tag) => tag.value)
      )
    );
  };

  const resetNodeAddresses = () => {
    /** Reset the IP addresses of all nodes at once */
    const { configs } = nodeBalancerFields;
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
    setNodeBalancerFields(set(lensPath(['configs']), newConfigs));
  };

  const regionChange = (region: string) => {
    // No change; no need to update the state.
    if (nodeBalancerFields.region === region) {
      return;
    }
    setNodeBalancerFields(set(lensPath(['region']), region));
    // We just changed the region so any selected IP addresses are likely invalid
    resetNodeAddresses();
  };

  const onCloseConfirmation = () =>
    setDeleteConfigConfirmDialog(clone(defaultDeleteConfigConfirmDialogState));

  const updateState = (
    lens: Lens,
    L?: { [key: string]: Lens },
    callback?: (L: { [key: string]: Lens }) => () => void
  ) => (value: any) => {
    setNodeBalancerFields(set(lens, value));

    if (L && callback) {
      callback(L);
    }
  };

  const confirmationConfigError = () =>
    (deleteConfigConfirmDialog.errors || []).map((e) => e.reason).join(',');

  const hasErrorFor = getAPIErrorFor(errorResources, error ?? undefined);
  const generalError = hasErrorFor('none');

  const showAgreement = Boolean(
    isEURegion(nodeBalancerFields.region) &&
      !profile?.restricted &&
      !agreements?.eu_model
  );

  const regionLabel = regions?.find((r) => r.id === nodeBalancerFields.region)
    ?.label;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Create a NodeBalancer" />
      <LandingHeader
        title="Create"
        breadcrumbProps={{
          pathname: '/nodebalancers/create',
          breadcrumbDataAttrs: {
            'data-qa-create-nodebalancer-header': true,
          },
        }}
      />
      {generalError && !disabled && (
        <Notice spacingTop={8} error>
          {generalError}
        </Notice>
      )}
      {disabled && (
        <Notice
          text={
            "You don't have permissions to create a new NodeBalancer. Please contact an account administrator for details."
          }
          error={true}
          spacingTop={16}
          important
        />
      )}
      <Paper>
        <TextField
          errorText={hasErrorFor('label')}
          label={'NodeBalancer Label'}
          onChange={labelChange}
          value={nodeBalancerFields.label || ''}
          disabled={disabled}
          noMarginTop
        />
        <TagsInput
          value={
            nodeBalancerFields.tags
              ? nodeBalancerFields.tags.map((tag) => ({
                  label: tag,
                  value: tag,
                }))
              : []
          }
          onChange={tagsChange}
          tagError={hasErrorFor('tags')}
          disabled={disabled}
        />
      </Paper>
      <SelectRegionPanel
        regions={regions ?? []}
        error={hasErrorFor('region')}
        selectedID={nodeBalancerFields.region}
        handleSelection={regionChange}
        disabled={disabled}
      />
      <Box marginTop={2} marginBottom={2}>
        {nodeBalancerFields.configs.map((nodeBalancerConfig, idx) => {
          const lensTo = lensFrom(['configs', idx]);

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
            <Accordion
              heading={`Configuration - Port ${
                view(L.portLens, nodeBalancerFields) ?? ''
              }`}
              key={idx}
              defaultExpanded
            >
              <NodeBalancerConfigPanel
                nodeBalancerRegion={nodeBalancerFields.region}
                errors={nodeBalancerConfig.errors}
                configIdx={idx}
                algorithm={view(L.algorithmLens, nodeBalancerFields)}
                onAlgorithmChange={updateState(L.algorithmLens)}
                checkPassive={view(L.checkPassiveLens, nodeBalancerFields)}
                onCheckPassiveChange={updateState(L.checkPassiveLens)}
                checkBody={view(L.checkBodyLens, nodeBalancerFields)}
                onCheckBodyChange={updateState(L.checkBodyLens)}
                checkPath={view(L.checkPathLens, nodeBalancerFields)}
                onCheckPathChange={updateState(L.checkPathLens)}
                port={view(L.portLens, nodeBalancerFields)}
                onPortChange={updateState(L.portLens)}
                protocol={view(L.protocolLens, nodeBalancerFields)}
                proxyProtocol={view(L.proxyProtocolLens, nodeBalancerFields)}
                onProtocolChange={updateState(
                  L.protocolLens,
                  L,
                  afterProtocolUpdate
                )}
                onProxyProtocolChange={updateState(L.proxyProtocolLens)}
                healthCheckType={view(
                  L.healthCheckTypeLens,
                  nodeBalancerFields
                )}
                onHealthCheckTypeChange={updateState(
                  L.healthCheckTypeLens,
                  L,
                  afterHealthCheckTypeUpdate
                )}
                healthCheckAttempts={view(
                  L.healthCheckAttemptsLens,
                  nodeBalancerFields
                )}
                onHealthCheckAttemptsChange={updateState(
                  L.healthCheckAttemptsLens
                )}
                healthCheckInterval={view(
                  L.healthCheckIntervalLens,
                  nodeBalancerFields
                )}
                onHealthCheckIntervalChange={updateState(
                  L.healthCheckIntervalLens
                )}
                healthCheckTimeout={view(
                  L.healthCheckTimeoutLens,
                  nodeBalancerFields
                )}
                onHealthCheckTimeoutChange={updateState(
                  L.healthCheckTimeoutLens
                )}
                sessionStickiness={view(
                  L.sessionStickinessLens,
                  nodeBalancerFields
                )}
                onSessionStickinessChange={updateState(L.sessionStickinessLens)}
                sslCertificate={view(L.sslCertificateLens, nodeBalancerFields)}
                onSslCertificateChange={updateState(L.sslCertificateLens)}
                privateKey={view(L.privateKeyLens, nodeBalancerFields)}
                onPrivateKeyChange={updateState(L.privateKeyLens)}
                nodes={nodeBalancerFields.configs[idx].nodes}
                addNode={addNodeBalancerConfigNode(idx)}
                removeNode={removeNodeBalancerConfigNode(idx)}
                onNodeLabelChange={(nodeIndex, value) =>
                  onNodeLabelChange(idx, nodeIndex, value)
                }
                onNodeAddressChange={(nodeIndex, value) =>
                  onNodeAddressChange(idx, nodeIndex, value)
                }
                onNodePortChange={(nodeIndex, value) =>
                  onNodePortChange(idx, nodeIndex, value)
                }
                onNodeWeightChange={(nodeIndex, value) =>
                  onNodeWeightChange(idx, nodeIndex, value)
                }
                onDelete={onDeleteConfig(idx)}
                disabled={disabled}
              />
            </Accordion>
          );
        })}
      </Box>
      <Button
        buttonType="outlined"
        onClick={addNodeBalancer}
        data-qa-add-config
        disabled={disabled}
      >
        Add another Configuration
      </Button>
      <CheckoutSummary
        heading={`Summary ${nodeBalancerFields.label ?? ''}`}
        displaySections={[
          { title: '$10/month' },
          { title: regionLabel },
          { title: 'Configs', details: nodeBalancerFields.configs.length },
          {
            title: 'Nodes',
            details: nodeBalancerFields.configs.reduce(
              (acc, config) => acc + config.nodes.length,
              0
            ),
          },
        ].filter((item) => Boolean(item.title))}
      />
      <Box
        display="flex"
        justifyContent={showAgreement ? 'space-between' : 'flex-end'}
      >
        {showAgreement ? (
          <EUAgreementCheckbox
            checked={Boolean(agreements?.eu_model)}
            onChange={(e) => updateAgreements({ eu_model: e.target.checked })}
          />
        ) : undefined}
        <Button buttonType="primary" onClick={onCreate} loading={isLoading}>
          Create NodeBalancer
        </Button>
      </Box>
      <ConfirmationDialog
        onClose={onCloseConfirmation}
        title={'Delete this configuration?'}
        error={confirmationConfigError()}
        actions={
          <ActionsPanel style={{ padding: 0 }}>
            <Button
              buttonType="secondary"
              onClick={onCloseConfirmation}
              className="cancel"
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              onClick={onRemoveConfig}
              loading={deleteConfigConfirmDialog.submitting}
            >
              Delete
            </Button>
          </ActionsPanel>
        }
        open={deleteConfigConfirmDialog.open}
      >
        <Typography>
          Are you sure you want to delete this NodeBalancer Configuration?
        </Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

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

export default NodeBalancerCreate;
