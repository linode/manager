import {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import TextField from 'src/components/TextField';
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
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import KubeCheckoutBar from '../KubeCheckoutBar';
import { NodePoolPanel } from './NodePoolPanel';
import LandingHeader from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { plansNoticesUtils } from 'src/utilities/planNotices';

const useStyles = makeStyles((theme: Theme) => ({
  inner: {
    '& > div': {
      marginBottom: theme.spacing(2),
    },
    '& label': {
      color: theme.color.headline,
      fontWeight: 600,
      letterSpacing: '0.25px',
      lineHeight: '1.33rem',
      margin: 0,
    },
  },
  inputWidth: {
    '& .react-select__menu': {
      maxWidth: 440,
    },
    maxWidth: 440,
  },
  regionSubtitle: {
    '& .MuiInput-root': {
      maxWidth: 440,
    },
    '& .react-select__menu': {
      maxWidth: 440,
    },
    '& p': {
      fontWeight: 500,
      lineHeight: '1.43rem',
      margin: 0,
      maxWidth: '100%',
    },
  },
  root: {
    '& .mlMain': {
      flexBasis: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '78.8%',
        maxWidth: '78.8%',
      },
    },
    '& .mlSidebar': {
      flexBasis: '100%',
      maxWidth: '100%',
      position: 'static',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '21.2%',
        maxWidth: '21.2%',
        position: 'sticky',
      },
      width: '100%',
    },
  },
  sidebar: {
    background: 'none',
    marginTop: '0px !important',
    paddingTop: '0px !important',
    [theme.breakpoints.down('lg')]: {
      background: theme.color.white,
      marginTop: `${theme.spacing(3)} !important`,
      padding: `${theme.spacing(3)} !important`,
    },
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing()} !important`,
    },
  },
}));

export const CreateCluster = () => {
  const classes = useStyles();
  const {
    data: allTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useAllTypes();

  const {
    mutateAsync: createKubernetesCluster,
  } = useCreateKubernetesClusterMutation();

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];

  // Only want to use current types here.
  const typesData = filterCurrentTypes(allTypes?.map(extendType));

  // Only include regions that have LKE capability
  const filteredRegions = React.useMemo(() => {
    return regionsData
      ? regionsData.filter((thisRegion) =>
          thisRegion.capabilities.includes('Kubernetes')
        )
      : [];
  }, [regionsData]);

  const [selectedRegionID, setSelectedRegionID] = React.useState<string>('');
  const [nodePools, setNodePools] = React.useState<KubeNodePoolResponse[]>([]);
  const [label, setLabel] = React.useState<string | undefined>();
  const [highAvailability, setHighAvailability] = React.useState<boolean>(
    false
  );
  const [version, setVersion] = React.useState<Item<string> | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [hasAgreed, setAgreed] = React.useState<boolean>(false);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const {
    data: versionData,
    isError: versionLoadError,
  } = useKubernetesVersionQuery();
  const versions = (versionData ?? []).map((thisVersion) => ({
    label: thisVersion.id,
    value: thisVersion.id,
  }));
  const history = useHistory();

  React.useEffect(() => {
    if (filteredRegions.length === 1 && !selectedRegionID) {
      setSelectedRegionID(filteredRegions[0].id);
    }
  }, [filteredRegions, selectedRegionID]);

  const createCluster = () => {
    const { push } = history;

    setErrors(undefined);
    setSubmitting(true);

    const k8s_version = version ? version.value : undefined;

    /**
     * Only type and count to the API.
     */
    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as CreateNodePoolData[];

    const payload: CreateKubeClusterPayload = {
      control_plane: { high_availability: highAvailability },
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
    /**
     * If the new label is an empty string, use undefined.
     * This allows it to pass Yup validation.
     */
    setLabel(newLabel ? newLabel : undefined);
  };

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
    /**
     * This information is necessary to create a Cluster.
     * Otherwise, show an error state.
     */

    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <Grid container className={classes.root}>
      <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
      <ProductInformationBanner bannerLocation="Kubernetes" warning important />
      <LandingHeader
        title="Create Cluster"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
      />
      <Grid className={`mlMain py0`}>
        {errorMap.none && <Notice error text={errorMap.none} />}
        <Paper data-qa-label-header>
          <div className={classes.inner}>
            <Box>
              <TextField
                className={classes.inputWidth}
                data-qa-label-input
                errorText={errorMap.label}
                label="Cluster Label"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateLabel(e.target.value)
                }
                value={label || ''}
              />
            </Box>
            <Box>
              <RegionSelect
                className={classes.regionSubtitle}
                errorText={errorMap.region}
                handleSelection={(regionID: string) =>
                  setSelectedRegionID(regionID)
                }
                regions={filteredRegions}
                selectedID={selectedID}
                textFieldProps={{
                  helperText: <RegionHelperText />,
                  helperTextPosition: 'top',
                }}
              />
            </Box>
            <Box>
              <Select
                className={classes.inputWidth}
                label="Kubernetes Version"
                value={version || null}
                errorText={errorMap.k8s_version}
                options={versions}
                placeholder={' '}
                onChange={(selected: Item<string>) => setVersion(selected)}
                isClearable={false}
              />
            </Box>
          </div>
          <Box>
            <NodePoolPanel
              types={typesData || []}
              apiError={errorMap.node_pools}
              typesLoading={typesLoading}
              typesError={
                typesError
                  ? getAPIErrorOrDefault(
                      typesError,
                      'Error loading Linode type information.'
                    )[0].reason
                  : undefined
              }
              regionsData={regionsData}
              isPlanPanelDisabled={isPlanPanelDisabled}
              hasSelectedRegion={hasSelectedRegion}
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
              addNodePool={(pool: KubeNodePoolResponse) => addPool(pool)}
            />
          </Box>
        </Paper>
      </Grid>
      <Grid
        className={`mlSidebar ${classes.sidebar}`}
        data-testid="kube-checkout-bar"
      >
        <KubeCheckoutBar
          pools={nodePools}
          createCluster={createCluster}
          submitting={submitting}
          updatePool={updatePool}
          removePool={removePool}
          highAvailability={highAvailability}
          setHighAvailability={setHighAvailability}
          region={selectedRegionID}
          hasAgreed={hasAgreed}
          toggleHasAgreed={toggleHasAgreed}
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
        />
      </Grid>
    </Grid>
  );
};

export default CreateCluster;
