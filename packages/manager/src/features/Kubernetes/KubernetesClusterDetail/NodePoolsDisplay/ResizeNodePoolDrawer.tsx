import { KubeNodePoolResponse, Region } from '@linode/api-v4';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { pluralize } from 'src/utilities/pluralize';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getKubernetesMonthlyPrice } from 'src/utilities/pricing/kubernetes';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import { nodeWarning } from '../../kubeUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  helperText: {
    paddingBottom: `calc(${theme.spacing(2)} + 1px)`,
  },
  section: {
    paddingBottom: theme.spacing(3),
  },
  summary: {
    fontFamily: theme.font.bold,
    fontSize: '16px',
  },
}));

export interface Props {
  kubernetesClusterId: number;
  kubernetesRegionId: Region['id'];
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

const resizeWarning = `Resizing to fewer nodes will delete random nodes from
the pool.`;

export const ResizeNodePoolDrawer = (props: Props) => {
  const {
    kubernetesClusterId,
    kubernetesRegionId,
    nodePool,
    onClose,
    open,
  } = props;
  const { classes } = useStyles();

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

  const pricePerNode = getLinodeRegionPrice(planType, kubernetesRegionId)
    ?.monthly;

  const totalMonthlyPrice =
    planType &&
    getKubernetesMonthlyPrice({
      count: nodePool.count,
      region: kubernetesRegionId,
      type: nodePool.type,
      types: planType ? [planType] : [],
    });

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
          {totalMonthlyPrice && (
            <Typography className={classes.summary}>
              Current pool: $
              {renderMonthlyPriceToCorrectDecimalPlace(totalMonthlyPrice)}/month{' '}
              ({pluralize('node', 'nodes', nodePool.count)} at $
              {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
              /month)
            </Typography>
          )}
        </div>

        {error && <Notice text={error?.[0].reason} variant="error" />}

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
          {/* Renders total pool price/month for N nodes at price per node/month. */}
          {pricePerNode && (
            <Typography className={classes.summary}>
              {`Resized pool: $${renderMonthlyPriceToCorrectDecimalPlace(
                updatedCount * pricePerNode
              )}/month`}{' '}
              ({pluralize('node', 'nodes', updatedCount)} at $
              {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
              /month)
            </Typography>
          )}
        </div>

        {updatedCount < nodePool.count && (
          <Notice important text={resizeWarning} variant="warning" />
        )}

        {updatedCount < 3 && (
          <Notice important text={nodeWarning} variant="warning" />
        )}

        {nodePool.count && (!pricePerNode || !totalMonthlyPrice) && (
          <Notice
            spacingBottom={16}
            spacingTop={8}
            text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
            variant="error"
          />
        )}

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: updatedCount === nodePool.count,
            label: 'Save Changes',
            loading: isLoading,
            onClick: handleSubmit,
          }}
        />
      </form>
    </Drawer>
  );
};
