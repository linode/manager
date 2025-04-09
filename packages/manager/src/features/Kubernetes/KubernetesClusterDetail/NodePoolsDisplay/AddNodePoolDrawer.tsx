import { ActionsPanel, Box, Drawer, Notice, Typography } from '@linode/ui';
import {
  isNumber,
  plansNoticesUtils,
  pluralize,
  scrollErrorIntoViewV2,
} from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { NotFound } from 'src/components/NotFound';
import { useCreateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import { nodeWarning } from '../../constants';
import { KubernetesPlansPanel } from '../../KubernetesPlansPanel/KubernetesPlansPanel';
import { hasInvalidNodePoolPrice } from './utils';

import type { KubernetesTier, Region } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  boxOuter: {
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    width: '100%',
  },
  error: {
    marginBottom: '0 !important',
  },
  plans: {
    '& > *': {
      '& > *': {
        padding: 0,
      },
      marginTop: 0,
    },
  },
  priceDisplay: {
    '& span': {
      font: theme.font.bold,
    },
    color: theme.color.headline,
    display: 'inline',
    fontSize: '1rem',
    lineHeight: '1.25rem',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

export interface Props {
  clusterId: number;
  clusterLabel: string;
  clusterRegionId: Region['id'];
  clusterTier: KubernetesTier;
  onClose: () => void;
  open: boolean;
  regionsData: Region[];
}

export const AddNodePoolDrawer = (props: Props) => {
  const {
    clusterId,
    clusterLabel,
    clusterRegionId,
    clusterTier,
    onClose,
    open,
    regionsData,
  } = props;
  const { classes } = useStyles();
  const { data: types } = useAllTypes(open);
  const {
    error,
    isPending,
    mutateAsync: createPool,
  } = useCreateNodePoolMutation(clusterId);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Only want to use current types here.
  const extendedTypes = filterCurrentTypes(types?.map(extendType));

  const [selectedTypeInfo, setSelectedTypeInfo] = React.useState<
    { count: number; planId: string } | undefined
  >(undefined);
  const [addNodePoolError, setAddNodePoolError] = React.useState<string>('');

  const getTypeCount = React.useCallback(
    (planId: string) =>
      planId === selectedTypeInfo?.planId ? selectedTypeInfo.count : 0,
    [selectedTypeInfo]
  );

  const selectedType = selectedTypeInfo
    ? extendedTypes.find((thisType) => thisType.id === selectedTypeInfo.planId)
    : undefined;

  const pricePerNode = getLinodeRegionPrice(
    selectedType,
    clusterRegionId
  )?.monthly;

  const totalPrice =
    selectedTypeInfo && isNumber(pricePerNode)
      ? selectedTypeInfo.count * pricePerNode
      : undefined;

  const hasInvalidPrice = hasInvalidNodePoolPrice(pricePerNode, totalPrice);

  React.useEffect(() => {
    if (open) {
      resetDrawer();
      setAddNodePoolError('');
    }
  }, [open]);

  React.useEffect(() => {
    if (error) {
      setAddNodePoolError(error?.[0].reason);
      scrollErrorIntoViewV2(drawerRef);
    }
  }, [error]);

  const resetDrawer = () => {
    setSelectedTypeInfo(undefined);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    setSelectedTypeInfo(newCount > 0 ? { count: newCount, planId } : undefined);
  };

  const handleAdd = () => {
    if (!selectedTypeInfo) {
      return;
    }
    return createPool({
      count: selectedTypeInfo.count,
      type: selectedTypeInfo.planId,
    }).then(() => {
      onClose();
    });
  };

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID: clusterRegionId,
  });

  return (
    <Drawer
      PaperProps={{
        sx: { maxWidth: '790px !important' },
      }}
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      ref={drawerRef}
      title={`Add a Node Pool: ${clusterLabel}`}
      wide
    >
      {addNodePoolError && (
        <Notice spacingBottom={0} spacingTop={12} variant="error">
          <ErrorMessage
            entity={{ id: clusterId, type: 'lkecluster_id' }}
            message={addNodePoolError}
          />
        </Notice>
      )}
      <form className={classes.plans}>
        <KubernetesPlansPanel
          onSelect={(newType: string) => {
            if (selectedTypeInfo?.planId !== newType) {
              setSelectedTypeInfo({ count: 1, planId: newType });
            }
          }}
          addPool={handleAdd}
          getTypeCount={getTypeCount}
          hasSelectedRegion={hasSelectedRegion}
          isPlanPanelDisabled={isPlanPanelDisabled}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          isSubmitting={isPending}
          regionsData={regionsData}
          resetValues={resetDrawer}
          selectedId={selectedTypeInfo?.planId}
          selectedRegionId={clusterRegionId}
          selectedTier={clusterTier}
          // No nanodes in clusters
          types={extendedTypes.filter((t) => t.class !== 'nanode')}
          updatePlanCount={updatePlanCount}
        />
        {selectedTypeInfo &&
          selectedTypeInfo.count > 0 &&
          selectedTypeInfo.count < 3 && (
            <Notice
              important
              spacingBottom={16}
              spacingTop={8}
              text={nodeWarning}
              variant="warning"
            />
          )}

        {selectedTypeInfo && hasInvalidPrice && (
          <Notice
            spacingBottom={16}
            spacingTop={8}
            text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
            variant="error"
          />
        )}

        <Box
          alignItems="center"
          className={classes.boxOuter}
          display="flex"
          flexDirection="row"
          justifyContent={selectedTypeInfo ? 'space-between' : 'flex-end'}
        >
          {selectedTypeInfo && (
            <Typography className={classes.priceDisplay}>
              This pool will add{' '}
              <strong>
                ${renderMonthlyPriceToCorrectDecimalPlace(totalPrice)}/month (
                {pluralize('node', 'nodes', selectedTypeInfo.count)} at $
                {renderMonthlyPriceToCorrectDecimalPlace(pricePerNode)}
                /month)
              </strong>{' '}
              to this cluster.
            </Typography>
          )}
          <ActionsPanel
            primaryButtonProps={{
              disabled: !selectedTypeInfo || hasInvalidPrice,
              label: 'Add pool',
              loading: isPending,
              onClick: handleAdd,
            }}
          />
        </Box>
      </form>
    </Drawer>
  );
};
