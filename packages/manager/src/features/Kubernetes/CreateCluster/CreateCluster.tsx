import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import {
  getKubeControlPlaneACL,
  getKubeHighAvailability,
  getLatestVersion,
} from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account/account';
import {
  reportAgreementSigningError,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import {
  useCreateKubernetesClusterMutation,
  useKubernetesTypesQuery,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useAllTypes } from 'src/queries/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { stringToExtendedIP } from 'src/utilities/ipUtils';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import KubeCheckoutBar from '../KubeCheckoutBar';
import { ControlPlaneACLPane } from './ControlPlaneACLPane';
import {
  StyledDocsLinkContainer,
  StyledRegionSelectStack,
  useStyles,
} from './CreateCluster.styles';
import { HAControlPlane } from './HAControlPlane';
import { NodePoolPanel } from './NodePoolPanel';

import type {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { APIError } from '@linode/api-v4/lib/types';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export const CreateCluster = () => {
  const { classes } = useStyles();
  const [selectedRegionId, setSelectedRegionId] = React.useState<
    string | undefined
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
  const [controlPlaneACL, setControlPlaneACL] = React.useState<boolean>(true);

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];
  const history = useHistory();
  const { data: account } = useAccount();
  const { showHighAvailability } = getKubeHighAvailability(account);
  const { showControlPlaneACL } = getKubeControlPlaneACL(account);
  const [ipV4Addr, setIPv4Addr] = React.useState<ExtendedIP[]>([
    stringToExtendedIP(''),
  ]);
  const [ipV6Addr, setIPv6Addr] = React.useState<ExtendedIP[]>([
    stringToExtendedIP(''),
  ]);

  const {
    data: kubernetesHighAvailabilityTypesData,
    isError: isErrorKubernetesTypes,
    isLoading: isLoadingKubernetesTypes,
  } = useKubernetesTypesQuery();

  const lkeHAType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-ha'
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
    data: versionData,
    isError: versionLoadError,
  } = useKubernetesVersionQuery();

  const versions = (versionData ?? []).map((thisVersion) => ({
    label: thisVersion.id,
    value: thisVersion.id,
  }));

  React.useEffect(() => {
    if (versions.length > 0) {
      setVersion(getLatestVersion(versions).value);
    }
  }, [versionData]);

  const createCluster = () => {
    const { push } = history;
    setErrors(undefined);
    setSubmitting(true);

    // Only type and count to the API.
    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as CreateNodePoolData[];

    const _ipv4 = ipV4Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const _ipv6 = ipV6Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const addressIPv4Payload = {
      ...(_ipv4.length > 0 && { ipv4: _ipv4 }),
    };

    const addressIPv6Payload = {
      ...(_ipv6.length > 0 && { ipv6: _ipv6 }),
    };

    const payload: CreateKubeClusterPayload = {
      control_plane: {
        acl: {
          enabled: controlPlaneACL,
          'revision-id': '',
          ...((_ipv4.length > 0 || _ipv6.length > 0) && {
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
      region: selectedRegionId,
    };

    createKubernetesCluster(payload)
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
    regionId: selectedRegionId,
    type: lkeHAType,
  });

  const errorMap = getErrorMap(
    ['region', 'node_pools', 'label', 'k8s_version', 'versionLoad'],
    errors
  );

  const generalError = errorMap.none;

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID: selectedRegionId,
  });

  if (typesError || regionsError || versionLoadError) {
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
        <Paper data-qa-label-header>
          <TextField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateLabel(e.target.value)
            }
            data-qa-label-input
            errorText={errorMap.label}
            label="Cluster Label"
            value={label || ''}
          />
          <Divider sx={{ marginTop: 4 }} />
          <StyledRegionSelectStack>
            <Stack>
              <RegionSelect
                textFieldProps={{
                  helperText: <RegionHelperText mb={2} />,
                  helperTextPosition: 'top',
                }}
                currentCapability="Kubernetes"
                disableClearable
                errorText={errorMap.region}
                onChange={(e, region) => setSelectedRegionId(region.id)}
                regions={regionsData}
                value={selectedRegionId}
              />
            </Stack>
            <StyledDocsLinkContainer>
              <DocsLink
                href="https://www.linode.com/pricing"
                label={DOCS_LINK_LABEL_DC_PRICING}
              />
            </StyledDocsLinkContainer>
          </StyledRegionSelectStack>
          <Divider sx={{ marginTop: 4 }} />
          <Autocomplete
            onChange={(_, selected) => {
              setVersion(selected?.value);
            }}
            disableClearable={!!version}
            errorText={errorMap.k8s_version}
            label="Kubernetes Version"
            options={versions}
            placeholder={' '}
            value={versions.find((v) => v.value === version) ?? null}
          />
          <Divider sx={{ marginTop: 4 }} />
          {showHighAvailability && (
            <Box data-testid="ha-control-plane">
              <HAControlPlane
                highAvailabilityPrice={
                  isErrorKubernetesTypes || !highAvailabilityPrice
                    ? UNKNOWN_PRICE
                    : highAvailabilityPrice
                }
                isErrorKubernetesTypes={isErrorKubernetesTypes}
                isLoadingKubernetesTypes={isLoadingKubernetesTypes}
                selectedRegionId={selectedRegionId}
                setHighAvailability={setHighAvailability}
              />
            </Box>
          )}
          {showControlPlaneACL && (
            <>
              <Divider />
              <Box data-testid="control-plane-acl">
                <ControlPlaneACLPane
                  handleIPv4Change={(newIpV4Addr: ExtendedIP[]) => {
                    setIPv4Addr(newIpV4Addr);
                  }}
                  handleIPv6Change={(newIpV6Addr: ExtendedIP[]) => {
                    setIPv6Addr(newIpV6Addr);
                  }}
                  enableControlPlaneACL={controlPlaneACL}
                  ipV4Addr={ipV4Addr}
                  ipV6Addr={ipV6Addr}
                  setControlPlaneACL={setControlPlaneACL}
                />
              </Box>
            </>
          )}
          <Divider sx={{ marginBottom: 4 }} />
          <NodePoolPanel
            typesError={
              typesError
                ? getAPIErrorOrDefault(
                    typesError,
                    'Error loading Linode type information.'
                  )[0].reason
                : undefined
            }
            addNodePool={(pool: KubeNodePoolResponse) => addPool(pool)}
            apiError={errorMap.node_pools}
            hasSelectedRegion={hasSelectedRegion}
            isPlanPanelDisabled={isPlanPanelDisabled}
            isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
            regionsData={regionsData}
            selectedRegionId={selectedRegionId}
            types={typesData || []}
            typesLoading={typesLoading}
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
            highAvailability,
            selectedRegionId,
            nodePools,
            submitting,
            typesData,
            updatePool,
            removePool,
            createCluster,
            classes,
          ]}
          createCluster={createCluster}
          hasAgreed={hasAgreed}
          highAvailability={highAvailability}
          pools={nodePools}
          region={selectedRegionId}
          regionsData={regionsData}
          removePool={removePool}
          showHighAvailability={showHighAvailability}
          submitting={submitting}
          toggleHasAgreed={toggleHasAgreed}
          updatePool={updatePool}
        />
      </Grid>
    </Grid>
  );
};
