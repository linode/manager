import { remove } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import CheckoutBar from 'src/components/CheckoutBar';
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
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';
import { getTagsAsStrings } from 'src/utilities/tagUtils';

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

interface Props {}

export interface PoolNodeResponse {
  id: number;
  status: string;
}

export interface PoolNode {
  type?: string;
  nodeCount: number;
  totalMonthlyPrice: number;
}

// @todo don't hard code this
const KubernetesVersionOptions = ['1.13', '1.14'].map(version => ({
  label: version,
  value: version
}));

// @todo move to Kubernetes.ts
// interface KubeNodePoolResponse {
//   count: number;
//   id: number;
//   linodes: PoolNode[];
//   lkeid: number;
//   type: Linode.LinodeType;
// }

interface State {
  selectedRegion?: string;
  selectedType?: string;
  numberOfLinodes: number;
  nodePools: PoolNode[];
  label: string;
  tags: Item<string>[];
  version: Item<string>;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithRegionsProps &
  WithTypesProps;

export const getMonthlyPrice = (pool: PoolNode, types?: ExtendedType[]) => {
  if (!types) {
    return 0;
  }
  const thisType = types.find(type => type.id === pool.type);
  return thisType ? thisType.price.monthly * pool.nodeCount : 0;
};

export const getTotalClusterPrice = (pools: PoolNode[]) =>
  pools.reduce((accumulator, node) => {
    return accumulator + node.totalMonthlyPrice;
  }, 0);

export class CreateCluster extends React.Component<CombinedProps, State> {
  state: State = {
    selectedRegion: undefined,
    selectedType: undefined,
    numberOfLinodes: 1,
    nodePools: [],
    label: '',
    tags: [],
    version: { value: '1.14', label: '1.14' }
  };

  createCluster = () => {
    const { selectedRegion, nodePools, label, tags, version } = this.state;
    const payload = {
      selectedRegion,
      nodePools,
      label,
      version: version.value,
      tags: getTagsAsStrings(tags)
    };
    console.log(payload);
  };

  addPool = (pool: PoolNode) => {
    const { nodePools } = this.state;
    const { typesData } = this.props;
    const monthlyPrice = getMonthlyPrice(pool, typesData);
    const poolWithPrice = { ...pool, totalMonthlyPrice: monthlyPrice };
    this.setState({
      nodePools: [...nodePools, poolWithPrice]
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
    this.setState({ label: newLabel });
  };

  updateTags = (newTags: Item<string>[]) => {
    this.setState({ tags: newTags });
  };

  render() {
    const { classes, regionsData, typesData } = this.props;
    const {
      label,
      selectedRegion,
      selectedType,
      numberOfLinodes,
      nodePools,
      tags,
      version
    } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
        <Typography variant="h1" data-qa-title className={classes.title}>
          Create a Kubernetes Cluster
        </Typography>
        <Grid container direction="row" wrap="nowrap" justify="space-between">
          <Grid container item direction="column" xs={9}>
            <Grid item data-qa-kubernetes-create-region-select>
              <SelectRegionPanel
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
                  {/* {error && <Notice text={error} error />} */}
                  <TextField
                    data-qa-label-input
                    errorText={undefined}
                    label="Cluster Label"
                    onChange={e => this.updateLabel(e.target.value)}
                    value={label}
                  />
                  <Select
                    label="Version"
                    value={version}
                    options={KubernetesVersionOptions}
                    onChange={(selected: Item<string>) =>
                      this.setState({ version: selected })
                    }
                    isClearable={false}
                  />
                  <TagsInput
                    value={tags}
                    onChange={this.updateTags}
                    tagError={undefined}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Grid xs={3} item container justify="center" alignItems="flex-start">
            <CheckoutBar
              data-qa-checkout-bar
              heading="Cluster Summary"
              calculatedPrice={getTotalClusterPrice(nodePools)}
              isMakingRequest={false}
              disabled={false}
              onDeploy={this.createCluster}
              displaySections={[]}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data.map(r => ({ ...r, display: dcDisplayNames[r.id] })),
  regionsLoading: loading,
  regionsError: error
}));

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRegions,
  withTypes
);

export default enhanced(CreateCluster);
