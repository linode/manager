import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SelectPlanQuantityPanel from 'src/features/linodes/LinodesCreate/SelectPlanQuantityPanel';
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

  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    undefined
  );
  const [typeCountMap, setTypeCountMap] = React.useState<Map<string, number>>(
    new Map()
  );
  const getTypeCount = React.useCallback(
    (planId: string) => typeCountMap.get(planId) ?? 0,
    [typeCountMap]
  );

  const _selectedType = extendedTypes.find(
    (thisType) => thisType.id === selectedType
  );
  const currentCount = _selectedType
    ? typeCountMap.get(_selectedType.id) ?? 0
    : 0;
  const pricePerNode = _selectedType?.price?.monthly ?? 0;

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
    setTypeCountMap(new Map());
    setSelectedType(undefined);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    setTypeCountMap(new Map(typeCountMap).set(planId, newCount));
    // If everything's empty, we need to reset the selected type.
    if (Array.from(typeCountMap.values()).every((count) => count === 0)) {
      setSelectedType(undefined);
    } else {
      setSelectedType(planId);
    }
  };

  const handleAdd = () => {
    const type = extendedTypes.find((thisType) => thisType.id === selectedType);
    if (!type) {
      return;
    }

    const count = getTypeCount(type.id);

    return createPool({ type: type.id, count }).then(() => {
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
        <SelectPlanQuantityPanel
          // No nanodes or GPUs in clusters
          types={extendedTypes.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )}
          getTypeCount={getTypeCount}
          selectedID={selectedType}
          onSelect={(newType: string) => setSelectedType(newType)}
          updatePlanCount={updatePlanCount}
          addPool={handleAdd}
          isSubmitting={isLoading}
          resetValues={resetDrawer}
        />
        {currentCount > 0 && currentCount < 3 && (
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
            justifyContent={currentCount > 0 ? 'space-between' : 'flex-end'}
            className={classes.boxOuter}
          >
            {currentCount > 0 && (
              <Typography className={classes.priceDisplay}>
                This pool will add{' '}
                <strong>
                  ${currentCount * pricePerNode}/month (
                  {pluralize('node', 'nodes', currentCount)} at ${pricePerNode}
                  /month)
                </strong>{' '}
                to this cluster.
              </Typography>
            )}
            <Button
              buttonType="primary"
              onClick={() => handleAdd()}
              disabled={currentCount === 0}
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
