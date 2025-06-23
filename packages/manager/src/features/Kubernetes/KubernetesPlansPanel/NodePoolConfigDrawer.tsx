import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';

import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../constants';
import { DEFAULT_PLAN_COUNT } from '../CreateCluster/NodePoolPanel';
import { NodePoolConfigOptions } from './NodePoolConfigOptions';

import type {
  KubeNodePoolResponse,
  KubernetesTier,
  NodePoolUpdateStrategy,
} from '@linode/api-v4';
import type { Theme } from '@linode/ui';

export interface Props {
  addPool: (pool: Partial<KubeNodePoolResponse>) => any; // Has to accept both extended and non-extended pools
  getTypeCount: (planId: string) => number;
  mode: 'add' | 'edit';
  // nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
  planId: string | undefined;
  selectedTier: KubernetesTier;
  updatePool: (poolIdx: number, updatedPool: KubeNodePoolResponse) => void;
}

interface VersionUpdateFormFields {
  nodeCount: number;
  update_strategy: NodePoolUpdateStrategy;
}

export const NodePoolConfigDrawer = (props: Props) => {
  const {
    addPool,
    onClose,
    open,
    selectedTier,
    planId,
    getTypeCount,
    mode,
    // updatePool
  } = props;

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: { nodeCount: DEFAULT_PLAN_COUNT },
    });

  const count = planId ? getTypeCount(planId) : 0;

  const isAddMode = mode === 'add';

  React.useEffect(() => {
    if (!planId) {
      return;
    }
    // If the plan has been added to the cluster, set the existing node count for editing.
    setValue('nodeCount', count);
  }, [planId, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      if (isAddMode) {
        addPool({
          count: values.nodeCount,
          // eslint-disable-next-line sonarjs/pseudo-random
          id: Math.random(),
          type: planId,
        });
      } else {
        // updatePool(planId, values.nodeCount)
      }
      handleClose();
    } catch (errResponse) {
      /* TODO */
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Drawer onClose={handleClose} open={open} title={`Configure Node Pool`}>
      {formState.errors.root?.message ? (
        <Notice
          spacingBottom={16}
          text={formState.errors.root.message}
          variant="error"
        />
      ) : null}
      <FormProvider
        control={control}
        formState={formState}
        setValue={setValue}
        watch={watch}
        {...form}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Typography
            sx={(theme: Theme) => ({ marginBottom: theme.spacingFunction(8) })}
          >
            Add Linodes to your cluster:
          </Typography>
          <Controller
            control={control}
            name="nodeCount"
            render={({ field }) => (
              <EnhancedNumberInput
                inputLabel={`edit-quantity-${planId}`}
                max={
                  selectedTier === 'enterprise'
                    ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
                    : MAX_NODES_PER_POOL_STANDARD_TIER
                }
                setValue={field.onChange}
                value={field.value}
              />
            )}
          />
          {selectedTier === 'enterprise' && <NodePoolConfigOptions />}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': isAddMode ? 'add' : 'update',
              label: isAddMode ? 'Add' : 'Update',
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
