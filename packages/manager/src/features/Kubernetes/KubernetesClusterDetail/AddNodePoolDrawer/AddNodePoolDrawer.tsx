import {
  PoolNodeRequest,
  PoolNodeResponse
} from 'linode-js-sdk/lib/kubernetes/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { useTypes } from 'src/hooks/useTypes';
import { PoolNodeWithPrice } from '../../types';

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
  onSubmit: (nodePool: PoolNodeRequest) => Promise<PoolNodeResponse>;
  nodePool: PoolNodeWithPrice;
}

type CombinedProps = Props & WithTypesProps;

export const AddNodePoolDrawer: React.FC<CombinedProps> = props => {
  const {
    clusterLabel,
    error,
    isSubmitting,
    nodePool,
    onClose,
    onSubmit,
    open,
    typesData
  } = props;
  const { types } = useTypes();
  const classes = useStyles();

  const [selectedType, setSelectedType] = React.useState<string>('');
  const [updatedCount, setUpdatedCount] = React.useState<number>(
    nodePool?.count ?? 0
  );

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setUpdatedCount(nodePool.count);
    }
  }, [nodePool, open]);

  // @todo: get cluster name
  const planType = types.entities.find(
    thisType => thisType.id === nodePool?.type
  );

  const selectType = (type: string) => {
    setSelectedType(type);
  };

  const updateCount = (count: number) => {
    setNewCount(count);
  };

  const handleSubmit = () => {
    onSubmit(nodePool);
  };

  return (
    <Drawer
      title={`Add a Node Pool: ${clusterLabel}`}
      open={open}
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
          )}
          selectedID={selectedType}
          onSelect={selectType}
          // error={apiError || typeError}
          inputIsIncluded
        />

        <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={updatedCount === 0}
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
