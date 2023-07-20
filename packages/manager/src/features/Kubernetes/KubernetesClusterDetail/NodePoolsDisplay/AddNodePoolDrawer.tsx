import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { KubernetesPlansPanel } from 'src/features/Linodes/LinodesCreate/SelectPlanPanel/KubernetesPlansPanel';
import { useCreateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { pluralize } from 'src/utilities/pluralize';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { nodeWarning } from '../../kubeUtils';

import type { Region } from '@linode/api-v4';

const useStyles = makeStyles((theme: Theme) => ({
  boxOuter: {
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    width: '100%',
  },
  button: {
    marginTop: '0 !important',
    paddingTop: 0,
  },
  drawer: {
    '& .MuiDrawer-paper': {
      overflowX: 'hidden',
      [theme.breakpoints.up('md')]: {
        width: 790,
      },
    },
    '& .MuiGrid-root': {
      marginBottom: 0,
    },
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
      fontWeight: 'bold',
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
  const classes = useStyles();
  const { data: types } = useAllTypes(open);
  const {
    error,
    isLoading,
    mutateAsync: createPool,
  } = useCreateNodePoolMutation(clusterId);

  // Only want to use current types here.
  const extendedTypes = filterCurrentTypes(types?.map(extendType));

  const [selectedTypeInfo, setSelectedTypeInfo] = React.useState<
    { count: number; planId: string } | undefined
  >(undefined);

  const getTypeCount = React.useCallback(
    (planId: string) =>
      planId === selectedTypeInfo?.planId ? selectedTypeInfo.count : 0,
    [selectedTypeInfo]
  );

  const selectedType = selectedTypeInfo
    ? extendedTypes.find((thisType) => thisType.id === selectedTypeInfo.planId)
    : undefined;
  const pricePerNode = selectedType?.price?.monthly ?? 0;

  React.useEffect(() => {
    if (open) {
      resetDrawer();
    }
  }, [open]);

  React.useEffect(() => {
    if (error) {
      scrollErrorIntoView();
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
      className={classes.drawer}
      onClose={onClose}
      open={open}
      title={`Add a Node Pool: ${clusterLabel}`}
    >
      {error && (
        <Notice className={classes.error} error text={error?.[0].reason} />
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
          isSubmitting={isLoading}
          regionsData={regionsData}
          resetValues={resetDrawer}
          selectedID={selectedTypeInfo?.planId}
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
              warning
            />
          )}
        <ActionsPanel className={classes.button}>
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
                  ${selectedTypeInfo.count * pricePerNode}/month (
                  {pluralize('node', 'nodes', selectedTypeInfo.count)} at $
                  {pricePerNode}
                  /month)
                </strong>{' '}
                to this cluster.
              </Typography>
            )}
            <Button
              buttonType="primary"
              disabled={!selectedTypeInfo}
              loading={isLoading}
              onClick={handleAdd}
            >
              Add pool
            </Button>
          </Box>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
