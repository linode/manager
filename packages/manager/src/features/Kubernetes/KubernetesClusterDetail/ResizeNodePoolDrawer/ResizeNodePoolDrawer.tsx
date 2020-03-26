import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Notice from 'src/components/Notice';
import { displayClassAndSize } from 'src/features/linodes/presentation';
import { useTypes } from 'src/hooks/useTypes';
import { nodeWarning } from '../../kubeUtils';
import { PoolNodeWithPrice } from '../../types';

const useStyles = makeStyles((theme: Theme) => ({
  summary: {
    fontWeight: 'bold',
    lineHeight: '20px',
    fontSize: '16px'
  },
  helperText: {
    paddingBottom: theme.spacing() / 2
  },
  section: {
    paddingBottom: theme.spacing(3)
  }
}));

export interface Props {
  open: boolean;
  error?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (updatedValue: number) => void;
  nodePool: PoolNodeWithPrice;
}

const resizeWarning = `Resizing to fewer nodes will delete random nodes from
the pool. If you want to keep specific nodes, delete unneeded nodes manually from
the pool's node list.`;

export const AddDeviceDrawer: React.FC<Props> = props => {
  const { error, isSubmitting, nodePool, onClose, onSubmit, open } = props;
  const { types } = useTypes();
  const classes = useStyles();

  const [updatedCount, setUpdatedCount] = React.useState<number>(
    nodePool.count
  );

  const handleChange = (value: number) => {
    setUpdatedCount(Math.min(100, Math.floor(value)));
  };

  const handleSubmit = () => {
    alert(`Called onSubmit with ${updatedCount}`);
    onSubmit(updatedCount);
  };

  const planType = types.entities.find(
    thisType => thisType.id === nodePool.type
  );

  const pricePerNode = planType?.price.monthly ?? 0;

  return (
    <Drawer
      title={`Resize Pool: ${displayClassAndSize(
        planType?.class ?? '',
        planType?.memory ?? 0
      )}`}
      open={open}
      onClose={onClose}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className={classes.section}>
          <Typography className={classes.summary}>
            Current pool: ${nodePool.totalMonthlyPrice}/month ({nodePool.count}{' '}
            nodes at ${pricePerNode}/month)
          </Typography>
        </div>

        {error && <Notice error text={error} />}

        <div className={classes.section}>
          <Typography className={classes.helperText}>
            Enter the number of nodes you'd like in this pool:
          </Typography>
          <EnhancedNumberInput value={updatedCount} setValue={handleChange} />
        </div>

        <div className={classes.section}>
          <Typography className={classes.summary}>
            Resized pool: ${updatedCount * pricePerNode}/month ({updatedCount}{' '}
            nodes at ${pricePerNode}/month)
          </Typography>
        </div>

        {updatedCount < nodePool.count && (
          <Notice important warning text={resizeWarning} />
        )}

        {updatedCount < 3 && <Notice important warning text={nodeWarning} />}

        <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={updatedCount === nodePool.count}
            onClick={handleSubmit}
            data-qa-submit
            loading={isSubmitting}
          >
            Save Changes
          </Button>
          {/* 
            <Button onClick={onClose} buttonType="cancel" data-qa-cancel>
                Cancel
            </Button> 
          */}
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default AddDeviceDrawer;
