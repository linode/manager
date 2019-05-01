import * as React from 'react';
import { compose } from 'recompose';

import CheckoutBar from 'src/components/CheckoutBar';
import Grid from 'src/components/core/Grid';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';

import NodePoolPanel from './NodePoolPanel';

type ClassNames = 'root' | 'title' | 'checkoutBar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  },
  checkoutBar: {}
});

interface Props {}

export interface PoolNodeResponse {
  id: number;
  status: string;
}

export interface PoolNode {
  type?: string;
  nodeCount: number;
}

type KubernetesVersion = '1.13' | '1.14'; // @todo don't hard code this
// const KubernetesVersionOptions = ['1.13', '1.14'].map(version => ({ label: version, value: version }));

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
  version: KubernetesVersion;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithRegionsProps;

export class CreateCluster extends React.Component<CombinedProps, State> {
  state: State = {
    selectedRegion: undefined,
    selectedType: undefined,
    numberOfLinodes: 1,
    nodePools: [],
    label: '',
    version: '1.14'
  };

  createCluster = () => {
    const { selectedRegion, nodePools, label, version } = this.state;
    const payload = {
      selectedRegion,
      nodePools,
      label,
      version
    };
    console.log(payload);
  };

  render() {
    const { classes, regionsData } = this.props;
    const {
      selectedRegion,
      selectedType,
      numberOfLinodes,
      nodePools
    } = this.state;
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
        <Grid container direction="row" wrap="nowrap" justify="space-between">
          <Grid container item direction="column" xs={9}>
            <Grid item>
              <Typography variant="h1" data-qa-title className={classes.title}>
                Create a Kubernetes Cluster
              </Typography>
            </Grid>
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
                nodeCount={numberOfLinodes}
                selectedType={selectedType}
                addNodePool={(pool: PoolNode) => console.log('adding', pool)}
                deleteNodePool={(poolIdx: number) =>
                  console.log(`deleting node pool ${poolIdx}`)
                }
                handleTypeSelect={(newType: string) =>
                  console.log('selecting plan' + newType)
                }
                updateNodeCount={(newCount: number) =>
                  console.log(`updating node count to ${newCount}`)
                }
              />
            </Grid>
          </Grid>
          <Grid xs={3} item container justify="center" alignItems="flex-start">
            <CheckoutBar
              data-qa-checkout-bar
              heading="Cluster Summary"
              calculatedPrice={0}
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
  withRegions
);

export default enhanced(CreateCluster);
