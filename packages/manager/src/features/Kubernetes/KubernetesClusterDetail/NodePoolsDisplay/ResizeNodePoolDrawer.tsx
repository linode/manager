import {
  ActionsPanel,
  CircleProgress,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { isNumber, pluralize } from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { NotFound } from 'src/components/NotFound';
import { MAX_NODES_PER_POOL_ENTERPRISE_TIER } from 'src/features/Kubernetes/constants';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getKubernetesMonthlyPrice } from 'src/utilities/pricing/kubernetes';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import { nodeWarning } from '../../constants';
import { hasInvalidNodePoolPrice } from './utils';

import type {
  KubeNodePoolResponse,
  KubernetesTier,
  Region,
} from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  helperText: {
    paddingBottom: `calc(${theme.spacing(2)} + 1px)`,
  },
  section: {
    paddingBottom: theme.spacing(3),
  },
  summary: {
    font: theme.font.bold,
    fontSize: '16px',
  },
}));

export interface Props {
  clusterTier: KubernetesTier;
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
    clusterTier,
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
    isPending,
    mutateAsync: updateNodePool,
  } = useUpdateNodePoolMutation(kubernetesClusterId, nodePool?.id ?? -1);
  const [resizeNodePoolError, setResizeNodePoolError] =
    React.useState<string>('');

  const [updatedCount, setUpdatedCount] = React.useState<number>(
    nodePool?.count ?? 0
  );

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setUpdatedCount(nodePool.count);
      setResizeNodePoolError('');
    }
  }, [nodePool, open]);

  const handleChange = (value: number) => {
    setUpdatedCount(Math.floor(value));
  };

  React.useEffect(() => {
    if (error) {
      setResizeNodePoolError(error?.[0].reason);
    }
  }, [error]);

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

  const pricePerNode = getLinodeRegionPrice(
    planType,
    kubernetesRegionId
  )?.monthly;

  const totalMonthlyPrice =
    planType &&
    getKubernetesMonthlyPrice({
      count: nodePool.count,
      region: kubernetesRegionId,
      type: nodePool.type,
      types: planType ? [planType] : [],
    });

  const hasInvalidPrice = hasInvalidNodePoolPrice(
    pricePerNode,
    totalMonthlyPrice
  );

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={`Resize Pool: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      {isLoadingTypes ? (
        <CircleProgress />
      ) : (
        <form
          onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {resizeNodePoolError && (
            <Notice variant="error">
              <ErrorMessage
                entity={{ id: kubernetesClusterId, type: 'lkecluster_id' }}
                message={resizeNodePoolError}
              />
            </Notice>
          )}

          <div className={classes.section}>
            <Typography className={classes.helperText}>
              Adjust the total number of nodes to resize this node pool.
            </Typography>
            <EnhancedNumberInput
              // @TODO LKE-E: Use autoscaler.max once API returns the correct value for LKE-E
              max={
                clusterTier === 'enterprise'
                  ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
                  : 100
              }
              min={1}
              setValue={handleChange}
              value={updatedCount}
            />
          </div>

          <div className={classes.section}>
            <Typography className={classes.summary}>
              Current price: $
              {renderMonthlyPriceToCorrectDecimalPlace(totalMonthlyPrice)}
              /month ({pluralize('node', 'nodes', nodePool.count)} at $
              {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
              /month each)
            </Typography>
          </div>
          <div className={classes.section}>
            {/* Renders total pool price/month for N nodes at price per node/month. */}
            <Typography className={classes.summary}>
              {`Resized price: $${renderMonthlyPriceToCorrectDecimalPlace(
                isNumber(pricePerNode) ? updatedCount * pricePerNode : undefined
              )}/month`}{' '}
              ({pluralize('node', 'nodes', updatedCount)} at $
              {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
              /month each)
            </Typography>
          </div>

          {updatedCount < nodePool.count && (
            <Notice important text={resizeWarning} variant="warning" />
          )}

          {updatedCount < 3 && (
            <Notice important text={nodeWarning} variant="warning" />
          )}

          {nodePool.count && hasInvalidPrice && (
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
              disabled: updatedCount === nodePool.count || hasInvalidPrice,
              label: 'Save Changes',
              loading: isPending,
              onClick: handleSubmit,
            }}
          />
        </form>
      )}
    </Drawer>
  );
};
