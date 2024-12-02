import { Box, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { useCreateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { isNumber } from 'src/utilities/isNumber';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { pluralize } from 'src/utilities/pluralize';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { KubernetesPlansPanel } from '../../KubernetesPlansPanel/KubernetesPlansPanel';
import { nodeWarning } from '../../kubeUtils';
import { hasInvalidNodePoolPrice } from './utils';

import type { Region } from '@linode/api-v4';
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
      fontFamily: theme.font.bold,
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
  onClose: () => void;
  open: boolean;
  regionsData: Region[];
}

export const AddNodePoolDrawer = (props: Props) => {
  const {
    clusterId,
    clusterLabel,
    clusterRegionId,
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

  const pricePerNode = getLinodeRegionPrice(selectedType, clusterRegionId)
    ?.monthly;

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
          // No nanodes or GPUs in clusters
          types={extendedTypes.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )}
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
