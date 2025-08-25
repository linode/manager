import { useAllTypes, useRegionsQuery } from '@linode/queries';
import { Box, Button, Drawer, Notice, Stack, Typography } from '@linode/ui';
import {
  isNumber,
  plansNoticesUtils,
  pluralize,
  scrollErrorIntoView,
} from '@linode/utilities';
import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
// import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
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
import { useIsLkeEnterpriseEnabled } from '../../kubeUtils';
import { NodePoolUpdateStrategySelect } from '../../NodePoolUpdateStrategySelect';
import { hasInvalidNodePoolPrice } from './utils';

import type {
  CreateNodePoolData,
  KubernetesTier,
  Region,
} from '@linode/api-v4';

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

  const { isLkeEnterprisePostLAFeatureEnabled } = useIsLkeEnterpriseEnabled();
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const { data: types, isLoading: isTypesLoading } = useAllTypes(open);

  const {
    error,
    isPending,
    mutateAsync: createPool,
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
  const shouldShowPricingInfo = type && count > 0;

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
          sx: { maxWidth: '790px !important' },
        },
      }}
      title={`Add a Node Pool: ${clusterLabel}`}
      wide
    >
      {form.formState.errors.root?.message && (
        <Notice spacingBottom={0} spacingTop={12} variant="error">
          <ErrorMessage
            entity={{ id: clusterId, type: 'lkecluster_id' }}
            message={form.formState.errors.root?.message}
          />
        </Notice>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <KubernetesPlansPanel
          copy={getPlansPanelCopy()}
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
          notice={<PremiumCPUPlanNotice spacingBottom={16} spacingTop={16} />}
          onSelect={(type) => form.setValue('type', type)}
          regionsData={regions ?? []}
          resetValues={() => form.reset()}
          selectedId={type}
          selectedRegionId={clusterRegionId}
          selectedTier={clusterTier}
          types={extendedTypes}
          updatePlanCount={updatePlanCount}
        />
        {count > 0 && count < 3 && (
          <Notice
            spacingBottom={16}
            spacingTop={8}
            text={nodeWarning}
            variant="warning"
          />
        )}
        {hasInvalidPrice && shouldShowPricingInfo && (
          <Notice
            spacingBottom={16}
            spacingTop={8}
            text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
            variant="error"
          />
        )}
        {isLkeEnterprisePostLAFeatureEnabled &&
          clusterTier === 'enterprise' && (
            <Stack spacing={2}>
              <Typography variant="h3">Configuration</Typography>
              <Controller
                control={form.control}
                name="update_strategy"
                render={({ field }) => (
                  <NodePoolUpdateStrategySelect
                    label="Update Strategy"
                    noMarginTop
                    onChange={field.onChange}
                    value={field.value!}
                  />
                )}
              />
              {/*
              <Controller
                control={form.control}
                name="firewall_id"
                render={({ field, fieldState }) => (
                  <FirewallSelect
                    errorText={fieldState.error?.message}
                    onChange={(e, firewall) =>
                      field.onChange(firewall?.id ?? null)
                    }
                    value={field.value ?? null}
                  />
                )}
              />
              */}
            </Stack>
          )}
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent={shouldShowPricingInfo ? 'space-between' : 'flex-end'}
          mt={3}
        >
          {shouldShowPricingInfo && (
            <Typography>
              This pool will add{' '}
              <strong>
                ${renderMonthlyPriceToCorrectDecimalPlace(totalPrice)}/month (
                {pluralize('node', 'nodes', count)} at $
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
      </form>
    </Drawer>
  );
};
