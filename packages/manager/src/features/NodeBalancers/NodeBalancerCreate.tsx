import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { Box } from 'src/components/Box';
import Accordion from 'src/components/Accordion';
import Paper from 'src/components/core/Paper';
import LandingHeader from 'src/components/LandingHeader';
import { TextField } from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { SelectRegionPanel } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';
import { CheckoutSummary } from 'src/components/CheckoutSummary/CheckoutSummary';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import { NodeBalancerConfigPanel } from './NodeBalancerConfigPanel';
import { Notice } from 'src/components/Notice/Notice';
import { sendCreateNodeBalancerEvent } from 'src/utilities/analytics';
import { TagsInput, Tag } from 'src/components/TagsInput/TagsInput';
import { useGrants, useProfile } from 'src/queries/profile';
import { useHistory } from 'react-router-dom';
import { useNodebalancerCreateMutation } from 'src/queries/nodebalancers';
import { useRegionsQuery } from 'src/queries/regions';
import {
  append,
  clone,
  compose,
  defaultTo,
  lensPath,
  over,
  pathOr,
} from 'ramda';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  transformConfigsForRequest,
} from './utils';
import {
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import type { APIError } from '@linode/api-v4/lib/types';
import type { NodeBalancerConfigFieldsWithStatus } from './types';

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

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const disabled =
    Boolean(profile?.restricted) && !grants?.global.add_nodebalancers;

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
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      newConfigs[configIdx].nodes = [
        ...newConfigs[configIdx].nodes,
        createNewNodeBalancerConfigNode(),
      ];
      return { ...prev, configs: newConfigs };
    });

  const removeNodeBalancerConfigNode = (configIdx: number) => (
    nodeIdx: number
  ) =>
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      newConfigs[configIdx].nodes = newConfigs[configIdx].nodes.filter(
        (_, idx) => idx !== nodeIdx
      );
      return { ...prev, configs: newConfigs };
    });

  const setNodeValue = (
    cidx: number,
    nodeidx: number,
    key: string,
    value: any
  ) =>
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      const newNodeArray = [...prev.configs[cidx].nodes];
      newNodeArray[nodeidx] = { ...newNodeArray[nodeidx], [key]: value };
      newConfigs[cidx].nodes = newNodeArray;
      return { ...prev, configs: newConfigs };
    });

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

  const afterProtocolUpdate = (configIdx: number) => {
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      newConfigs[configIdx].ssl_cert = '';
      newConfigs[configIdx].ssl_key = '';
      return { ...prev, configs: newConfigs };
    });
  };

  const afterHealthCheckTypeUpdate = (configIdx: number) => {
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      newConfigs[configIdx].check_path =
        defaultFieldsStates.configs[0].check_path;

      newConfigs[configIdx].check_body =
        defaultFieldsStates.configs[0].check_body;

      newConfigs[configIdx].check_attempts =
        defaultFieldsStates.configs[0].check_attempts;

      newConfigs[configIdx].check_timeout =
        defaultFieldsStates.configs[0].check_timeout;

      newConfigs[configIdx].check_interval =
        defaultFieldsStates.configs[0].check_interval;

      return { ...prev, configs: newConfigs };
    });
  };

  const clearNodeErrors = () => {
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs].map((config) => ({
        ...config,
        errors: [],
        nodes: config.nodes.map((node) => ({ ...node, errors: [] })),
      }));

      return { ...prev, configs: newConfigs };
    });
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
        // Analytics Event
        sendCreateNodeBalancerEvent(`Region: ${nodeBalancer.region}`);
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

  const onConfigValueChange = (configId: number, key: string, value: any) => {
    setNodeBalancerFields((prev) => {
      const newConfigs = [...prev.configs];
      newConfigs[configId][key] = value;
      return { ...prev, configs: newConfigs };
    });
  };

  const labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeBalancerFields((prev) => ({
      ...prev,
      label: e.target.value,
    }));
  };

  const tagsChange = (tags: Tag[]) => {
    setNodeBalancerFields((prev) => ({
      ...prev,
      tags: tags.map((tag) => tag.value),
    }));
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
    setNodeBalancerFields((prev) => ({
      ...prev,
      configs: newConfigs,
    }));
  };

  const regionChange = (region: string) => {
    // No change; no need to update the state.
    if (nodeBalancerFields.region === region) {
      return;
    }

    setNodeBalancerFields((prev) => ({
      ...prev,
      region,
    }));

    // We just changed the region so any selected IP addresses are likely invalid
    resetNodeAddresses();
  };

  const onCloseConfirmation = () =>
    setDeleteConfigConfirmDialog(clone(defaultDeleteConfigConfirmDialogState));

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
          const onChange = (key: keyof NodeBalancerConfigFieldsWithStatus) => (
            value: any
          ) => onConfigValueChange(idx, key, value);

          return (
            <Accordion
              heading={`Configuration - Port ${
                nodeBalancerFields.configs[idx].port ?? ''
              }`}
              key={idx}
              defaultExpanded
            >
              <NodeBalancerConfigPanel
                nodeBalancerRegion={nodeBalancerFields.region}
                errors={nodeBalancerConfig.errors}
                configIdx={idx}
                algorithm={nodeBalancerFields.configs[idx].algorithm!}
                onAlgorithmChange={onChange('algorithm')}
                checkPassive={nodeBalancerFields.configs[idx].check_passive!}
                onCheckPassiveChange={onChange('check_passive')}
                checkBody={nodeBalancerFields.configs[idx].check_body!}
                onCheckBodyChange={onChange('check_body')}
                checkPath={nodeBalancerFields.configs[idx].check_path!}
                onCheckPathChange={onChange('check_path')}
                port={nodeBalancerFields.configs[idx].port!}
                onPortChange={onChange('port')}
                protocol={nodeBalancerFields.configs[idx].protocol!}
                proxyProtocol={nodeBalancerFields.configs[idx].proxy_protocol!}
                onProtocolChange={(value) => {
                  onChange('protocol')(value);
                  afterProtocolUpdate(idx);
                }}
                onProxyProtocolChange={onChange('proxy_protocol')}
                healthCheckType={nodeBalancerFields.configs[idx].check!}
                onHealthCheckTypeChange={(value) => {
                  onChange('check')(value);
                  afterHealthCheckTypeUpdate(idx);
                }}
                healthCheckAttempts={
                  nodeBalancerFields.configs[idx].check_attempts!
                }
                onHealthCheckAttemptsChange={onChange('check_attempts')}
                healthCheckInterval={
                  nodeBalancerFields.configs[idx].check_interval!
                }
                onHealthCheckIntervalChange={onChange('check_interval')}
                healthCheckTimeout={
                  nodeBalancerFields.configs[idx].check_timeout!
                }
                onHealthCheckTimeoutChange={onChange('check_timeout')}
                sessionStickiness={nodeBalancerFields.configs[idx].stickiness!}
                onSessionStickinessChange={onChange('stickiness')}
                sslCertificate={nodeBalancerFields.configs[idx].ssl_cert!}
                onSslCertificateChange={onChange('ssl_cert')}
                privateKey={nodeBalancerFields.configs[idx].ssl_key!}
                onPrivateKeyChange={onChange('ssl_key')}
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
        disabled={disabled}
        sx={matchesSmDown ? { marginLeft: theme.spacing(2) } : null}
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
        <Button
          buttonType="primary"
          onClick={onCreate}
          loading={isLoading}
          data-qa-deploy-nodebalancer
          sx={matchesSmDown ? { marginRight: theme.spacing(1) } : null}
        >
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
