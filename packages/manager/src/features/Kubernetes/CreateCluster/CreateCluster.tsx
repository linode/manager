import {
  useAccount,
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
import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { LandingHeader } from 'src/components/LandingHeader';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  getKubeControlPlaneACL,
  getKubeHighAvailability,
  getLatestVersion,
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
  useLkeStandardOrEnterpriseVersions,
} from 'src/features/Kubernetes/kubeUtils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useCreateKubernetesClusterBetaMutation,
  useCreateKubernetesClusterMutation,
  useKubernetesTypesQuery,
} from 'src/queries/kubernetes';
import { useAllTypes } from 'src/queries/types';
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
import { ApplicationPlatform } from './ApplicationPlatform';
import { ClusterNetworkingPanel } from './ClusterNetworkingPanel';
import { ClusterTierPanel } from './ClusterTierPanel';
import { ControlPlaneACLPane } from './ControlPlaneACLPane';
import {
  StyledDocsLinkContainer,
  StyledStackWithTabletBreakpoint,
  useStyles,
} from './CreateCluster.styles';
import { HAControlPlane } from './HAControlPlane';
import { NodePoolPanel } from './NodePoolPanel';

import type {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
  KubernetesTier,
} from '@linode/api-v4/lib/kubernetes';
import type { Region } from '@linode/api-v4/lib/regions';
import type { APIError } from '@linode/api-v4/lib/types';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export const CreateCluster = () => {
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const { classes } = useStyles();
  const [selectedRegion, setSelectedRegion] = React.useState<
    Region | undefined
  >();
  const [nodePools, setNodePools] = React.useState<KubeNodePoolResponse[]>([]);
  const [label, setLabel] = React.useState<string | undefined>();
  const [version, setVersion] = React.useState<string | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [hasAgreed, setAgreed] = React.useState<boolean>(false);
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const [highAvailability, setHighAvailability] = React.useState<boolean>();
  const [controlPlaneACL, setControlPlaneACL] = React.useState<boolean>(false);
  const [apl_enabled, setApl_enabled] = React.useState<boolean>(false);

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];
  const history = useHistory();
  const { data: account } = useAccount();
  const { showAPL } = useAPLAvailability();
  const { showHighAvailability } = getKubeHighAvailability(account);
  const { showControlPlaneACL } = getKubeControlPlaneACL(account);
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
      setNodePools(
        nodePools.map((nodePool) => ({
          ...nodePool,
          count: Math.min(
            nodePool.count,
            tier === 'enterprise'
              ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
              : MAX_NODES_PER_POOL_STANDARD_TIER
          ),
        }))
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
    globalGrantType: 'add_kubernetes',
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

  const { isLkeEnterpriseLAFeatureEnabled, isLkeEnterpriseLAFlagEnabled } =
    useIsLkeEnterpriseEnabled();

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

  const createCluster = async () => {
    if (ipV4Addr.some((ip) => ip.error) || ipV6Addr.some((ip) => ip.error)) {
      scrollErrorIntoViewV2(formContainerRef);
      return;
    }

    const { push } = history;
    setErrors(undefined);
    setSubmitting(true);

    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as CreateNodePoolData[];

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
          'revision-id': '',
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
      payload = { ...payload, apl_enabled };
    }

    if (isLkeEnterpriseLAFeatureEnabled) {
      payload = { ...payload, tier: selectedTier };
    }

    const createClusterFn =
      isAPLSupported || isLkeEnterpriseLAFeatureEnabled
        ? createKubernetesClusterBeta
        : createKubernetesCluster;

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
        push(`/kubernetes/clusters/${cluster.id}`);
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

  const addPool = (pool: KubeNodePoolResponse) => {
    setNodePools([...nodePools, pool]);
  };

  const updatePool = (poolIdx: number, updatedPool: KubeNodePoolResponse) => {
    const updatedPoolWithPrice = {
      ...updatedPool,
    };
    setNodePools(update(poolIdx, updatedPoolWithPrice, nodePools));
  };

  const removePool = (poolIdx: number) => {
    const updatedPools = remove(poolIdx, 1, nodePools);
    setNodePools(updatedPools);
  };

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
    <Grid className={classes.root} container ref={formContainerRef}>
      <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        title="Create Cluster"
      />
      <Grid className={`mlMain py0`}>
        {generalError && (
          <Notice variant="error">
            <ErrorMessage
              entity={{ type: 'lkecluster_id' }}
              formPayloadValues={{ node_pools: nodePools }}
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
                    setAPL={setApl_enabled}
                    setHighAvailability={setHighAvailability}
                  />
                </Stack>
              </StyledStackWithTabletBreakpoint>
            </>
          )}
          <Divider
            sx={{
              marginBottom: selectedTier === 'enterprise' ? 3 : 1,
              marginTop: showAPL ? 1 : 4,
            }}
          />
          {showHighAvailability && selectedTier !== 'enterprise' && (
            <Box data-testid="ha-control-plane">
              <HAControlPlane
                highAvailabilityPrice={
                  isErrorKubernetesTypes || !highAvailabilityPrice
                    ? UNKNOWN_PRICE
                    : highAvailabilityPrice
                }
                isAPLEnabled={apl_enabled}
                isErrorKubernetesTypes={isErrorKubernetesTypes}
                isLoadingKubernetesTypes={isLoadingKubernetesTypes}
                selectedRegionId={selectedRegion?.id}
                setHighAvailability={setHighAvailability}
              />
            </Box>
          )}
          {selectedTier === 'enterprise' && <ClusterNetworkingPanel />}
          {showControlPlaneACL && (
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
          )}
          <Divider sx={{ marginBottom: 4 }} />
          <NodePoolPanel
            addNodePool={(pool: KubeNodePoolResponse) => addPool(pool)}
            apiError={errorMap.node_pools}
            hasSelectedRegion={hasSelectedRegion}
            isAPLEnabled={apl_enabled}
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
        className={`mlSidebar ${classes.sidebar}`}
        data-testid="kube-checkout-bar"
      >
        <KubeCheckoutBar
          createCluster={createCluster}
          enterprisePrice={lkeEnterpriseType?.price.monthly ?? undefined}
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
          removePool={removePool}
          showHighAvailability={showHighAvailability}
          submitting={submitting}
          toggleHasAgreed={toggleHasAgreed}
          updateFor={[
            hasAgreed,
            highAvailability,
            selectedRegion?.id,
            nodePools,
            submitting,
            typesData,
            updatePool,
            removePool,
            createCluster,
            classes,
          ]}
          updatePool={updatePool}
        />
      </Grid>
    </Grid>
  );
};

export const createClusterLazyRoute = createLazyRoute('/kubernetes/create')({
  component: CreateCluster,
});
