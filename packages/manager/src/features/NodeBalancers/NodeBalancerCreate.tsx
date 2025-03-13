import {
  useAccountAgreements,
  useMutateAccountAgreements,
  useNodeBalancerTypesQuery,
  useNodebalancerCreateMutation,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import {
  Accordion,
  ActionsPanel,
  Box,
  Button,
  Notice,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createLazyRoute } from '@tanstack/react-router';
import { append, clone, compose, defaultTo, lensPath, over } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CheckoutSummary } from 'src/components/CheckoutSummary/CheckoutSummary';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { SelectFirewallPanel } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { FIREWALL_GET_STARTED_LINK } from 'src/constants';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendCreateNodeBalancerEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import {
  DOCS_LINK_LABEL_DC_PRICING,
  PRICE_ERROR_TOOLTIP_TEXT,
} from 'src/utilities/pricing/constants';
import {
  getDCSpecificPriceByType,
  renderMonthlyPriceToCorrectDecimalPlace,
} from 'src/utilities/pricing/dynamicPricing';
import { reportAgreementSigningError } from 'src/utilities/reportAgreementSigningError';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';
import { NodeBalancerConfigPanel } from './NodeBalancerConfigPanel';
import {
  createNewNodeBalancerConfig,
  createNewNodeBalancerConfigNode,
  transformConfigsForRequest,
} from './utils';

import type { NodeBalancerConfigFieldsWithStatus } from './types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { Tag } from 'src/components/TagsInput/TagsInput';

interface NodeBalancerConfigFieldsWithStatusAndErrors
  extends NodeBalancerConfigFieldsWithStatus {
  errors?: APIError[];
}

interface NodeBalancerFieldsState {
  configs: NodeBalancerConfigFieldsWithStatusAndErrors[];
  firewall_id?: number;
  label?: string;
  region?: string;
  tags?: string[];
}

const errorResources = {
  address: 'address',
  label: 'label',
  region: 'region',
  tags: 'tags',
};

const defaultDeleteConfigConfirmDialogState = {
  errors: undefined,
  idxToDelete: undefined,
  open: false,
  submitting: false,
};

const defaultFieldsStates = {
  configs: [createNewNodeBalancerConfig(true)],
};

const NodeBalancerCreate = () => {
  const { data: agreements } = useAccountAgreements();
  const { data: profile } = useProfile();
  const { data: regions } = useRegionsQuery();
  const { data: types } = useNodeBalancerTypesQuery();

  const {
    error,
    isPending,
    mutateAsync: createNodeBalancer,
  } = useNodebalancerCreateMutation();

  const history = useHistory();

  const [
    nodeBalancerFields,
    setNodeBalancerFields,
  ] = React.useState<NodeBalancerFieldsState>(defaultFieldsStates);

  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const [
    deleteConfigConfirmDialog,
    setDeleteConfigConfirmDialog,
  ] = React.useState<{
    errors?: APIError[];
    idxToDelete?: number;
    open: boolean;
    submitting: boolean;
  }>(defaultDeleteConfigConfirmDialogState);

  const { mutateAsync: updateAgreements } = useMutateAccountAgreements();

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_nodebalancers',
  });

  const addNodeBalancer = () => {
    if (isRestricted) {
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

  const onNodeModeChange = (
    configIdx: number,
    nodeIdx: number,
    value: string
  ) => setNodeValue(configIdx, nodeIdx, 'mode', value);

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

    if (hasSignedAgreement) {
      updateAgreements({
        eu_model: true,
      }).catch(reportAgreementSigningError);
    }

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
      idxToDelete: configIdx,
      open: true,
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

  const onConfigValueChange = <
    Key extends keyof NodeBalancerConfigFieldsWithStatusAndErrors
  >(
    configId: number,
    key: Key,
    value: NodeBalancerConfigFieldsWithStatusAndErrors[Key]
  ) => {
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

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: nodeBalancerFields.region ?? '',
  });

  const regionLabel = regions?.find((r) => r.id === nodeBalancerFields.region)
    ?.label;

  const price = getDCSpecificPriceByType({
    regionId: nodeBalancerFields.region,
    type: types?.[0],
  });
  const isInvalidPrice = Boolean(nodeBalancerFields.region && !price);

  const summaryItems = [];

  if (regionLabel) {
    summaryItems.push({ title: regionLabel });
  }

  if (nodeBalancerFields.firewall_id) {
    summaryItems.push({ title: 'Firewall Assigned' });
  }

  summaryItems.push({
    details: nodeBalancerFields.configs.length,
    title: 'Configs',
  });

  summaryItems.push({
    details: nodeBalancerFields.configs.reduce(
      (acc, config) => acc + config.nodes.length,
      0
    ),
    title: 'Nodes',
  });

  if (nodeBalancerFields.region) {
    summaryItems.unshift({
      title: `$${renderMonthlyPriceToCorrectDecimalPlace(
        price ? Number(price) : undefined
      )}/month`,
    });
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Create a NodeBalancer" />
      <LandingHeader
        breadcrumbProps={{
          breadcrumbDataAttrs: {
            'data-qa-create-nodebalancer-header': true,
          },
          crumbOverrides: [{ label: 'NodeBalancers', position: 1 }],
          pathname: '/nodebalancers/create',
        }}
        title="Create"
      />
      {generalError && !isRestricted && (
        <Notice spacingTop={8} variant="error">
          <ErrorMessage
            entity={{ type: 'nodebalancer_id' }}
            message={generalError}
          />
        </Notice>
      )}
      {isRestricted && (
        <Notice
          text={getRestrictedResourceText({
            action: 'create',
            resourceType: 'NodeBalancers',
          })}
          important
          spacingTop={16}
          variant="error"
        />
      )}
      <Stack spacing={2}>
        <Paper>
          <TextField
            disabled={isRestricted}
            errorText={hasErrorFor('label')}
            label={'NodeBalancer Label'}
            noMarginTop
            onChange={labelChange}
            value={nodeBalancerFields.label || ''}
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
            disabled={isRestricted}
            onChange={tagsChange}
            tagError={hasErrorFor('tags')}
          />
        </Paper>
        <Paper>
          <Stack
            alignItems="flex-start"
            direction="row"
            flexWrap="wrap"
            gap={2}
            justifyContent="space-between"
          >
            <RegionSelect
              textFieldProps={{
                helperText: <RegionHelperText mb={2} />,
                helperTextPosition: 'top',
              }}
              currentCapability="NodeBalancers"
              disableClearable
              errorText={hasErrorFor('region')}
              noMarginTop
              onChange={(e, region) => regionChange(region?.id ?? '')}
              regions={regions ?? []}
              value={nodeBalancerFields.region ?? ''}
            />
            <DocsLink
              href="https://www.linode.com/pricing"
              label={DOCS_LINK_LABEL_DC_PRICING}
            />
          </Stack>
        </Paper>
        <SelectFirewallPanel
          handleFirewallChange={(firewallId: number) => {
            setNodeBalancerFields((prev) => ({
              ...prev,
              firewall_id: firewallId > 0 ? firewallId : undefined,
            }));
          }}
          helperText={
            <Typography>
              Assign an existing Firewall to this NodeBalancer to control
              inbound network traffic.{' '}
              <Link to={FIREWALL_GET_STARTED_LINK}>Learn more</Link>.
            </Typography>
          }
          disabled={isRestricted}
          entityType="nodebalancer"
          selectedFirewallId={nodeBalancerFields.firewall_id ?? -1}
        />
      </Stack>
      <Box marginBottom={2} marginTop={2}>
        {nodeBalancerFields.configs.map((nodeBalancerConfig, idx) => {
          const onChange = (key: keyof NodeBalancerConfigFieldsWithStatus) => (
            value: any
          ) => onConfigValueChange(idx, key, value);

          return (
            <Accordion
              heading={`Configuration - Port ${
                nodeBalancerFields.configs[idx].port ?? ''
              }`}
              sx={{
                padding: 1,
              }}
              defaultExpanded
              key={idx}
            >
              <NodeBalancerConfigPanel
                healthCheckAttempts={
                  nodeBalancerFields.configs[idx].check_attempts!
                }
                healthCheckInterval={
                  nodeBalancerFields.configs[idx].check_interval!
                }
                healthCheckTimeout={
                  nodeBalancerFields.configs[idx].check_timeout!
                }
                onHealthCheckTypeChange={(value) => {
                  onChange('check')(value);
                  afterHealthCheckTypeUpdate(idx);
                }}
                onNodeAddressChange={(nodeIndex, value) =>
                  onNodeAddressChange(idx, nodeIndex, value)
                }
                onNodeLabelChange={(nodeIndex, value) =>
                  onNodeLabelChange(idx, nodeIndex, value)
                }
                onNodeModeChange={(nodeIndex, value) =>
                  onNodeModeChange(idx, nodeIndex, value)
                }
                onNodePortChange={(nodeIndex, value) =>
                  onNodePortChange(idx, nodeIndex, value)
                }
                onNodeWeightChange={(nodeIndex, value) =>
                  onNodeWeightChange(idx, nodeIndex, value)
                }
                onProtocolChange={(value) => {
                  onChange('protocol')(value);
                  afterProtocolUpdate(idx);
                }}
                onUdpCheckPortChange={(value) =>
                  onChange('udp_check_port')(value)
                }
                addNode={addNodeBalancerConfigNode(idx)}
                algorithm={nodeBalancerFields.configs[idx].algorithm!}
                checkBody={nodeBalancerFields.configs[idx].check_body!}
                checkPassive={nodeBalancerFields.configs[idx].check_passive!}
                checkPath={nodeBalancerFields.configs[idx].check_path!}
                configIdx={idx}
                disabled={isRestricted}
                errors={nodeBalancerConfig.errors}
                healthCheckType={nodeBalancerFields.configs[idx].check!}
                nodeBalancerRegion={nodeBalancerFields.region}
                nodes={nodeBalancerFields.configs[idx].nodes}
                onAlgorithmChange={onChange('algorithm')}
                onCheckBodyChange={onChange('check_body')}
                onCheckPassiveChange={onChange('check_passive')}
                onCheckPathChange={onChange('check_path')}
                onDelete={onDeleteConfig(idx)}
                onHealthCheckAttemptsChange={onChange('check_attempts')}
                onHealthCheckIntervalChange={onChange('check_interval')}
                onHealthCheckTimeoutChange={onChange('check_timeout')}
                onPortChange={onChange('port')}
                onPrivateKeyChange={onChange('ssl_key')}
                onProxyProtocolChange={onChange('proxy_protocol')}
                onSessionStickinessChange={onChange('stickiness')}
                onSslCertificateChange={onChange('ssl_cert')}
                port={nodeBalancerFields.configs[idx].port!}
                privateKey={nodeBalancerFields.configs[idx].ssl_key!}
                protocol={nodeBalancerFields.configs[idx].protocol!}
                proxyProtocol={nodeBalancerFields.configs[idx].proxy_protocol!}
                removeNode={removeNodeBalancerConfigNode(idx)}
                sessionStickiness={nodeBalancerFields.configs[idx].stickiness!}
                sslCertificate={nodeBalancerFields.configs[idx].ssl_cert!}
                udpCheckPort={nodeBalancerFields.configs[idx].udp_check_port!}
              />
            </Accordion>
          );
        })}
      </Box>
      <Button
        buttonType="outlined"
        disabled={isRestricted}
        onClick={addNodeBalancer}
        sx={matchesSmDown ? { marginLeft: theme.spacing(2) } : null}
      >
        Add another Configuration
      </Button>
      <CheckoutSummary
        displaySections={summaryItems}
        heading={`Summary ${nodeBalancerFields.label ?? ''}`}
      />
      {showGDPRCheckbox && (
        <Box display="flex">
          <EUAgreementCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
          />
        </Box>
      )}
      <Box
        sx={{
          marginTop: theme.spacing(4),
        }}
        display="flex"
        justifyContent={'flex-end'}
      >
        <Button
          disabled={
            (showGDPRCheckbox && !hasSignedAgreement) ||
            isRestricted ||
            isInvalidPrice
          }
          sx={{
            flexShrink: 0,
            mx: matchesSmDown ? theme.spacing(1) : null,
          }}
          buttonType="primary"
          data-qa-deploy-nodebalancer
          loading={isPending}
          onClick={onCreate}
          tooltipText={isInvalidPrice ? PRICE_ERROR_TOOLTIP_TEXT : ''}
        >
          Create NodeBalancer
        </Button>
      </Box>
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Delete',
              loading: deleteConfigConfirmDialog.submitting,
              onClick: onRemoveConfig,
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onCloseConfirmation,
            }}
            style={{ padding: 0 }}
          />
        }
        error={confirmationConfigError()}
        onClose={onCloseConfirmation}
        open={deleteConfigConfirmDialog.open}
        title={'Delete this configuration?'}
      >
        <Typography>
          Are you sure you want to delete this NodeBalancer Configuration?
        </Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

/* @todo: move to own file */
export const lensFrom = (p1: (number | string)[]) => (
  p2: (number | string)[]
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
    const errorFields = error?.field?.split('|') ?? [''];
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

export const nodeBalancerCreateLazyRoute = createLazyRoute(
  '/nodebalancers/create'
)({
  component: NodeBalancerCreate,
});

export default NodeBalancerCreate;
