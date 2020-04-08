import { PoolNodeRequest } from 'linode-js-sdk/lib/kubernetes/types';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import NodePoolPanel from 'src/features/Kubernetes/CreateCluster/NodePoolPanel.tsx';
// import SelectPlanQuantityPanel from 'src/features/linodes/LinodesCreate/SelectPlanQuantityPanel.tsx';
import { useTypes } from 'src/hooks/useTypes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import { PoolNodeWithPrice } from '../../types';

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
  clusterLabel: string;
  open: boolean;
  label: string;
  error?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: string, count: number) => void;
}

type CombinedProps = Props & WithTypesProps;

export const AddNodePoolDrawer: React.FC<CombinedProps> = props => {
  const {
    clusterLabel,
    isSubmitting,
    onClose,
    onSubmit,
    open,
    typesData
  } = props;
  const { types } = useTypes();
  const classes = useStyles();

  const [selectedType, setSelectedType] = React.useState<string>('');
  const [count, setCount] = React.useState<number>(0);

  return (
    <Drawer
      title={`Add a Node Pool: ${clusterLabel}`}
      open={open}
      onClose={onClose}
      wide={true}
    >
      <form
      // onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
      //   e.preventDefault();
      //   handleSubmit(selectedType, updatedCount);
      // }}
      >
        <NodePoolPanel
          types={types.entities?.filter(
            t => t.class !== 'nanode' && t.class !== 'gpu'
          )}
          apiError={undefined}
          typesLoading={types.loading}
          typesError={
            types.error
              ? getAPIErrorOrDefault(
                  types.error,
                  'Error loading Linode type information.'
                )[0].reason
              : undefined
          }
          selectedType={selectedType}
          addNodePool={(pool: any) => onSubmit(pool.type, pool.count)}
          handleTypeSelect={(newType: string) => setSelectedType(newType)}
          updateNodeCount={(newCount: number) => setCount(newCount)}
          updateFor={[typesData, types, classes]}
          isOnCreate={false}
        />

        {/* <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={updatedCount === 0}
            onClick={() => {
              handleSubmit(selectedType, updatedCount);
            }}
            data-qa-submit
            loading={isSubmitting}
          >
            Add pool
          </Button>
          <Typography className={classes.summary}>
            This pool will add{' '}
            // {/* <span>
            //   ${updatedCount * pricePerNode}/month ({updatedCount} nodes at $
            //   {pricePerNode}/month )
            // </span>{' '} 
            to this cluster.
          </Typography>
        </ActionsPanel> */}
      </form>
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, Props>(withTypes);

export default enhanced(AddNodePoolDrawer);
