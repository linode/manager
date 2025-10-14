import {
  type CreateNodePoolData,
  type KubernetesTier,
  type Region,
} from '@linode/api-v4';
import { useAllTypes, useRegionsQuery } from '@linode/queries';
import { Box, Button, Drawer, Notice, Stack, Typography } from '@linode/ui';
import {
  isNumber,
  plansNoticesUtils,
  pluralize,
  scrollErrorIntoView,
} from '@linode/utilities';
import React from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import {
  ADD_NODE_POOLS_DESCRIPTION,
  ADD_NODE_POOLS_ENTERPRISE_DESCRIPTION,
  nodeWarning,
} from 'src/features/Kubernetes/constants';
import { useCreateNodePoolMutation } from 'src/queries/kubernetes';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import { PremiumCPUPlanNotice } from '../../CreateCluster/PremiumCPUPlanNotice';
import { KubernetesPlansPanel } from '../../KubernetesPlansPanel/KubernetesPlansPanel';
import { NodePoolConfigOptions } from '../../KubernetesPlansPanel/NodePoolConfigOptions';
import { hasInvalidNodePoolPrice } from './utils';

export interface Props {
  clusterId: number;
  clusterLabel: string;
  clusterRegionId: Region['id'];
  clusterTier: KubernetesTier;
  onClose: () => void;
  open: boolean;
}

export const AddNodePoolDrawer = (props: Props) => {
  const {
    clusterId,
    clusterLabel,
    clusterRegionId,
    clusterTier,
    onClose,
    open,
  } = props;

  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const { data: types, isLoading: isTypesLoading } = useAllTypes(open);

  const {
    isPending,
    mutateAsync: createPool,
    error,
  } = useCreateNodePoolMutation(clusterId);

  // Only want to use current types here and filter out nanodes
  const extendedTypes = filterCurrentTypes(types?.map(extendType)).filter(
    (t) => t.class !== 'nanode'
  );

  const form = useForm<CreateNodePoolData>({
    defaultValues: {
      update_strategy: clusterTier === 'enterprise' ? 'on_recycle' : undefined,
    },
  });

  const [type, count] = useWatch({
    control: form.control,
    name: ['type', 'count'],
  });

  const selectedType = type
    ? extendedTypes.find((t) => t.id === type)
    : undefined;

  const pricePerNode = getLinodeRegionPrice(
    selectedType,
    clusterRegionId
  )?.monthly;

  const totalPrice =
    type && count && isNumber(pricePerNode) ? count * pricePerNode : undefined;

  const hasInvalidPrice = hasInvalidNodePoolPrice(pricePerNode, totalPrice);
  const shouldShowPricingInfo = Boolean(type) && count > 0;

  React.useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  React.useEffect(() => {
    if (error) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
  }, [error]);

  const updatePlanCount = (planId: string, newCount: number) => {
    form.setValue('type', newCount === 0 ? '' : planId);
    form.setValue('count', newCount);
  };

  const onSubmit = async (values: CreateNodePoolData) => {
    try {
      await createPool(values);
      onClose();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData: regions,
    selectedRegionID: clusterRegionId,
  });

  const getPlansPanelCopy = () => {
    return clusterTier === 'enterprise'
      ? ADD_NODE_POOLS_ENTERPRISE_DESCRIPTION
      : ADD_NODE_POOLS_DESCRIPTION;
  };

  return (
    <Drawer
      isFetching={isRegionsLoading || isTypesLoading}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: { maxWidth: '810px !important' },
        },
      }}
      title={`Add a Node Pool: ${clusterLabel}`}
      wide
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {form.formState.errors.root?.message && (
              <Notice variant="error">
                <ErrorMessage
                  entity={{ id: clusterId, type: 'lkecluster_id' }}
                  message={form.formState.errors.root?.message}
                />
              </Notice>
            )}
            <KubernetesPlansPanel
              copy={getPlansPanelCopy()}
              error={form.formState.errors.type?.message}
              getTypeCount={(plan) => {
                if (plan === type) {
                  return count;
                }
                return 0;
              }}
              hasSelectedRegion={hasSelectedRegion}
              isPlanPanelDisabled={isPlanPanelDisabled}
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
              isSubmitting={isPending}
              notice={
                <PremiumCPUPlanNotice spacingBottom={16} spacingTop={16} />
              }
              onSelect={(type) => form.setValue('type', type)}
              regionsData={regions ?? []}
              resetValues={() => {
                form.setValue('type', '');
                form.setValue('count', 0);
              }}
              selectedId={type}
              selectedRegionId={clusterRegionId}
              selectedTier={clusterTier}
              types={extendedTypes}
              updatePlanCount={updatePlanCount}
            />
            {count > 0 && count < 3 && (
              <Notice
                spacingBottom={0}
                spacingTop={0}
                text={nodeWarning}
                variant="warning"
              />
            )}
            {hasInvalidPrice && shouldShowPricingInfo && (
              <Notice
                spacingBottom={0}
                spacingTop={0}
                text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
                variant="error"
              />
            )}
            <NodePoolConfigOptions clusterTier={clusterTier} />
            <Box
              alignItems="center"
              display="flex"
              flexDirection="row"
              justifyContent={
                shouldShowPricingInfo ? 'space-between' : 'flex-end'
              }
            >
              {shouldShowPricingInfo && (
                <Typography>
                  This pool will add{' '}
                  <strong>
                    ${renderMonthlyPriceToCorrectDecimalPlace(totalPrice)}/month
                    ({pluralize('node', 'nodes', count)} at $
                    {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
                    /month)
                  </strong>{' '}
                  to this cluster.
                </Typography>
              )}
              <Button
                buttonType="primary"
                disabled={!type || hasInvalidPrice}
                loading={form.formState.isSubmitting}
                type="submit"
              >
                Add pool
              </Button>
            </Box>
          </Stack>
        </form>
      </FormProvider>
    </Drawer>
  );
};
