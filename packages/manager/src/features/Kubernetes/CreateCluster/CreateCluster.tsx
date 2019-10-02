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
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getTagsAsStrings } from 'src/utilities/tagUtils';

import KubeCheckoutBar from '.././KubeCheckoutBar';
import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';
import NodePoolPanel from './NodePoolPanel';

type ClassNames = 'root' | 'title' | 'sidebar' | 'inner';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginBottom: theme.spacing(1) + theme.spacing(1) / 2
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '45px !important'
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
  tags: Item<string>[];
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
    numberOfLinodes: 1,
    nodePools: [],
    label: undefined,
    tags: [],
    version: undefined,
    errors: undefined,
    submitting: false,
    versionOptions: []
  };

  componentDidMount() {
    getAllVersions()
      .then(response => {
        this.setState({
          versionOptions: response.data.map(eachVersion => ({
            value: eachVersion.id,
            label: eachVersion.id
          }))
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
    const { selectedRegion, nodePools, label, tags, version } = this.state;
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
      version: _version,
      tags: getTagsAsStrings(tags)
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

  updateTags = (newTags: Item<string>[]) => {
    this.setState({ tags: newTags });
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
      tags,
      submitting,
      version,
      versionOptions
    } = this.state;

    const errorMap = getErrorMap(
      ['region', 'node_pools', 'label', 'tags', 'version', 'versionLoad'],
      errors
    );

    const _region = regionsData
      ? regionsData.find(thisRegion => thisRegion.id === selectedRegion)
      : undefined;

    const regionDisplay = _region ? _region.display : undefined;

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
            <Typography variant="h1" data-qa-title className={classes.title}>
              Create a Kubernetes Cluster
            </Typography>
            {errorMap.none && <Notice text={errorMap.none} error />}
            <SelectRegionPanel
              error={errorMap.region}
              copy={'Determine the best location for your cluster.'}
              regions={regionsData || []}
              selectedID={selectedRegion}
              handleSelection={(regionID: string) =>
                this.setState({ selectedRegion: regionID })
              }
              updateFor={[
                errorMap.region,
                regionsData,
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
                <TagsInput
                  value={tags}
                  onChange={this.updateTags}
                  tagError={errorMap.tags}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <KubeCheckoutBar
              label={label || ''}
              region={regionDisplay}
              pools={nodePools}
              createCluster={this.createCluster}
              submitting={submitting}
              typesData={typesData || []}
              updateFor={[
                label,
                selectedRegion,
                nodePools,
                submitting,
                typesData,
                classes
              ]}
            />
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}

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
