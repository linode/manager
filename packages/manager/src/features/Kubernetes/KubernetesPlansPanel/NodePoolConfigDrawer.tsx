import { useSpecificTypes } from '@linode/queries';
import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import { Box, FormLabel } from '@mui/material';
import * as React from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { extendType } from 'src/utilities/extendType';

import {
  DEFAULT_PLAN_COUNT,
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../constants';
import { NodePoolConfigOptions } from './NodePoolConfigOptions';

import type {
  CreateNodePoolDataBeta,
  KubernetesTier,
  NodePoolUpdateStrategy,
} from '@linode/api-v4';
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
  updateStrategy: NodePoolUpdateStrategy | undefined;
}

export const NodePoolConfigDrawer = (props: Props) => {
  const { onClose, open, selectedTier, planId, mode } = props;

  // Use the node pool state from the main create flow from.
  const { control: parentFormControl, setValue: parentFormSetValue } =
    useFormContext();
  const _nodePools: CreateNodePoolDataBeta[] = useWatch({
    control: parentFormControl,
    name: 'nodePools',
  });

  // Manage node pool options within this drawer form.
  const { control, formState, setValue, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {
        nodeCount: DEFAULT_PLAN_COUNT,
      },
      shouldUnregister: true, // For conditionally defined fields (e.g. updateStrategy)
    });

  const typesQuery = useSpecificTypes(planId ? [planId] : []);
  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  const isAddMode = mode === 'add';

  React.useEffect(() => {
    if (!planId || !selectedTier) {
      return;
    }
    // Ensure the update strategy resets when the tier is changed.
    setValue(
      'updateStrategy',
      selectedTier === 'enterprise' ? 'on_recycle' : undefined
    );

    // eslint-disable-next-line sonarjs/todo-tag
    // TODO - M3-10295: If the plan has been added to the cluster, set the existing node count for editing.
  }, [planId, open, selectedTier, setValue]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      if (isAddMode) {
        parentFormSetValue('nodePools', [
          ..._nodePools,
          {
            count: values.nodeCount,
            type: planId,
            update_strategy: values.updateStrategy,
          },
        ]);
      } else {
        // eslint-disable-next-line sonarjs/todo-tag
        // TODO - M3-10295: We're in edit mode, so find the existing pool in _nodePools based on
        // selected pool index and set the updated node count/update strategy values.
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
