import {
  useAllTypes,
  useMutateAccountAgreements,
  useRegionsQuery,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Box,
  ErrorState,
  Notice,
  Paper,
  Select,
  Stack,
  TextField,
} from '@linode/ui';
import { plansNoticesUtils, scrollErrorIntoViewV2 } from '@linode/utilities';
import { createKubeClusterWithRequiredACLSchema } from '@linode/validation';
import { Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { pick } from 'ramda';
import * as React from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { LandingHeader } from 'src/components/LandingHeader';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  getLatestVersion,
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
  useKubernetesBetaEndpoint,
  useLkeStandardOrEnterpriseVersions,
} from 'src/features/Kubernetes/kubeUtils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useCreateKubernetesClusterBetaMutation,
  useCreateKubernetesClusterMutation,
  useKubernetesTypesQuery,
} from 'src/queries/kubernetes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { stringToExtendedIP, validateIPs } from 'src/utilities/ipUtils';
import {
  DOCS_LINK_LABEL_DC_PRICING,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';
import { reportAgreementSigningError } from 'src/utilities/reportAgreementSigningError';

import {
  CLUSTER_VERSIONS_DOCS_LINK,
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../constants';
import KubeCheckoutBar from '../KubeCheckoutBar';
import { NodePoolConfigDrawer } from '../KubernetesPlansPanel/NodePoolConfigDrawer';
import { ApplicationPlatform } from './ApplicationPlatform';
import { ClusterNetworkingPanel } from './ClusterNetworkingPanel';
import { ClusterTierPanel } from './ClusterTierPanel';
import { ControlPlaneACLPane } from './ControlPlaneACLPane';
import {
  StyledDocsLinkContainer,
  StyledStackWithTabletBreakpoint,
} from './CreateCluster.styles';
import { HAControlPlane } from './HAControlPlane';
import { NodePoolPanel } from './NodePoolPanel';

import type { NodePoolConfigDrawerMode } from '../KubernetesPlansPanel/NodePoolConfigDrawer';
import type {
  APIError,
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubernetesStackType,
  KubernetesTier,
  Region,
} from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface CreateClusterFormValues {
  nodePools: CreateNodePoolData[];
  stack_type: KubernetesStackType | null;
  subnet_id?: number;
  vpc_id?: number;
}

export interface NodePoolConfigDrawerHandlerParams {
  drawerMode: NodePoolConfigDrawerMode;
  isOpen: boolean;
  planLabel?: string;
  poolIndex?: number;
}

export const CreateCluster = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const [selectedRegion, setSelectedRegion] = React.useState<
    Region | undefined
  >();
  const [label, setLabel] = React.useState<string | undefined>();
  const [version, setVersion] = React.useState<string | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [hasAgreed, setAgreed] = React.useState<boolean>(false);
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const [highAvailability, setHighAvailability] = React.useState<boolean>();
  const [controlPlaneACL, setControlPlaneACL] = React.useState<boolean>(false);
  const [aplEnabled, setAplEnabled] = React.useState<boolean>(false);

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];
  const { showAPL } = useAPLAvailability();
  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();
  const [ipV4Addr, setIPv4Addr] = React.useState<ExtendedIP[]>([
    stringToExtendedIP(''),
  ]);
  const [ipV6Addr, setIPv6Addr] = React.useState<ExtendedIP[]>([
    stringToExtendedIP(''),
  ]);
  const [selectedTier, setSelectedTier] =
    React.useState<KubernetesTier>('standard');
  const [isACLAcknowledgementChecked, setIsACLAcknowledgementChecked] =
    React.useState(false);
  const [isNodePoolConfigDrawerOpen, setIsNodePoolConfigDrawerOpen] =
    React.useState(false);
  const [nodePoolConfigDrawerMode, setNodePoolConfigDrawerMode] =
    React.useState<NodePoolConfigDrawerMode>('add');
  const [selectedType, setSelectedType] = React.useState<string>();
  const [selectedPoolIndex, setSelectedPoolIndex] = React.useState<number>();

  const {
    isLkeEnterpriseLAFeatureEnabled,
    isLkeEnterpriseLAFlagEnabled,
    isLkeEnterprisePhase2FeatureEnabled,
    isLkeEnterprisePostLAFeatureEnabled,
  } = useIsLkeEnterpriseEnabled();

  // Use React Hook Form for node pools to make updating pools and their configs easier.
  // TODO - Future: use RHF for the rest of the form and replace FormValues with CreateKubeClusterPayload.
  const { control, trigger, formState, ...form } =
    useForm<CreateClusterFormValues>({
      defaultValues: {
        nodePools: [],
        stack_type: isLkeEnterprisePhase2FeatureEnabled ? 'ipv4' : null,
      },
      shouldUnregister: true,
    });
  const nodePools = useWatch({ control, name: 'nodePools' });
  const { update } = useFieldArray({
    control,
    name: 'nodePools',
  });

  const {
    data: kubernetesHighAvailabilityTypesData,
    isError: isErrorKubernetesTypes,
    isLoading: isLoadingKubernetesTypes,
  } = useKubernetesTypesQuery(selectedTier === 'enterprise');

  // LKE-E does not support APL at this time.
  const isAPLSupported = showAPL && selectedTier === 'standard';

  const handleClusterTierSelection = (tier: KubernetesTier) => {
    setSelectedTier(tier);

    // HA and ACL are enabled by default for enterprise clusters
    if (tier === 'enterprise') {
      setHighAvailability(true);
      setControlPlaneACL(true);

      // When changing the tier to enterprise, we want to check if the pre-selected region has the capability
      if (!selectedRegion?.capabilities.includes('Kubernetes Enterprise')) {
        setSelectedRegion(undefined);
      }
    } else {
      setHighAvailability(undefined);
      setControlPlaneACL(false);
      setIsACLAcknowledgementChecked(false);

      // Clear the ACL error if the tier is switched, since standard tier doesn't require it
      setErrors(undefined);
    }

    // If a user adds > 100 nodes in the LKE-E flow but then switches to LKE, set the max node count to 100 for correct price display
    if (isLkeEnterpriseLAFeatureEnabled) {
      nodePools.forEach((nodePool, idx) =>
        update(idx, {
          ...nodePool,
          count: Math.min(
            nodePool.count,
            tier === 'enterprise'
              ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
              : MAX_NODES_PER_POOL_STANDARD_TIER
          ),
        })
      );
    }
  };

  const lkeHAType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-ha'
  );

  const lkeEnterpriseType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-e'
  );

  const isCreateClusterRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_lkes',
  });

  const {
    data: allTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useAllTypes();

  // Only want to use current types here.
  const typesData = filterCurrentTypes(allTypes?.map(extendType));

  const { mutateAsync: createKubernetesCluster } =
    useCreateKubernetesClusterMutation();

  const { mutateAsync: createKubernetesClusterBeta } =
    useCreateKubernetesClusterBetaMutation();

  const {
    isLoadingVersions,
    versions: versionData,
    versionsError,
  } = useLkeStandardOrEnterpriseVersions(selectedTier);

  const versions = (versionData ?? []).map((thisVersion) => ({
    label: thisVersion.id,
    value: thisVersion.id,
  }));

  React.useEffect(() => {
    if (versions.length > 0) {
      setVersion(getLatestVersion(versions).value);
    }
  }, [versionData]);

  const handleOpenNodePoolConfigDrawer = ({
    drawerMode,
    isOpen,
    planLabel,
    poolIndex,
  }: NodePoolConfigDrawerHandlerParams) => {
    setNodePoolConfigDrawerMode(drawerMode);
    setIsNodePoolConfigDrawerOpen(isOpen);
    setSelectedType(planLabel);
    setSelectedPoolIndex(poolIndex);
  };

  const createCluster = async () => {
    if (ipV4Addr.some((ip) => ip.error) || ipV6Addr.some((ip) => ip.error)) {
      scrollErrorIntoViewV2(formContainerRef);
      return;
    }

    setErrors(undefined);
    setSubmitting(true);

    const node_pools = nodePools.map(
      pick(['type', 'count', 'update_strategy', 'firewall_id'])
    ) as CreateNodePoolData[];

    const vpcId = form.getValues('vpc_id');
    const subnetId = form.getValues('subnet_id');
    const stackType = form.getValues('stack_type');

    const _ipv4 = ipV4Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip !== '');

    const _ipv6 = ipV6Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip !== '');

    const addressIPv4Payload = {
      ...(_ipv4.length > 0 && { ipv4: _ipv4 }),
    };

    const addressIPv6Payload = {
      ...(_ipv6.length > 0 && { ipv6: _ipv6 }),
    };

    let payload: CreateKubeClusterPayload = {
      control_plane: {
        acl: {
          enabled: controlPlaneACL,
          ...(controlPlaneACL && // only send the IPs if we are enabling IPACL
            (_ipv4.length > 0 || _ipv6.length > 0) && {
              addresses: {
                ...addressIPv4Payload,
                ...addressIPv6Payload,
              },
            }),
        },
        high_availability: highAvailability ?? false,
      },
      k8s_version: version,
      label,
      node_pools,
      region: selectedRegion?.id,
    };

    if (isAPLSupported) {
      payload = { ...payload, apl_enabled: aplEnabled };
    }

    if (isLkeEnterpriseLAFeatureEnabled) {
      payload = { ...payload, tier: selectedTier };
    }

    if (isLkeEnterprisePhase2FeatureEnabled) {
      payload = {
        ...payload,
        vpc_id: vpcId,
        subnet_id: subnetId,
        stack_type: stackType ?? undefined,
      };
    }

    const createClusterFn = isUsingBetaEndpoint
      ? createKubernetesClusterBeta
      : createKubernetesCluster;

    // TODO: Improve error handling in M3-10429, at which point we shouldn't need this.
    if (
      (isLkeEnterprisePostLAFeatureEnabled ||
        isLkeEnterprisePhase2FeatureEnabled) &&
      selectedTier === 'enterprise'
    ) {
      // Trigger the React Hook Form validation for BYO VPC selection.
      const isValid = await trigger();
      // Don't submit the form while RHF errors persist.
      if (!isValid) {
        setSubmitting(false);
        scrollErrorIntoViewV2(formContainerRef);
        return;
      }
    }

    // Since ACL is enabled by default for LKE-E clusters, run validation on the ACL IP Address fields if the acknowledgement is not explicitly checked.
    if (selectedTier === 'enterprise' && !isACLAcknowledgementChecked) {
      try {
        await createKubeClusterWithRequiredACLSchema.validate(payload, {
          abortEarly: false,
        });
      } catch ({ errors }) {
        setErrors([{ field: 'control_plane', reason: errors[0] }]);
        setSubmitting(false);
        scrollErrorIntoViewV2(formContainerRef);

        return;
      }
    }

    createClusterFn(payload)
      .then((cluster) => {
        navigate({
          to: '/kubernetes/clusters/$clusterId/summary',
          params: { clusterId: cluster.id },
        });
        if (hasAgreed) {
          updateAccountAgreements({
            eu_model: true,
            privacy_policy: true,
          }).catch(reportAgreementSigningError);
        }
      })
      .catch((err) => {
        setErrors(getAPIErrorOrDefault(err, 'Error creating your cluster'));
        setSubmitting(false);
        scrollErrorIntoViewV2(formContainerRef);
      });
  };

  const toggleHasAgreed = () => setAgreed((prevHasAgreed) => !prevHasAgreed);

  const updateLabel = (newLabel: string) => {
    // If the new label is an empty string, use undefined. This allows it to pass Yup validation.
    setLabel(newLabel ? newLabel : undefined);
  };

  const highAvailabilityPrice = getDCSpecificPriceByType({
    regionId: selectedRegion?.id,
    type: lkeHAType,
  });

  const errorMap = getErrorMap(
    [
      'region',
      'node_pools',
      'label',
      'k8s_version',
      'versionLoad',
      'control_plane',
      'vpc_id',
      'subnet_id',
    ],
    errors
  );

  const generalError = errorMap.none;

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID: selectedRegion?.id,
  });

  if (
    typesError ||
    regionsError ||
    (versionsError && versionsError[0].reason !== 'Unauthorized')
  ) {
    // This information is necessary to create a Cluster. Otherwise, show an error state.
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <FormProvider
      control={control}
      formState={formState}
      trigger={trigger}
      {...form}
    >
      <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        title="Create Cluster"
      />
      <Grid container ref={formContainerRef} spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          {generalError && (
            <Notice variant="error">
              <ErrorMessage
                entity={{ type: 'lkecluster_id' }}
                formPayloadValues={{ node_pools: form.getValues('nodePools') }}
                message={generalError}
              />
            </Notice>
          )}
          {isCreateClusterRestricted && (
            <Notice
              sx={{ marginBottom: 2 }}
              text={getRestrictedResourceText({
                action: 'create',
                isSingular: false,
                resourceType: 'LKE Clusters',
              })}
              variant="error"
            />
          )}
          <Paper data-qa-label-header>
            <TextField
              data-qa-label-input
              disabled={isCreateClusterRestricted}
              errorText={errorMap.label}
              label="Cluster Label"
              noMarginTop
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateLabel(e.target.value)
              }
              value={label || ''}
            />
            {isLkeEnterpriseLAFlagEnabled && (
              <>
                <Divider sx={{ marginBottom: 3, marginTop: 4 }} />
                <ClusterTierPanel
                  handleClusterTierSelection={handleClusterTierSelection}
                  isUserRestricted={isCreateClusterRestricted}
                  selectedTier={selectedTier}
                />
              </>
            )}
            <Divider sx={{ marginTop: 4 }} />
            <StyledStackWithTabletBreakpoint>
              <Stack>
                <RegionSelect
                  currentCapability={
                    isLkeEnterpriseLAFeatureEnabled &&
                    selectedTier === 'enterprise'
                      ? 'Kubernetes Enterprise'
                      : 'Kubernetes'
                  }
                  disableClearable
                  disabled={isCreateClusterRestricted}
                  errorText={errorMap.region}
                  isGeckoLAEnabled={isGeckoLAEnabled}
                  onChange={(e, region) => setSelectedRegion(region)}
                  regions={regionsData}
                  textFieldProps={{
                    helperText: <RegionHelperText mb={2} />,
                    helperTextPosition: 'top',
                  }}
                  tooltipText={
                    isLkeEnterpriseLAFeatureEnabled &&
                    selectedTier === 'enterprise'
                      ? 'Only regions that support LKE Enterprise clusters are listed.'
                      : undefined
                  }
                  value={selectedRegion?.id}
                />
              </Stack>
              <StyledDocsLinkContainer
                sx={(theme) => ({ marginTop: theme.spacing(2) })}
              >
                <DocsLink
                  href="https://www.linode.com/pricing"
                  label={DOCS_LINK_LABEL_DC_PRICING}
                />
              </StyledDocsLinkContainer>
            </StyledStackWithTabletBreakpoint>
            <Divider sx={{ marginTop: 4 }} />
            <StyledStackWithTabletBreakpoint>
              <Stack>
                <Select
                  disabled={isCreateClusterRestricted}
                  errorText={errorMap.k8s_version}
                  label="Kubernetes Version"
                  loading={isLoadingVersions}
                  onChange={(_, selected) => {
                    setVersion(selected?.value);
                  }}
                  options={versions}
                  placeholder={' '}
                  sx={{ minWidth: 416 }}
                  value={versions.find((v) => v.value === version) ?? null}
                />
              </Stack>
              <StyledDocsLinkContainer
                sx={(theme) => ({ marginTop: theme.spacing(2) })}
              >
                <DocsLink
                  href={CLUSTER_VERSIONS_DOCS_LINK}
                  label="Kubernetes Versions"
                />
              </StyledDocsLinkContainer>
            </StyledStackWithTabletBreakpoint>
            {showAPL && (
              <>
                <Divider sx={{ marginTop: 4 }} />
                <StyledStackWithTabletBreakpoint>
                  <Stack>
                    <ApplicationPlatform
                      isSectionDisabled={!isAPLSupported}
                      setAPL={setAplEnabled}
                      setHighAvailability={setHighAvailability}
                    />
                  </Stack>
                </StyledStackWithTabletBreakpoint>
              </>
            )}
            <Divider
              sx={{
                marginBottom: selectedTier === 'enterprise' ? 2 : 1,
                marginTop: showAPL ? 1 : 4,
              }}
            />
            {selectedTier !== 'enterprise' && (
              <Box data-testid="ha-control-plane">
                <HAControlPlane
                  highAvailabilityPrice={
                    isErrorKubernetesTypes || !highAvailabilityPrice
                      ? UNKNOWN_PRICE
                      : highAvailabilityPrice
                  }
                  isAPLEnabled={aplEnabled}
                  isErrorKubernetesTypes={isErrorKubernetesTypes}
                  isLoadingKubernetesTypes={isLoadingKubernetesTypes}
                  selectedRegionId={selectedRegion?.id}
                  setHighAvailability={setHighAvailability}
                />
              </Box>
            )}
            {selectedTier === 'enterprise' && (
              <ClusterNetworkingPanel
                selectedRegionId={selectedRegion?.id}
                subnetErrorText={errorMap.subnet_id}
                vpcErrorText={errorMap.vpc_id}
              />
            )}
            <>
              <Divider
                sx={{ marginTop: selectedTier === 'enterprise' ? 4 : 1 }}
              />
              <ControlPlaneACLPane
                enableControlPlaneACL={controlPlaneACL}
                errorText={errorMap.control_plane}
                handleIPv4Change={(newIpV4Addr: ExtendedIP[]) => {
                  const validatedIPs = validateIPs(newIpV4Addr, {
                    allowEmptyAddress: true,
                    errorMessage: 'Must be a valid IPv4 address.',
                  });
                  setIPv4Addr(validatedIPs);
                }}
                handleIPv6Change={(newIpV6Addr: ExtendedIP[]) => {
                  const validatedIPs = validateIPs(newIpV6Addr, {
                    allowEmptyAddress: true,
                    errorMessage: 'Must be a valid IPv6 address.',
                  });
                  setIPv6Addr(validatedIPs);
                }}
                handleIsAcknowledgementChecked={(isChecked: boolean) => {
                  setIsACLAcknowledgementChecked(isChecked);
                  setIPv4Addr([stringToExtendedIP('')]);
                  setIPv6Addr([stringToExtendedIP('')]);
                }}
                ipV4Addr={ipV4Addr}
                ipV6Addr={ipV6Addr}
                isAcknowledgementChecked={isACLAcknowledgementChecked}
                selectedTier={selectedTier}
                setControlPlaneACL={setControlPlaneACL}
              />
            </>

            <Divider sx={{ marginBottom: 4 }} />
            <NodePoolPanel
              apiError={errorMap.node_pools}
              handleConfigurePool={handleOpenNodePoolConfigDrawer}
              hasSelectedRegion={hasSelectedRegion}
              isAPLEnabled={aplEnabled}
              isPlanPanelDisabled={isPlanPanelDisabled}
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
              regionsData={regionsData}
              selectedRegionId={selectedRegion?.id}
              selectedTier={selectedTier}
              types={typesData || []}
              typesError={
                typesError
                  ? getAPIErrorOrDefault(
                      typesError,
                      'Error loading Linode type information.'
                    )[0].reason
                  : undefined
              }
              typesLoading={typesLoading}
            />
          </Paper>
        </Grid>
        <Grid
          data-testid="kube-checkout-bar"
          size={{ lg: 3, md: 12, sm: 12, xs: 12 }}
        >
          <KubeCheckoutBar
            createCluster={createCluster}
            enterprisePrice={
              isLkeEnterpriseLAFeatureEnabled &&
              selectedTier === 'enterprise' &&
              lkeEnterpriseType?.price.monthly
                ? lkeEnterpriseType?.price.monthly
                : undefined
            }
            handleConfigurePool={handleOpenNodePoolConfigDrawer}
            hasAgreed={hasAgreed}
            highAvailability={highAvailability}
            highAvailabilityPrice={
              isErrorKubernetesTypes || !highAvailabilityPrice
                ? UNKNOWN_PRICE
                : highAvailabilityPrice
            }
            pools={nodePools}
            region={selectedRegion?.id}
            regionsData={regionsData}
            submitting={submitting}
            toggleHasAgreed={toggleHasAgreed}
            updateFor={[
              hasAgreed,
              highAvailability,
              selectedRegion?.id,
              nodePools,
              submitting,
              typesData,
              createCluster,
            ]}
          />
        </Grid>
      </Grid>
      <NodePoolConfigDrawer
        mode={nodePoolConfigDrawerMode}
        onClose={() => setIsNodePoolConfigDrawerOpen(false)}
        open={isNodePoolConfigDrawerOpen}
        planId={selectedType}
        poolIndex={selectedPoolIndex}
        selectedRegion={selectedRegion}
        selectedTier={selectedTier}
      />
    </FormProvider>
  );
};
