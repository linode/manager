import { Autocomplete, Box, Notice, Paper, Stack, TextField } from '@linode/ui';
import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import {
  getKubeControlPlaneACL,
  getKubeHighAvailability,
  getLatestVersion,
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
  useLkeStandardOrEnterpriseVersions,
} from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account/account';
import {
  reportAgreementSigningError,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import {
  useCreateKubernetesClusterBetaMutation,
  useCreateKubernetesClusterMutation,
  useKubernetesTypesQuery,
} from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useAllTypes } from 'src/queries/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import KubeCheckoutBar from '../KubeCheckoutBar';
import { ApplicationPlatform } from './ApplicationPlatform';
import { ClusterTypePanel } from './ClusterTypePanel';
import { ControlPlaneACLPane } from './ControlPlaneACLPane';
import {
  StyledDocsLinkContainer,
  StyledFieldWithDocsStack,
  useStyles,
} from './CreateCluster.styles';
import { HAControlPlane } from './HAControlPlane';
import { NodePoolPanel } from './NodePoolPanel';

import type {
  CreateKubeClusterPayload,
  KubeNodePoolResponse,
  KubernetesTier,
} from '@linode/api-v4/lib/kubernetes';
import type { APIError } from '@linode/api-v4/lib/types';

export const CreateCluster = () => {
  const { classes } = useStyles();
  const [version, setVersion] = React.useState<string | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [hasAgreed, setAgreed] = React.useState<boolean>(false);
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const [controlPlaneACL, setControlPlaneACL] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];
  const history = useHistory();
  const { data: account } = useAccount();
  const { showAPL } = useAPLAvailability();
  const { showHighAvailability } = getKubeHighAvailability(account);
  const { showControlPlaneACL } = getKubeControlPlaneACL(account);
  const [selectedTier, setSelectedTier] = React.useState<KubernetesTier>(
    'standard'
  );

  const {
    isLoadingVersions,
    versions: versionData,
    versionsError,
  } = useLkeStandardOrEnterpriseVersions(selectedTier);

  const versions = (versionData ?? []).map((thisVersion) => ({
    label: thisVersion.id,
    value: thisVersion.id,
  }));

  const formValues = React.useMemo(() => {
    return {
      apl_enabled: false,
      hasAgreed,
      tier: 'standard' as KubernetesTier,
    };
  }, [hasAgreed]);

  const { control, getValues, handleSubmit, setValue, watch } = useForm<
    Required<CreateKubeClusterPayload>
  >({
    defaultValues: formValues,
  });

  const selectedRegion = watch('region');
  const nodePool = watch('node_pools');
  const aplEnabled = watch('apl_enabled');

  const {
    data: kubernetesHighAvailabilityTypesData,
    isError: isErrorKubernetesTypes,
    isLoading: isLoadingKubernetesTypes,
  } = useKubernetesTypesQuery(selectedTier === 'enterprise');

  React.useEffect(() => {
    if (versions.length > 0) {
      setVersion(getLatestVersion(versions).value);
    }
  }, [versionData]);

  const handleClusterTypeSelection = (tier: KubernetesTier) => {
    setSelectedTier(tier);
    // HA is enabled by default for enterprise clusters
    if (tier === 'enterprise') {
      setValue('control_plane.high_availability', true);

      // When changing the tier to enterprise, we want to check if the pre-selected region has the capability
      if (!getValues('region')?.includes('Kubernetes Enterprise')) {
        setValue('region', '');
      }
    } else {
      setValue('control_plane.high_availability', undefined);
    }
  };

  const lkeHAType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-ha'
  );

  const lkeEnterpriseType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-e'
  );

  const {
    data: allTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useAllTypes();

  // Only want to use current types here.
  const typesData = filterCurrentTypes(allTypes?.map(extendType));
  const {
    mutateAsync: createKubernetesCluster,
  } = useCreateKubernetesClusterMutation();

  const {
    mutateAsync: createKubernetesClusterBeta,
  } = useCreateKubernetesClusterBetaMutation();

  const {
    isLkeEnterpriseLAFeatureEnabled,
    isLkeEnterpriseLAFlagEnabled,
  } = useIsLkeEnterpriseEnabled();

  const createCluster = (formData: any) => {
    const {
      apl_enabled,
      control_plane,
      hasAgreed,
      label,
      node_pools,
      region,
    } = formData;

    const { push } = history;
    setSubmitting(true);

    const _ipv4 = control_plane.acl?.addresses?.ipv4 || [];

    const _ipv6 = control_plane.acl?.addresses?.ipv6 || [];

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
          ...((_ipv4?.length > 0 || _ipv6.length > 0) && {
            addresses: {
              ...addressIPv4Payload,
              ...addressIPv6Payload,
            },
          }),
        },
        high_availability: control_plane.high_availability ?? false,
      },
      k8s_version: version,
      label,
      node_pools,
      region,
    };

    if (apl_enabled) {
      payload = { ...payload, apl_enabled };
    }

    if (isLkeEnterpriseLAFeatureEnabled) {
      payload = { ...payload, tier: selectedTier };
    }

    // Choose the correct function to create the cluster
    const createClusterFn =
      apl_enabled || isLkeEnterpriseLAFeatureEnabled
        ? createKubernetesClusterBeta
        : createKubernetesCluster;

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

  const addPool = (pool: Partial<KubeNodePoolResponse>) => {
    const currentPools = getValues('node_pools') || [];
    const updatedPools = [...currentPools, pool];
    setValue('node_pools', updatedPools as KubeNodePoolResponse[]);
  };

  const updatePool = (poolIdx: number, updatedPool: KubeNodePoolResponse) => {
    const currentPools = getValues('node_pools') || [];
    currentPools[poolIdx] = updatedPool;
    setValue('node_pools', [...currentPools]);
  };

  const removePool = (poolIdx: number) => {
    const currentPools = getValues('node_pools');
    const updatedPools = currentPools.filter((_, index) => index !== poolIdx);
    setValue('node_pools', updatedPools);
  };

  const highAvailabilityPrice = getDCSpecificPriceByType({
    regionId: selectedRegion,
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
    selectedRegionID: '',
  });

  if (typesError || regionsError || versionsError) {
    // This information is necessary to create a Cluster. Otherwise, show an error state.
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  const onSubmit = handleSubmit((data) => {
    // console.log(isSubmitting);
    createCluster(data);
  });

  return (
    <form onSubmit={onSubmit}>
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
                formPayloadValues={{ node_pools: getValues('node_pools') }}
                message={generalError}
              />
            </Notice>
          )}
          <Paper data-qa-label-header>
            <Controller
              render={({ field }) => (
                <TextField
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e.target.value);
                  }}
                  data-qa-label-input
                  errorText={errorMap.label}
                  label="Cluster Label"
                  value={field.value || ''}
                />
              )}
              control={control}
              name="label"
            />

            {isLkeEnterpriseLAFlagEnabled && (
              <>
                <Divider sx={{ marginBottom: 2, marginTop: 4 }} />
                <Controller
                  render={({}) => (
                    <ClusterTypePanel
                      handleClusterTypeSelection={handleClusterTypeSelection}
                      selectedTier={selectedTier}
                    />
                  )}
                  control={control}
                  name="tier"
                />
              </>
            )}
            <Divider sx={{ marginTop: 4 }} />
            <StyledFieldWithDocsStack>
              <Stack>
                <Controller
                  render={({ field }) => (
                    <RegionSelect
                      {...field}
                      currentCapability={
                        isLkeEnterpriseLAFeatureEnabled &&
                        selectedTier === 'enterprise'
                          ? 'Kubernetes Enterprise'
                          : 'Kubernetes'
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      textFieldProps={{
                        helperText: <RegionHelperText mb={2} />,
                        helperTextPosition: 'top',
                      }}
                      tooltipText={
                        isLkeEnterpriseLAFeatureEnabled &&
                        selectedTier === 'enterprise'
                          ? 'Only regions that support Kubernetes Enterprise are listed.'
                          : undefined
                      }
                      disableClearable
                      errorText={errorMap.region}
                      onChange={(_, region) => field.onChange(region.id)}
                      ref={null}
                      regions={regionsData}
                    />
                  )}
                  control={control}
                  name="region"
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
            </StyledFieldWithDocsStack>
            <Divider sx={{ marginTop: 4 }} />
            <Controller
              render={() => (
                <Autocomplete
                  onChange={(_, selected) => {
                    setVersion(selected?.value);
                  }}
                  disableClearable={!!version}
                  errorText={errorMap.k8s_version}
                  label="Kubernetes Version"
                  loading={isLoadingVersions}
                  options={versions}
                  placeholder={' '}
                  value={versions.find((v) => v.value === version) ?? null}
                />
              )}
              control={control}
              name="k8s_version"
            />

            {showAPL && (
              <>
                <Divider sx={{ marginTop: 4 }} />
                <StyledFieldWithDocsStack>
                  <Stack>
                    <Controller
                      render={({ field }) => (
                        <ApplicationPlatform
                          setAPL={(value) => {
                            field.onChange(value);
                            setValue('control_plane.acl.enabled', value);
                          }}
                          setHighAvailability={(value) => {
                            setValue('control_plane.high_availability', value);
                          }}
                        />
                      )}
                      control={control}
                      name="apl_enabled"
                    />
                  </Stack>
                </StyledFieldWithDocsStack>
              </>
            )}
            <Divider sx={{ marginTop: showAPL ? 1 : 4 }} />
            {showHighAvailability && selectedTier !== 'enterprise' && (
              <Box data-testid="ha-control-plane">
                <Controller
                  render={() => (
                    <HAControlPlane
                      highAvailabilityPrice={
                        isErrorKubernetesTypes || !highAvailabilityPrice
                          ? UNKNOWN_PRICE
                          : highAvailabilityPrice
                      }
                      setHighAvailability={(value) =>
                        setValue('control_plane.high_availability', value)
                      }
                      isAPLEnabled={aplEnabled}
                      isErrorKubernetesTypes={isErrorKubernetesTypes}
                      isLoadingKubernetesTypes={isLoadingKubernetesTypes}
                      selectedRegionId={getValues('region')}
                    />
                  )}
                  control={control}
                  name="control_plane.high_availability"
                />
              </Box>
            )}
            {showControlPlaneACL && (
              <>
                {selectedTier !== 'enterprise' && <Divider />}
                <Controller
                  render={({ field }) => (
                    <ControlPlaneACLPane
                      handleIPv4Change={(value) => {
                        const updatedACL = { ...field.value };
                        if (!updatedACL.addresses) {
                          updatedACL.addresses = {};
                        }
                        if (
                          JSON.stringify(updatedACL.addresses.ipv4) !==
                          JSON.stringify(value)
                        ) {
                          updatedACL.addresses.ipv4 = value;
                          field.onChange(updatedACL);
                        }
                      }}
                      handleIPv6Change={(value) => {
                        const updatedACL = { ...field.value };
                        if (!updatedACL.addresses) {
                          updatedACL.addresses = {};
                        }
                        if (
                          JSON.stringify(updatedACL.addresses.ipv6) !==
                          JSON.stringify(value)
                        ) {
                          updatedACL.addresses.ipv6 = value;
                          field.onChange(updatedACL);
                        }
                      }}
                      updateFor={[
                        getValues('control_plane.acl.addresses.ipv4'),
                        getValues('control_plane.acl.addresses.ipv6'),
                        setControlPlaneACL,
                        errorMap,
                        controlPlaneACL,
                      ]}
                      enableControlPlaneACL={controlPlaneACL}
                      errorText={errorMap.control_plane}
                      setControlPlaneACL={setControlPlaneACL}
                    />
                  )}
                  control={control}
                  name="control_plane.acl"
                />
              </>
            )}
            <Divider sx={{ marginBottom: 4 }} />
            <Controller
              render={() => (
                <NodePoolPanel
                  addNodePool={(nodePool: Partial<KubeNodePoolResponse>) => {
                    addPool(nodePool);
                  }}
                  isSelectedRegionEligibleForPlan={
                    isSelectedRegionEligibleForPlan
                  }
                  typesError={
                    typesError
                      ? getAPIErrorOrDefault(
                          typesError,
                          'Error loading Linode type information.'
                        )[0].reason
                      : undefined
                  }
                  apiError={errorMap.node_pools}
                  hasSelectedRegion={hasSelectedRegion}
                  isAPLEnabled={aplEnabled}
                  isPlanPanelDisabled={isPlanPanelDisabled}
                  regionsData={regionsData}
                  selectedRegionId={selectedRegion}
                  types={typesData || []}
                  typesLoading={typesLoading}
                />
              )}
              control={control}
              name="node_pools"
            />
          </Paper>
        </Grid>
        <Grid
          className={`mlSidebar ${classes.sidebar}`}
          data-testid="kube-checkout-bar"
        >
          <KubeCheckoutBar
            highAvailabilityPrice={
              isErrorKubernetesTypes || !highAvailabilityPrice
                ? UNKNOWN_PRICE
                : highAvailabilityPrice
            }
            updateFor={[
              hasAgreed,
              getValues('control_plane.high_availability'),
              getValues('region'),
              getValues('node_pools'),
              submitting,
              typesData,
              updatePool,
              removePool,
              onSubmit,
              createCluster,
              classes,
            ]}
            createCluster={onSubmit}
            enterprisePrice={lkeEnterpriseType?.price.monthly ?? undefined}
            hasAgreed={hasAgreed}
            highAvailability={getValues('control_plane.high_availability')}
            pools={nodePool as KubeNodePoolResponse[]}
            region={getValues('region')}
            regionsData={regionsData}
            removePool={removePool}
            showHighAvailability={showHighAvailability}
            submitting={submitting}
            toggleHasAgreed={toggleHasAgreed}
            updatePool={updatePool}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export const createClusterLazyRoute = createLazyRoute('/kubernetes/create')({
  component: CreateCluster,
});
