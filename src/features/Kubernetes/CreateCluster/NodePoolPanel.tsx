import * as React from 'react';

import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';

import { PoolNode } from './CreateCluster';
import NodePoolDisplayTable from './NodePoolDisplayTable';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  pools: PoolNode[];
  selectedType?: string;
  nodeCount: number;
  addNodePool: (pool: PoolNode) => void;
  deleteNodePool: (poolIdx: number) => void;
  handleTypeSelect: (newType: string) => void;
  updateNodeCount: (newCount: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = props => {
  const { addNodePool, deleteNodePool, pools, selectedType, nodeCount } = props;

  return (
    <React.Fragment>
      <NodePoolDisplayTable
        pools={pools}
        handleDelete={(poolIdx: number) => deleteNodePool(poolIdx)}
      />
      <Button
        type="secondary"
        onClick={() => addNodePool({ type: selectedType, nodeCount })}
      >
        Add Node Pool
      </Button>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolPanel);
