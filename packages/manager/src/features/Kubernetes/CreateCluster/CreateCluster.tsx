import {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import { regionHelperText } from 'src/components/SelectRegionPanel/SelectRegionPanel';
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
import NodePoolPanel from './NodePoolPanel';
import LandingHeader from 'src/components/LandingHeader';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .mlMain': {
      maxWidth: '100%',
      flexBasis: '100%',
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
        flexBasis: '78.8%',
      },
    },
    '& .mlSidebar': {
      position: 'static',
      width: '100%',
      flexBasis: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('lg')]: {
        position: 'sticky',
        maxWidth: '21.2%',
        flexBasis: '21.2%',
      },
    },
  },
  sidebar: {
    marginTop: '0px !important',
    paddingTop: '0px !important',
    background: 'none',
    [theme.breakpoints.down('lg')]: {
      padding: `${theme.spacing(3)} !important`,
      marginTop: `${theme.spacing(3)} !important`,
      background: theme.color.white,
    },
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing()} !important`,
    },
  },
  inner: {
    '& > div': {
      marginBottom: theme.spacing(2),
    },
    '& label': {
      color: theme.color.headline,
      fontWeight: 600,
      lineHeight: '1.33rem',
      letterSpacing: '0.25px',
      margin: 0,
    },
  },
  inputWidth: {
    maxWidth: 440,
    '& .react-select__menu': {
      maxWidth: 440,
    },
  },
  regionSubtitle: {
    '& p': {
      fontWeight: 500,
      lineHeight: '1.43rem',
      margin: 0,
      maxWidth: '100%',
    },
    '& .MuiInput-root': {
      maxWidth: 440,
    },
    '& .react-select__menu': {
      maxWidth: 440,
    },
  },
}));

export const CreateCluster = () => {
  const classes = useStyles();
  const {
    data: allTypes,
    isLoading: typesLoading,
    error: typesError,
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

  const [selectedRegion, setSelectedRegion] = React.useState<string>('');
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
    value: thisVersion.id,
    label: thisVersion.id,
  }));
  const history = useHistory();

  React.useEffect(() => {
    if (filteredRegions.length === 1 && !selectedRegion) {
      setSelectedRegion(filteredRegions[0].id);
    }
  }, [filteredRegions, selectedRegion]);

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
      region: selectedRegion,
      node_pools,
      label,
      k8s_version,
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

  const selectedID = selectedRegion || null;

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
      <LandingHeader
        title="Create Cluster"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
      />
      <Grid item className={`mlMain py0`}>
        {errorMap.none && <Notice error text={errorMap.none} />}
        <Paper data-qa-label-header>
          <div className={classes.inner}>
            <Grid item>
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
            </Grid>
            <Grid item>
              <RegionSelect
                className={classes.regionSubtitle}
                errorText={errorMap.region}
                handleSelection={(regionID: string) =>
                  setSelectedRegion(regionID)
                }
                regions={filteredRegions}
                selectedID={selectedID}
                textFieldProps={{
                  helperText: regionHelperText(),
                  helperTextPosition: 'top',
                }}
              />
            </Grid>
            <Grid item>
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
            </Grid>
          </div>
          <Grid item>
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
              addNodePool={(pool: KubeNodePoolResponse) => addPool(pool)}
              updateFor={[
                nodePools,
                typesData,
                errorMap,
                typesLoading,
                classes,
              ]}
              isOnCreate
            />
          </Grid>
        </Paper>
      </Grid>
      <Grid
        item
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
          region={selectedRegion}
          hasAgreed={hasAgreed}
          toggleHasAgreed={toggleHasAgreed}
          updateFor={[
            hasAgreed,
            highAvailability,
            selectedRegion,
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
