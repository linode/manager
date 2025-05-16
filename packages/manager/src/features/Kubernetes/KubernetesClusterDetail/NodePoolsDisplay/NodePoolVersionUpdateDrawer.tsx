import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import {
  useKubernetesTieredVersionsQuery,
  useUpdateNodePoolBetaMutation,
} from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { getNextVersion } from '../../kubeUtils';
import { NodePoolsUpdateStrategySelect } from './NodePoolsUpdateStrategySelect';

import type {
  KubeNodePoolResponseBeta,
  NodePoolUpdateStrategy,
} from '@linode/api-v4';

export interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
}

interface VersionUpdateFormFields {
  update_strategy: NodePoolUpdateStrategy;
}

export const NodePoolVersionUpdateDrawer = (props: Props) => {
  const { clusterId, nodePool, onClose, open } = props;

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const { data: versions } = useKubernetesTieredVersionsQuery('enterprise');
  const { isPending, mutateAsync: updateNodePoolBeta } =
    useUpdateNodePoolBetaMutation(clusterId, nodePool?.id ?? -1);

  const nextVersion = getNextVersion(
    nodePool?.k8s_version ?? '',
    versions ?? []
  );

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {},
    });

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setValue('update_strategy', nodePool?.update_strategy);
    }
  }, [nodePool, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      await updateNodePoolBeta({
        update_strategy: values.update_strategy,
      });
      handleClose();
    } catch (errResponse) {
      /* TODO */
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Node Pool Updates: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
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
            marginBottom={(theme) => theme.spacingFunction(12)}
            marginTop={(theme) => theme.spacingFunction(4)}
          >
            Choose how you would like your node pools to update. TODO: something
            about how this related to cluster versioning.
          </Typography>
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
          <Grid
            container
            direction="column"
            spacing={2}
            sx={{
              marginY: 4,
            }}
          >
            <Grid container size={12}>
              <Grid size={6}>Current Node Pool version: </Grid>
              <Grid size={4}>
                <Typography component="span">
                  {nodePool?.k8s_version}
                </Typography>
              </Grid>
            </Grid>
            <Grid container size={12}>
              <Grid size={6}> Version on next upgrade: </Grid>
              <Grid size={4}>
                <Typography component="span">{nextVersion}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !formState.isDirty || isPending,
              label: 'Save Update Strategy',
              loading: isPending,
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
