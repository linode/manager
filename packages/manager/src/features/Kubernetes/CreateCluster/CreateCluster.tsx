import { Region } from '@linode/api-v4';
import {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { DynamicPriceNotice } from 'src/components/DynamicPriceNotice';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { TextField } from 'src/components/TextField';
import {
  getKubeHighAvailability,
  getLatestVersion,
} from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account';
import {
  reportAgreementSigningError,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import {
  useCreateKubernetesClusterMutation,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions';
import { useAllTypes } from 'src/queries/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPrice } from 'src/utilities/pricing/dynamicPricing';
import { doesRegionHaveUniquePricing } from 'src/utilities/pricing/linodes';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import KubeCheckoutBar from '../KubeCheckoutBar';
import { useStyles } from './CreateCluster.styles';
import { HAControlPlane } from './HAControlPlane';
import { NodePoolPanel } from './NodePoolPanel';

export const CreateCluster = () => {
  const classes = useStyles();
  const [selectedRegionID, setSelectedRegionID] = React.useState<string>('');
  const [nodePools, setNodePools] = React.useState<KubeNodePoolResponse[]>([]);
  const [label, setLabel] = React.useState<string | undefined>();
  const [version, setVersion] = React.useState<Item<string> | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [hasAgreed, setAgreed] = React.useState<boolean>(false);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const [highAvailability, setHighAvailability] = React.useState<boolean>();

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];
  const history = useHistory();
  const { data: account } = useAccount();
  const { showHighAvailability } = getKubeHighAvailability(account);

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

  // Only include regions that have LKE capability
  const filteredRegions = React.useMemo(() => {
    return regionsData
      ? regionsData.filter((thisRegion) =>
          thisRegion.capabilities.includes('Kubernetes')
        )
      : [];
  }, [regionsData]);

  const {
    data: versionData,
    isError: versionLoadError,
  } = useKubernetesVersionQuery();

  const versions = (versionData ?? []).map((thisVersion) => ({
    label: thisVersion.id,
    value: thisVersion.id,
  }));

  React.useEffect(() => {
    if (filteredRegions.length === 1 && !selectedRegionID) {
      setSelectedRegionID(filteredRegions[0].id);
    }
  }, [filteredRegions, selectedRegionID]);

  React.useEffect(() => {
    if (versions.length > 0) {
      setVersion(getLatestVersion(versions));
    }
  }, [versionData]);

  const createCluster = () => {
    const { push } = history;
    setErrors(undefined);
    setSubmitting(true);
    const k8s_version = version ? version.value : undefined;

    // Only type and count to the API.
    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as CreateNodePoolData[];

    const payload: CreateKubeClusterPayload = {
      control_plane: { high_availability: highAvailability ?? false },
      k8s_version,
      label,
      node_pools,
      region: selectedRegionID,
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
        scrollErrorIntoView();
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

  /**
   * @param regionId - region selection or null if no selection made
   * @returns dynamically calculated high availability price by region
   */
  const getHighAvailabilityPrice = (regionId: Region['id'] | null) => {
    const dcSpecificPrice = regionId
      ? getDCSpecificPrice({ basePrice: LKE_HA_PRICE, regionId })
      : undefined;
    return dcSpecificPrice ? parseFloat(dcSpecificPrice) : undefined;
  };

  const showPricingNotice = doesRegionHaveUniquePricing(
    selectedRegionID,
    typesData
  );

  const errorMap = getErrorMap(
    ['region', 'node_pools', 'label', 'k8s_version', 'versionLoad'],
    errors
  );

  const selectedID = selectedRegionID || null;

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID,
  });

  if (typesError || regionsError || versionLoadError) {
    // This information is necessary to create a Cluster. Otherwise, show an error state.
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <Grid className={classes.root} container>
      <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
        title="Create Cluster"
      />
      <Grid className={`mlMain py0`}>
        {errorMap.none && <Notice text={errorMap.none} variant="error" />}
        <Paper data-qa-label-header>
          <TextField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateLabel(e.target.value)
            }
            className={classes.inputWidth}
            data-qa-label-input
            errorText={errorMap.label}
            label="Cluster Label"
            value={label || ''}
          />
          <Divider sx={{ marginTop: 4 }} />
          <RegionSelect
            handleSelection={(regionID: string) =>
              setSelectedRegionID(regionID)
            }
            textFieldProps={{
              helperText: <RegionHelperText mb={2} />,
              helperTextPosition: 'top',
            }}
            className={classes.regionSubtitle}
            errorText={errorMap.region}
            regions={filteredRegions}
            selectedID={selectedID}
          />
          {showPricingNotice && (
            <DynamicPriceNotice region={selectedRegionID} spacingBottom={16} />
          )}
          <Divider sx={{ marginTop: 4 }} />
          <Select
            onChange={(selected: Item<string>) => {
              setVersion(selected);
            }}
            className={classes.inputWidth}
            errorText={errorMap.k8s_version}
            isClearable={false}
            label="Kubernetes Version"
            options={versions}
            placeholder={' '}
            value={version || null}
          />
          <Divider sx={{ marginTop: 4 }} />
          {showHighAvailability ? (
            <Box data-testid="ha-control-plane">
              <HAControlPlane
                highAvailabilityPrice={
                  getHighAvailabilityPrice(selectedID) ?? LKE_HA_PRICE
                }
                setHighAvailability={setHighAvailability}
              />
            </Box>
          ) : null}
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
            selectedRegionId={selectedRegionID}
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
            getHighAvailabilityPrice(selectedID) ?? LKE_HA_PRICE
          }
          updateFor={[
            hasAgreed,
            highAvailability,
            selectedRegionID,
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
          region={selectedRegionID}
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
