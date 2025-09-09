import { useSpecificTypes } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import { isNumber, pluralize } from '@linode/utilities';
import { Box, FormLabel } from '@mui/material';
import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { extendType } from 'src/utilities/extendType';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import {
  DEFAULT_PLAN_COUNT,
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
  nodeWarning,
} from '../constants';
import { NodePoolConfigOptions } from './NodePoolConfigOptions';

import type { CreateClusterFormValues } from '../CreateCluster/CreateCluster';
import type {
  CreateNodePoolData,
  KubernetesTier,
  Region,
} from '@linode/api-v4';
import type { Theme } from '@linode/ui';

export type NodePoolConfigDrawerMode = 'add' | 'edit';

export interface Props {
  mode: NodePoolConfigDrawerMode;
  onClose: () => void;
  open: boolean;
  planId: string | undefined;
  poolIndex?: number;
  selectedRegion: Region | undefined;
  selectedTier: KubernetesTier;
}

export const NodePoolConfigDrawer = (props: Props) => {
  const {
    onClose,
    open,
    selectedRegion,
    selectedTier,
    planId,
    poolIndex,
    mode,
  } = props;

  // Use the node pool state from the main create flow from.
  const { control: parentFormControl } =
    useFormContext<CreateClusterFormValues>();
  const _nodePools = useWatch({
    control: parentFormControl,
    name: 'nodePools',
  });
  const { append, update } = useFieldArray({
    control: parentFormControl,
    name: 'nodePools',
  });

  // Manage node pool options within this drawer form.
  const { control, formState, setValue, ...form } = useForm<CreateNodePoolData>(
    {
      defaultValues: {
        count: DEFAULT_PLAN_COUNT,
      },
      shouldUnregister: true, // For conditionally defined fields (e.g. update_strategy, firewall_id)
    }
  );

  const typesQuery = useSpecificTypes(planId ? [planId] : []);
  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  // Keep track of the node count to display an accurate price.
  const nodeCountWatcher = useWatch({ control, name: 'count' });
  const updatedCount =
    nodeCountWatcher ?? form.getValues('count') ?? DEFAULT_PLAN_COUNT;
  const pricePerNode = getLinodeRegionPrice(
    planType,
    selectedRegion?.toString()
  )?.monthly;

  const isAddMode = mode === 'add';

  // Show a warning if any of the pools have fewer than 3 nodes
  const shouldShowWarning = updatedCount < 3;

  React.useEffect(() => {
    if (!planId || !selectedTier) {
      return;
    }
    // Ensure the update strategy resets when the tier is changed.
    setValue(
      'update_strategy',
      selectedTier === 'enterprise' ? 'on_recycle' : undefined
    );
    setValue('firewall_id', undefined);

    // If we're in edit mode, set the existing config values on the pool.
    if (!isAddMode && poolIndex !== undefined) {
      setValue('count', _nodePools[poolIndex]?.count);
      setValue('update_strategy', _nodePools[poolIndex]?.update_strategy);
      setValue('firewall_id', _nodePools[poolIndex]?.firewall_id);
    }
  }, [planId, open, selectedTier, setValue, isAddMode, poolIndex, _nodePools]);

  const onSubmit = async (values: CreateNodePoolData) => {
    try {
      // If there's a pool index, the drawer is in edit mode. Else, it's in add mode.
      if (poolIndex !== undefined) {
        update(poolIndex, {
          ..._nodePools[poolIndex],
          count: values.count,
          update_strategy: values.update_strategy,
          firewall_id: values.firewall_id,
        });
      } else if (planId) {
        append({
          count: values.count,
          type: planId,
          update_strategy: values.update_strategy,
          firewall_id: values.firewall_id,
        });
      }
      onClose();
      form.reset();
    } catch (errResponse) {
      form.setError('root', {
        message: `${errResponse})}`,
      });
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Configure Pool: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      {formState.errors.root?.message ? (
        <Notice
          spacingBottom={16}
          text={formState.errors.root.message}
          variant="error"
        />
      ) : null}
      {shouldShowWarning && (
        <Notice spacingTop={16} text={nodeWarning} variant="warning" />
      )}
      <FormProvider
        control={control}
        formState={formState}
        setValue={setValue}
        {...form}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormLabel
            sx={(theme: Theme) => ({
              color: theme.tokens.alias.Typography.Label.Bold.S,
            })}
          >
            Nodes
          </FormLabel>
          <Box marginBottom={4} marginTop={2}>
            <Controller
              control={control}
              name="count"
              render={({ field }) => (
                <EnhancedNumberInput
                  inputLabel={`edit-quantity-${planId}`}
                  max={
                    selectedTier === 'enterprise'
                      ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
                      : MAX_NODES_PER_POOL_STANDARD_TIER
                  }
                  min={1}
                  setValue={field.onChange}
                  value={field.value}
                />
              )}
            />
            {isNumber(pricePerNode) && (
              <Typography marginTop={3}>
                {/* Renders total pool price/month for N nodes at price per node/month. */}
                <strong>
                  {`$${renderMonthlyPriceToCorrectDecimalPlace(
                    updatedCount * pricePerNode
                  )}/month`}{' '}
                </strong>
                ({pluralize('node', 'nodes', updatedCount)} at $
                {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
                /month each)
              </Typography>
            )}
          </Box>

          {selectedTier === 'enterprise' && <NodePoolConfigOptions />}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': isAddMode ? 'add' : 'update',
              label: isAddMode ? 'Add Pool' : 'Update Pool',
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
            sx={(theme: Theme) => ({
              paddingTop: theme.spacingFunction(32),
            })}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
