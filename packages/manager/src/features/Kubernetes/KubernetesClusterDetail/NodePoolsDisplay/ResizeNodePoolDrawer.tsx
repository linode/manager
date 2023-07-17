import { KubeNodePoolResponse } from '@linode/api-v4';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import Drawer from 'src/components/Drawer';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { pluralize } from 'src/utilities/pluralize';

import { getMonthlyPrice, nodeWarning } from '../../kubeUtils';

const useStyles = makeStyles((theme: Theme) => ({
  helperText: {
    paddingBottom: `calc(${theme.spacing(2)} + 1px)`,
  },
  section: {
    paddingBottom: theme.spacing(3),
  },
  summary: {
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '20px',
  },
}));

export interface Props {
  kubernetesClusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

const resizeWarning = `Resizing to fewer nodes will delete random nodes from
the pool.`;

export const ResizeNodePoolDrawer = (props: Props) => {
  const { kubernetesClusterId, nodePool, onClose, open } = props;
  const classes = useStyles();

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);
  const isLoadingTypes = typesQuery[0]?.isLoading ?? false;
  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  const {
    error,
    isLoading,
    mutateAsync: updateNodePool,
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
    planType ? [planType] : []
  );

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Resize Pool: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
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
            min={1}
            setValue={handleChange}
            value={updatedCount}
          />
        </div>

        <div className={classes.section}>
          <Typography className={classes.summary}>
            Resized pool: ${updatedCount * pricePerNode}/month (
            {pluralize('node', 'nodes', updatedCount)} at ${pricePerNode}/month)
          </Typography>
        </div>

        {updatedCount < nodePool.count && (
          <Notice important text={resizeWarning} warning />
        )}

        {updatedCount < 3 && <Notice important text={nodeWarning} warning />}

        <ActionsPanel>
          <Button
            buttonType="primary"
            data-qa-submit
            disabled={updatedCount === nodePool.count}
            loading={isLoading}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
