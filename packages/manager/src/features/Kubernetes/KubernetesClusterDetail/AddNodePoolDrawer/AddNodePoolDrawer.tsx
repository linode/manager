import {
  PoolNodeRequest,
  PoolNodeResponse
} from 'linode-js-sdk/lib/kubernetes/types';
import { remove, update } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { useTypes } from 'src/hooks/useTypes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import NodePoolPanel from '../../CreateCluster/NodePoolPanel';
import { getMonthlyPrice, nodeWarning } from '../../kubeUtils';
import { ExtendedCluster, PoolNodeWithPrice } from '../../types';

const useStyles = makeStyles((theme: Theme) => ({
  summary: {
    color: theme.color.headline,
    display: 'inline',
    fontSize: '16px',
    lineHeight: '20px',
    '& span': {
      fontWeight: 'bold'
    }
  },
  section: {
    paddingBottom: theme.spacing(3)
  },
  planPanel: {
    marginTop: 0
  }
}));

export interface Props {
  open: boolean;
  label: string;
  error?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newPool: PoolNodeRequest) => Promise<PoolNodeResponse>;
  newPool: PoolNodeWithPrice;
}

type CombinedProps = Props & WithTypesProps;

export const AddNodePoolDrawer: React.FC<CombinedProps> = props => {
  const {
    error,
    isSubmitting,
    nodePool,
    onClose,
    onSubmit,
    open,
    typesData,
    typesLoading,
    typesError
  } = props;

  const { types } = useTypes();
  const classes = useStyles();
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(true);
  const [drawerError, setDrawerError] = React.useState<string | undefined>();
  const [drawerLoading, setDrawerLoading] = React.useState<boolean>(false);
  const [newPool, setNewPool] = React.useState<PoolNodeWithPrice[]>([]);
  const [nodePools, setNodePools] = React.useState<PoolNodeWithPrice[]>([]);
  const [newCount, setNewCount] = React.useState<number>(0);
  const [updatedCount] = React.useState<number>(nodePool.count);

  const selectType = (type: string) => {
    setSelectedType(type);
  };

  const removePool = (poolIdx: number) => {
    setNodePools(remove(poolIdx, 1, nodePools));
  };

  const updatePool = (poolIdx: number, updatedPool: PoolNodeWithPrice) => {
    const updatedPoolWithPrice = {
      ...updatedPool,
      totalMonthlyPrice: getMonthlyPrice(
        updatedPool.type,
        updatedPool.count,
        props.typesData || []
      )
    };
    setNodePools(update(poolIdx, updatedPoolWithPrice, nodePools));
  };

  const updateCount = (count: number) => {
    setNewCount(count);
  };

  const handleSubmit = () => {
    setDrawerLoading(true);
    onSubmit({ type: selectedType, count: updatedCount }).then(response => {
      try {
        setDrawerLoading(false);
        setDrawerOpen(false);
      } catch (e) {
        setDrawerLoading(false);
        setDrawerError('true');
      }
    });
  };

  // const planType = types.entities.find(
  //   thisType => thisType.id === newPool.type
  // );

  // const pricePerNode = planType?.price.monthly ?? 0;

  return (
    <Drawer
      title={`Add a Node Pool: `}
      open={drawerOpen}
      onClose={onClose}
      wide={true}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <SelectPlanPanel
          className={classes.planPanel}
          header={' '}
          types={typesData?.filter(
            t => t.class !== 'nanode' && t.class !== 'gpu'
          )} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={selectType}
          // error={apiError || typeError}
          inputIsIncluded
          // submitForm={submitForm}
        />
        {/* <NodePoolPanel
          // @todo: Refactor component to access header, copy and styles from current level
          // @todo: Make "Add" buttons optional
          pools={nodePools}
          types={typesData || []}
          // apiError={errorMap.node_pools}
          typesLoading={typesLoading}
          typesError={
            typesError
              ? getAPIErrorOrDefault(
                  typesError,
                  'Error loading Linode type information.'
                )[0].reason
              : undefined
          }
          selectedType={selectedType}
          addNodePool={(pool: PoolNodeWithPrice) => null}
          deleteNodePool={(poolIdx: number) => removePool(poolIdx)}
          handleTypeSelect={(newType: string) => selectType(newType)}
          updateNodeCount={(count: number) => updateCount(count)}
          updatePool={updatePool}
          // updateFor={[
          //   nodePools,
          //   typesData,
          //   newCount,
          //   errorMap,
          //   typesLoading,
          //   selectedType,
          //   classes
          // ]}
        /> */}

        {error && <Notice error text={error} />}

        {updatedCount < 3 && <Notice important warning text={nodeWarning} />}

        <ActionsPanel>
          <Button
            buttonType="primary"
            // disabled={updatedCount === nodePool.count}
            onClick={() => {
              handleSubmit();
            }}
            data-qa-submit
            loading={isSubmitting}
          >
            Add pool
          </Button>
          <Typography className={classes.summary}>
            This pool will add{' '}
            {/* <span>
              ${updatedCount * pricePerNode}/month ({updatedCount} nodes at $
              {pricePerNode}/month )
            </span>{' '} */}
            to this cluster.
          </Typography>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, {}>(withTypes);

export default enhanced(AddNodePoolDrawer);
