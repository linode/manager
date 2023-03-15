import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Notice from 'src/components/Notice';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllLinodeTypesQuery } from 'src/queries/linodes';
import { pluralize } from 'src/utilities/pluralize';
import { getMonthlyPrice, nodeWarning } from '../../kubeUtils';

const useStyles = makeStyles((theme: Theme) => ({
  summary: {
    fontWeight: 'bold',
    lineHeight: '20px',
    fontSize: '16px',
  },
  helperText: {
    paddingBottom: `calc(${theme.spacing(2)} + 1px)`,
  },
  section: {
    paddingBottom: theme.spacing(3),
  },
}));

export interface Props {
  open: boolean;
  onClose: () => void;
  nodePool: KubeNodePoolResponse | undefined;
  kubernetesClusterId: number;
}

const resizeWarning = `Resizing to fewer nodes will delete random nodes from
the pool.`;

export const ResizeNodePoolDrawer = (props: Props) => {
  const { nodePool, onClose, open, kubernetesClusterId } = props;
  const classes = useStyles();

  const { data: types, isLoading: isLoadingTypes } = useAllLinodeTypesQuery();

  const {
    mutateAsync: updateNodePool,
    isLoading,
    error,
  } = useUpdateNodePoolMutation(kubernetesClusterId, nodePool?.id ?? -1);

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

  const planType = types?.find((thisType) => thisType.id === nodePool?.type);

  const pricePerNode = planType?.price.monthly ?? 0;

  if (!nodePool) {
    // This should never happen, but it keeps TypeScript happy and avoids crashing if we
    // are unable to load the specified pool.
    return null;
  }

  const handleSubmit = () => {
    updateNodePool({ count: updatedCount }).then((_) => {
      onClose();
    });
  };

  const totalMonthlyPrice = getMonthlyPrice(
    nodePool.type,
    nodePool.count,
    types || []
  );

  return (
    <Drawer
      title={`Resize Pool: ${planType?.label ?? 'Unknown'} Plan`}
      open={open}
      onClose={onClose}
    >
      {isLoadingTypes && <CircleProgress />}
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className={classes.section}>
          <Typography className={classes.summary}>
            Current pool: ${totalMonthlyPrice}/month (
            {pluralize('node', 'nodes', nodePool.count)} at ${pricePerNode}
            /month)
          </Typography>
        </div>

        {error && <Notice error text={error?.[0].reason} />}

        <div className={classes.section}>
          <Typography className={classes.helperText}>
            Enter the number of nodes you'd like in this pool:
          </Typography>
          <EnhancedNumberInput
            value={updatedCount}
            setValue={handleChange}
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
            loading={isLoading}
          >
            Save Changes
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
