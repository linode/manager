import { useSpecificTypes } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { extendType } from 'src/utilities/extendType';

import {
  DEFAULT_PLAN_COUNT,
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../constants';
import { NodePoolConfigOptions } from './NodePoolConfigOptions';

import type { KubernetesTier, NodePoolUpdateStrategy } from '@linode/api-v4';
import type { Theme } from '@linode/ui';

export type NodePoolConfigDrawerMode = 'add' | 'edit';

export interface Props {
  mode: NodePoolConfigDrawerMode;
  onClose: () => void;
  open: boolean;
  planId: string | undefined;
  selectedTier: KubernetesTier;
}

interface VersionUpdateFormFields {
  nodeCount: number;
  update_strategy: NodePoolUpdateStrategy;
}

export const NodePoolConfigDrawer = (props: Props) => {
  const { onClose, open, selectedTier, planId, mode } = props;

  const parentForm = useFormContext();
  const _nodePools = parentForm.watch('nodePools');

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {
        nodeCount: DEFAULT_PLAN_COUNT,
      },
    });

  const typesQuery = useSpecificTypes(planId ? [planId] : []);
  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  const isAddMode = mode === 'add';

  React.useEffect(() => {
    if (!planId) {
      return;
    }
    // TODO: If the plan has been added to the cluster, set the existing node count for editing.
  }, [planId, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      if (isAddMode) {
        parentForm.setValue('nodePools', [
          ..._nodePools,
          {
            count: values.nodeCount,
            // eslint-disable-next-line sonarjs/pseudo-random
            id: Math.random(),
            type: planId,
          },
        ]);
      } else {
        // TODO: We're in edit mode, so find the existing pool in _nodePools based on
        // selected pool index and set the updated node count/update strategy values.
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
