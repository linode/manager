import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { KubernetesPlansPanel } from 'src/features/Linodes/LinodesCreate/SelectPlanPanel/KubernetesPlansPanel';
import { useCreateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { pluralize } from 'src/utilities/pluralize';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { nodeWarning } from '../../kubeUtils';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 790,
      },
      overflowX: 'hidden',
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
      marginTop: 0,
      '& > *': {
        padding: 0,
      },
    },
  },
  button: {
    paddingTop: 0,
    marginTop: '0 !important',
  },
  priceDisplay: {
    color: theme.color.headline,
    display: 'inline',
    fontSize: '1rem',
    lineHeight: '1.25rem',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& span': {
      fontWeight: 'bold',
    },
  },
  boxOuter: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
}));

export interface Props {
  clusterId: number;
  clusterLabel: string;
  open: boolean;
  onClose: () => void;
}

export const AddNodePoolDrawer = (props: Props) => {
  const { clusterId, clusterLabel, onClose, open } = props;
  const classes = useStyles();
  const { data: types } = useAllTypes(open);
  const {
    mutateAsync: createPool,
    isLoading,
    error,
  } = useCreateNodePoolMutation(clusterId);

  // Only want to use current types here.
  const extendedTypes = filterCurrentTypes(types?.map(extendType));

  const [selectedTypeInfo, setSelectedTypeInfo] = React.useState<
    { planId: string; count: number } | undefined
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
    setSelectedTypeInfo(newCount > 0 ? { planId, count: newCount } : undefined);
  };

  const handleAdd = () => {
    if (!selectedTypeInfo) {
      return;
    }
    return createPool({
      type: selectedTypeInfo.planId,
      count: selectedTypeInfo.count,
    }).then(() => {
      onClose();
    });
  };

  return (
    <Drawer
      title={`Add a Node Pool: ${clusterLabel}`}
      className={classes.drawer}
      open={open}
      onClose={onClose}
    >
      {error && (
        <Notice className={classes.error} error text={error?.[0].reason} />
      )}
      <form className={classes.plans}>
        <KubernetesPlansPanel
          // No nanodes or GPUs in clusters
          types={extendedTypes.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )}
          getTypeCount={getTypeCount}
          selectedID={selectedTypeInfo?.planId}
          onSelect={(newType: string) => {
            if (selectedTypeInfo?.planId !== newType) {
              setSelectedTypeInfo({ planId: newType, count: 1 });
            }
          }}
          updatePlanCount={updatePlanCount}
          addPool={handleAdd}
          isSubmitting={isLoading}
          resetValues={resetDrawer}
        />
        {selectedTypeInfo &&
          selectedTypeInfo.count > 0 &&
          selectedTypeInfo.count < 3 && (
            <Notice
              important
              warning
              text={nodeWarning}
              spacingTop={8}
              spacingBottom={16}
            />
          )}
        <ActionsPanel className={classes.button}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent={selectedTypeInfo ? 'space-between' : 'flex-end'}
            className={classes.boxOuter}
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
              onClick={handleAdd}
              disabled={!selectedTypeInfo}
              loading={isLoading}
            >
              Add pool
            </Button>
          </Box>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
