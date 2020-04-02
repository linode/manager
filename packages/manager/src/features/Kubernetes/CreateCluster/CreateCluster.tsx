import {
  createKubernetesCluster,
  getKubernetesVersions,
  KubernetesVersion,
  PoolNodeRequest
} from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose } from 'recompose';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import H1Header from 'src/components/H1Header';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import KubeCheckoutBar from '.././KubeCheckoutBar';
import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';
import NodePoolPanel from './NodePoolPanel';

type ClassNames = 'root' | 'title' | 'sidebar' | 'inner';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '45px !important'
      },
      [theme.breakpoints.up('md')]: {
        padding: `${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(
          1
        )}px ${theme.spacing(3)}px !important`
      }
    },
    inner: {
      padding: theme.spacing(3),
      paddingTop: `${theme.spacing(1)}px !important`
    }
  });

interface State {
  selectedRegion?: string;
  selectedType?: string;
  numberOfLinodes: number;
  nodePools: PoolNodeWithPrice[];
  label?: string;
  version?: Item<string>;
  errors?: APIError[];
  submitting: boolean;
  versionOptions: Item<string>[];
}

type CombinedProps = RouteComponentProps<{}> &
  WithStyles<ClassNames> &
  WithRegionsProps &
  WithTypesProps;

/**
 * It's very unlikely there will ever be more than one page of
 * active/available K8s versions. API paginates the response
 * though to match convention, so to be safe we're following
 * our own convention.
 */
const getAllVersions = getAll<KubernetesVersion>(getKubernetesVersions);

export class CreateCluster extends React.Component<CombinedProps, State> {
  state: State = {
    selectedRegion: undefined,
    selectedType: undefined,
    numberOfLinodes: 3,
    nodePools: [],
    label: undefined,
    version: undefined,
    errors: undefined,
    submitting: false,
    versionOptions: []
  };

  componentDidMount() {
    getAllVersions()
      .then(response => {
        /**
         * 1. Convert versions to Items
         * 2. Sort descending (so newest version is at top)
         * // 3. Pre-select the newest version <--- do this someday, but not now
         */
        const versionOptions = response.data
          .map(eachVersion => ({
            value: eachVersion.id,
            label: eachVersion.id
          }))
          .sort(sortByLabelDescending);
        this.setState({
          versionOptions
          // version: versionOptions[0]
        });
      })
      .catch(error => {
        this.setState({
          errors: getAPIErrorOrDefault(
            error,
            'Unable to load Kubernetes versions.',
            'versionLoad'
          )
        });
      });
  }

  createCluster = () => {
    const { selectedRegion, nodePools, label, version } = this.state;
    const {
      history: { push }
    } = this.props;

    this.setState({
      errors: undefined,
      submitting: true
    });

    const _version = version ? version.value : undefined;

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
      version: _version
    };

    createKubernetesCluster(payload)
      .then(cluster => push(`/kubernetes/clusters/${cluster.id}`))
      .catch(err =>
        this.setState(
          {
            errors: getAPIErrorOrDefault(err, 'Error creating your cluster'),
            submitting: false
          },
          scrollErrorIntoView
        )
      );
  };

  addPool = (pool: PoolNodeWithPrice) => {
    const { nodePools } = this.state;
    this.setState({
      nodePools: [...nodePools, pool]
    });
  };

  updatePool = (poolIdx: number, updatedPool: PoolNodeWithPrice) => {
    const { nodePools } = this.state;
    const updatedPoolWithPrice = {
      ...updatedPool,
      totalMonthlyPrice: getMonthlyPrice(
        updatedPool.type,
        updatedPool.count,
        this.props.typesData || []
      )
    };
    this.setState({
      nodePools: update(poolIdx, updatedPoolWithPrice, nodePools)
    });
  };

  removePool = (poolIdx: number) => {
    const { nodePools } = this.state;
    const updatedPools = remove(poolIdx, 1, nodePools);
    this.setState({
      nodePools: updatedPools
    });
  };

  updateLabel = (newLabel: string) => {
    /**
     * If the new label is an empty string, use undefined.
     * This allows it to pass Yup validation.
     */
    this.setState({ label: newLabel ? newLabel : undefined });
  };

  render() {
    const {
      classes,
      regionsData,
      typesData,
      typesLoading,
      typesError,
      regionsError
    } = this.props;

    const {
      errors,
      label,
      selectedRegion,
      selectedType,
      numberOfLinodes,
      nodePools,
      submitting,
      version,
      versionOptions
    } = this.state;

    const errorMap = getErrorMap(
      ['region', 'node_pools', 'label', 'version', 'versionLoad'],
      errors
    );

    // Only displaying regions that have LKE capability
    const filteredRegions = regionsData
      ? regionsData.filter(thisRegion =>
          thisRegion.capabilities.includes('Kubernetes')
        )
      : [];

    if (typesError || regionsError || errorMap.versionLoad) {
      /**
       * This information is necessary to create a Cluster.
       * Otherwise, show an error state.
       */

      return <ErrorState errorText={'An unexpected error occurred.'} />;
    }

    return (
      <StickyContainer>
        <Grid container spacing={2}>
          <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
          <Grid item className={`mlMain py0`}>
            <H1Header
              title="Create a Kubernetes Cluster"
              data-qa-title
              className={classes.title}
            />
            {errorMap.none && <Notice text={errorMap.none} error />}
            <SelectRegionPanel
              error={errorMap.region}
              copy={'Determine the best location for your cluster.'}
              regions={filteredRegions}
              selectedID={selectedRegion}
              handleSelection={(regionID: string) =>
                this.setState({ selectedRegion: regionID })
              }
              updateFor={[
                errorMap.region,
                filteredRegions,
                selectedRegion,
                classes
              ]}
            />

            <NodePoolPanel
              pools={nodePools}
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
              nodeCount={numberOfLinodes}
              selectedType={selectedType}
              addNodePool={(pool: PoolNodeWithPrice) => this.addPool(pool)}
              deleteNodePool={(poolIdx: number) => this.removePool(poolIdx)}
              handleTypeSelect={(newType: string) => {
                this.setState({ selectedType: newType });
              }}
              updateNodeCount={(newCount: number) => {
                this.setState({ numberOfLinodes: newCount });
              }}
              updatePool={this.updatePool}
              updateFor={[
                nodePools,
                typesData,
                errorMap,
                typesLoading,
                numberOfLinodes,
                selectedType,
                classes
              ]}
            />

            <Paper data-qa-label-header>
              <div className={classes.inner}>
                <TextField
                  data-qa-label-input
                  errorText={errorMap.label}
                  label="Cluster Label"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.updateLabel(e.target.value)
                  }
                  value={label || ''}
                />
                <Select
                  label="Version"
                  value={version || null}
                  errorText={errorMap.version}
                  options={versionOptions}
                  placeholder={'Select a Kubernetes version'}
                  onChange={(selected: Item<string>) =>
                    this.setState({ version: selected })
                  }
                  isClearable={false}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <KubeCheckoutBar
              pools={nodePools}
              createCluster={this.createCluster}
              submitting={submitting}
              removePool={this.removePool}
              updatePool={this.updatePool}
              typesData={typesData || []}
              updateFor={[nodePools, submitting, typesData, classes]}
            />
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}

const sortByLabelDescending = (a: Item, b: Item) => {
  if (a.value > b.value) {
    return -1;
  } else if (a.value < b.value) {
    return 1;
  }
  return 0;
};

const styled = withStyles(styles);

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data.map(r => ({ ...r, display: dcDisplayNames[r.id] })), // @todo DRY this up
  regionsLoading: loading,
  regionsError: error
}));

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter,
  withRegions,
  withTypes
);

export default enhanced(CreateCluster);
