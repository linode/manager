import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Notice from 'src/components/Notice';
import { useTypes } from 'src/hooks/useTypes';
import { pluralize } from 'src/utilities/pluralize';
import { nodeWarning } from '../../kubeUtils';
import { PoolNodeWithPrice } from '../../types';

const useStyles = makeStyles((theme: Theme) => ({
  summary: {
    fontWeight: 'bold',
    lineHeight: '20px',
    fontSize: '16px',
  },
  helperText: {
    paddingBottom: theme.spacing(2) + 1,
  },
  section: {
    paddingBottom: theme.spacing(3),
  },
}));

export interface Props {
  open: boolean;
  error?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (updatedValue: number) => void;
  nodePool?: PoolNodeWithPrice;
}

const resizeWarning = `Resizing to fewer nodes will delete random nodes from
the pool.`;

export const ResizeNodePoolDrawer: React.FC<Props> = props => {
  const { error, isSubmitting, nodePool, onClose, onSubmit, open } = props;
  const { types } = useTypes();
  const classes = useStyles();

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

  const handleChange = (value: number) => {
    setUpdatedCount(Math.min(100, Math.floor(value)));
  };

  const handleSubmit = () => {
    onSubmit(updatedCount);
  };

  const planType = types.entities.find(
    thisType => thisType.id === nodePool?.type
  );

  const pricePerNode = planType?.price.monthly ?? 0;

  if (!nodePool) {
    // This should never happen, but it keeps TypeScript happy and avoids crashing if we
    // are unable to load the specified pool.
    return null;
  }

  return (
    <Drawer
      title={`Resize Pool: ${planType?.label ?? 'Unknown'} Plan`}
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
            Current pool: ${nodePool.totalMonthlyPrice}/month (
            {pluralize('node', 'nodes', nodePool.count)} at ${pricePerNode}
            /month)
          </Typography>
        </div>

        {error && <Notice error text={error} />}

        <div className={classes.section}>
          <Typography className={classes.helperText}>
            Enter the number of nodes you'd like in this pool:
          </Typography>
          <EnhancedNumberInput
            value={updatedCount}
            setValue={handleChange}
            small
            min={1}
          />
        </div>

        <div className={classes.section}>
          <Typography className={classes.summary}>
            Resized pool: ${updatedCount * pricePerNode}/month (
            {pluralize('node', 'nodes', updatedCount)} at ${pricePerNode}/month)
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
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default ResizeNodePoolDrawer;
