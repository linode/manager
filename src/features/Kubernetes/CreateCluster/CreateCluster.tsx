import { pick, remove } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose } from 'recompose';

import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';
import { createKubernetesCluster } from 'src/services/kubernetes';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getTagsAsStrings } from 'src/utilities/tagUtils';

import KubeCheckoutBar from '.././KubeCheckoutBar';
import { KubernetesVersionOptions } from '.././kubeUtils';
import { PoolNode } from '.././types';
import NodePoolPanel from './NodePoolPanel';

type ClassNames = 'root' | 'title' | 'checkoutBar' | 'inner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  },
  checkoutBar: {},
  inner: {
    padding: theme.spacing.unit * 3
  }
});

interface State {
  selectedRegion?: string;
  selectedType?: string;
  numberOfLinodes: number;
  nodePools: PoolNode[];
  label?: string;
  tags: Item<string>[];
  version: Item<string>;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = RouteComponentProps<{}> &
  WithStyles<ClassNames> &
  WithRegionsProps &
  WithTypesProps;

export class CreateCluster extends React.Component<CombinedProps, State> {
  state: State = {
    selectedRegion: undefined,
    selectedType: undefined,
    numberOfLinodes: 1,
    nodePools: [],
    label: undefined,
    tags: [],
    version: { value: '1.14', label: '1.14' },
    errors: undefined
  };

  createCluster = () => {
    const { selectedRegion, nodePools, label, tags, version } = this.state;
    const {
      history: { push }
    } = this.props;

    this.setState({
      errors: undefined
    });

    /**
     * Typing is difficult here, but this has the correct node_pool shape.
     * We need to remove the monthly price, which is used for client-side
     * calculations, and send only type and count to the API.
     */
    const node_pools = nodePools.map(pick(['type', 'count'])) as any;
    const payload = {
      region: selectedRegion!, // We know this is defined bc we just checked for it above
      node_pools,
      label,
      version: version.value,
      tags: getTagsAsStrings(tags)
    };

    createKubernetesCluster(payload)
      .then(_ => push('/kubernetes')) // No detail page yet, so redirect to landing.
      .catch(err =>
        this.setState(
          {
            errors: getAPIErrorOrDefault(err, 'Error creating your cluster')
          },
          scrollErrorIntoView
        )
      );
  };

  addPool = (pool: PoolNode) => {
    const { nodePools } = this.state;
    this.setState({
      nodePools: [...nodePools, pool]
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
      typesError
    } = this.props;

    const {
      errors,
      label,
      selectedRegion,
      selectedType,
      numberOfLinodes,
      nodePools,
      tags,
      version
    } = this.state;

    const errorMap = getErrorMap(
      ['region', 'node_pools', 'label', 'tags'],
      errors
    );

    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
        <Typography variant="h1" data-qa-title className={classes.title}>
          Create a Kubernetes Cluster
        </Typography>
        {errorMap.none && <Notice text={errorMap.none} error />}
        <Grid container direction="row" wrap="nowrap" justify="space-between">
          <Grid container item direction="column" xs={9}>
            <Grid item data-qa-kubernetes-create-region-select>
              <SelectRegionPanel
                error={errorMap.region}
                regions={regionsData || []}
                selectedID={selectedRegion}
                handleSelection={(regionID: string) =>
                  this.setState({ selectedRegion: regionID })
                }
              />
            </Grid>
            <Grid item data-qa-kubernetes-create-node-pool-panel>
              <NodePoolPanel
                pools={nodePools}
                types={typesData || []}
                apiError={errorMap.node_pools}
                typesLoading={typesLoading}
                typesError={
                  typesError
                    ? getErrorStringOrDefault(
                        typesError,
                        'Error loading Linode type information.'
                      )
                    : undefined
                }
                nodeCount={numberOfLinodes}
                selectedType={selectedType}
                addNodePool={(pool: PoolNode) => this.addPool(pool)}
                deleteNodePool={(poolIdx: number) => this.removePool(poolIdx)}
                handleTypeSelect={(newType: string) => {
                  this.setState({ selectedType: newType });
                }}
                updateNodeCount={(newCount: number) => {
                  this.setState({ numberOfLinodes: newCount });
                }}
              />
            </Grid>
            <Grid item>
              <Paper data-qa-label-header>
                <div className={classes.inner}>
                  <TextField
                    data-qa-label-input
                    errorText={errorMap.label}
                    label="Cluster Label"
                    onChange={e => this.updateLabel(e.target.value)}
                    value={label}
                  />
                  <Select
                    label="Version"
                    value={version}
                    errorText={errorMap.version}
                    options={KubernetesVersionOptions}
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
          </Grid>
          <Grid xs={3} item container justify="center" alignItems="flex-start">
            <KubeCheckoutBar
              label={label || ''}
              region={selectedRegion}
              pools={nodePools}
              createCluster={this.createCluster}
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
