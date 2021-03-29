import {
  createKubernetesCluster,
  PoolNodeRequest,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { useRegionsQuery } from 'src/queries/regions';
import { useKubernetesVersionQuery } from 'src/queries/kubernetesVersion';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';
import KubeCheckoutBar from '../KubeCheckoutBar';
import NodePoolPanel from './NodePoolPanel';

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
  main: {},
  sidebar: {
    background: theme.color.white,
    padding: `0px 0px ${theme.spacing(1)}px ${theme.spacing(3)}px !important`,
    [theme.breakpoints.up('lg')]: {
      background: 'none',
    },
  },
  inner: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2),
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
      marginBottom: 4,
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

type CombinedProps = RouteComponentProps<{}> & WithTypesProps;

const regionHelperText = (
  <React.Fragment>
    You can use
    {` `}
    <a
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
      href="https://www.linode.com/speedtest"
      style={{ fontWeight: 600 }}
    >
      our speedtest page
    </a>
    {` `}
    to find the best region for your current location.
  </React.Fragment>
);

export const CreateCluster: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { typesData: allTypes, typesLoading, typesError } = props;

  const { data, error: regionsError } = useRegionsQuery();
  const regionsData = data ?? [];

  // Only want to use current types here.
  const typesData = filterCurrentTypes(allTypes);

  // Only include regions that have LKE capability
  const filteredRegions = React.useMemo(() => {
    return regionsData
      ? regionsData.filter((thisRegion) =>
          thisRegion.capabilities.includes('Kubernetes')
        )
      : [];
  }, [regionsData]);

  const [selectedRegion, setSelectedRegion] = React.useState<string>('');
  const [nodePools, setNodePools] = React.useState<PoolNodeWithPrice[]>([]);
  const [label, setLabel] = React.useState<string | undefined>();
  const [version, setVersion] = React.useState<Item<string> | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const {
    data: versionData,
    isError: versionLoadError,
  } = useKubernetesVersionQuery();
  const versions = (versionData ?? []).map((thisVersion) => ({
    value: thisVersion.id,
    label: thisVersion.id,
  }));

  React.useEffect(() => {
    if (filteredRegions.length === 1 && !selectedRegion) {
      setSelectedRegion(filteredRegions[0].id);
    }
  }, [filteredRegions, selectedRegion]);

  const createCluster = () => {
    const {
      history: { push },
    } = props;

    setErrors(undefined);
    setSubmitting(true);

    const k8s_version = version ? version.value : undefined;

    /**
     * We need to remove the monthly price, which is used for client-side
     * calculations, and send only type and count to the API.
     */
    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as PoolNodeRequest[];
    const payload = {
      region: selectedRegion,
      node_pools,
      label,
      k8s_version,
    };

    createKubernetesCluster(payload)
      .then((cluster) => push(`/kubernetes/clusters/${cluster.id}`))
      .catch((err) => {
        setErrors(getAPIErrorOrDefault(err, 'Error creating your cluster'));
        setSubmitting(false);
        scrollErrorIntoView();
      });
  };

  const addPool = (pool: PoolNodeWithPrice) => {
    setNodePools([...nodePools, pool]);
  };

  const updatePool = (poolIdx: number, updatedPool: PoolNodeWithPrice) => {
    const updatedPoolWithPrice = {
      ...updatedPool,
      totalMonthlyPrice: getMonthlyPrice(
        updatedPool.type,
        updatedPool.count,
        props.typesData || []
      ),
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

    return <ErrorState errorText={'An unexpected error occurred.'} />;
  }

  return (
    <Grid container className={classes.root}>
      <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
      <Grid
        container
        className="m0"
        alignItems="center"
        justify="space-between"
      >
        <Grid item className="p0">
          <Breadcrumb
            pathname={location.pathname}
            labelTitle="Create Cluster"
            labelOptions={{ noCap: true }}
          />
        </Grid>
        <Grid item className="p0">
          <DocumentationButton href="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/" />
        </Grid>
      </Grid>

      <Grid item className={`mlMain py0`}>
        <div className={classes.main}>
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
                  textFieldProps={
                    // Only show the "Find out which region is best for you" message if there are
                    // actually multiple regions to choose from.
                    filteredRegions.length > 1
                      ? {
                          helperText: regionHelperText,
                          helperTextPosition: 'top',
                        }
                      : undefined
                  }
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
                addNodePool={(pool: PoolNodeWithPrice) => addPool(pool)}
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
        </div>
      </Grid>
      <Grid
        item
        className={`${classes.sidebar} mlSidebar`}
        data-testid="kube-checkout-bar"
      >
        <KubeCheckoutBar
          pools={nodePools}
          createCluster={createCluster}
          submitting={submitting}
          updatePool={updatePool}
          removePool={removePool}
          typesData={typesData || []}
          updateFor={[
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

const enhanced = compose<CombinedProps, {}>(withRouter, withTypes);

export default enhanced(CreateCluster);
