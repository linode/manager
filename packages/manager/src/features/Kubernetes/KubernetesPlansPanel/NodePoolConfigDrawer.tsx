import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';

import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../constants';
import { NodePoolsUpdateStrategySelect } from '../NodePoolsUpdateStrategySelect';

import type { KubernetesTier, NodePoolUpdateStrategy } from '@linode/api-v4';

export interface Props {
  getTypeCount: (planId: string) => number;
  // nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
  planId: string | undefined;
  selectedTier: KubernetesTier;
  updatePlanCount: (planId: string, newCount: number) => void;
}

interface VersionUpdateFormFields {
  update_strategy: NodePoolUpdateStrategy;
}

export const NodePoolConfigDrawer = (props: Props) => {
  const { onClose, open, selectedTier, planId, getTypeCount, updatePlanCount } =
    props;

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {},
    });

  const count = planId ? getTypeCount(planId) : 0;

  // React.useEffect(() => {
  //   if (!nodePool) {
  //     return;
  //   }
  //   if (open) {
  //     setValue('update_strategy', nodePool.update_strategy);
  //   }
  // }, [nodePool, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
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
          <EnhancedNumberInput
            inputLabel={`edit-quantity-${planId}`}
            max={
              selectedTier === 'enterprise'
                ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
                : MAX_NODES_PER_POOL_STANDARD_TIER
            }
            setValue={(newCount: number) =>
              planId && updatePlanCount(planId, newCount)
            }
            value={count}
          />
          <Controller
            control={control}
            name="update_strategy"
            render={({ field }) => (
              <NodePoolsUpdateStrategySelect
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'add',
              label: 'Add',
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
