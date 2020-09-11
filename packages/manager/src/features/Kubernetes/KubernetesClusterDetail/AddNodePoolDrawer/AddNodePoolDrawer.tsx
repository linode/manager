import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { addCountToTypes } from 'src/features/Kubernetes/CreateCluster/NodePoolPanel.tsx';
import SelectPlanQuantityPanel, {
  ExtendedTypeWithCount
} from 'src/features/linodes/LinodesCreate/SelectPlanQuantityPanel.tsx';
import { filterCurrentTypes } from 'src/store/linodeType/linodeType.reducer';
import { pluralize } from 'src/utilities/pluralize';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { nodeWarning } from '../../kubeUtils';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 790
      },
      overflowX: 'hidden'
    },
    '& .MuiGrid-root': {
      marginBottom: 0
    }
  },
  error: {
    marginBottom: '0 !important'
  },
  plans: {
    '& > *': {
      marginTop: 0,
      '& > *': {
        padding: 0
      }
    }
  },
  button: {
    marginTop: '0 !important'
  },
  priceDisplay: {
    color: theme.color.headline,
    display: 'inline',
    fontSize: '1rem',
    lineHeight: '1.25rem',
    marginTop: theme.spacing(2),
    '& span': {
      fontWeight: 'bold'
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(2),
      marginTop: 0
    }
  },
  boxOuter: {
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column'
    }
  }
}));

export interface Props {
  clusterLabel: string;
  open: boolean;
  error?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: string, count: number) => void;
}

type CombinedProps = Props & WithTypesProps;

export const AddNodePoolDrawer: React.FC<CombinedProps> = props => {
  const {
    clusterLabel,
    error,
    isSubmitting,
    onClose,
    onSubmit,
    open,
    typesData: allTypes
  } = props;
  const classes = useStyles();

  // Only want to use current types here.
  const typesData = filterCurrentTypes(allTypes);

  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    undefined
  );
  const [_types, setNewType] = React.useState<ExtendedTypeWithCount[]>(
    addCountToTypes(typesData || [])
  );

  const _selectedType = _types.find(thisType => thisType.id === selectedType);
  const currentCount = _selectedType?.count ?? 0;
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
    const newTypes = _types.map(thisType => {
      return {
        ...thisType,
        count: 0
      };
    });
    setNewType(newTypes);
    setSelectedType(undefined);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    const newTypes = _types.map((thisType: any) => {
      if (thisType.id === planId) {
        return { ...thisType, count: newCount };
      }
      return { ...thisType, count: 0 };
    });
    setNewType(newTypes);
    // If everything's empty, we need to reset the selected type.
    if (newTypes.every(thisType => thisType.count === 0)) {
      setSelectedType(undefined);
    } else {
      setSelectedType(planId);
    }
  };

  const handleAdd = () => {
    const type = _types.find(thisType => thisType.id === selectedType);
    if (!type || !selectedType) {
      return;
    }
    onSubmit(type.id, type.count);
  };

  return (
    <Drawer
      title={`Add a Node Pool: ${clusterLabel}`}
      className={classes.drawer}
      open={open}
      onClose={onClose}
    >
      {error && <Notice className={classes.error} error text={error} />}
      <form className={classes.plans}>
        <SelectPlanQuantityPanel
          // No nanodes or GPUs in clusters
          types={_types.filter(t => t.class !== 'nanode' && t.class !== 'gpu')}
          selectedID={selectedType}
          onSelect={(newType: string) => setSelectedType(newType)}
          updatePlanCount={updatePlanCount}
          addPool={handleAdd}
          isSubmitting={isSubmitting}
          resetValues={resetDrawer}
        />
        {currentCount > 0 && currentCount < 3 && (
          <Notice important warning text={nodeWarning} spacingTop={8} />
        )}
        <ActionsPanel className={classes.button}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            className={classes.boxOuter}
          >
            <Button
              buttonType="primary"
              onClick={() => handleAdd()}
              disabled={currentCount === 0}
              loading={isSubmitting}
            >
              Add pool
            </Button>
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
          </Box>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, Props>(withTypes);

export default enhanced(AddNodePoolDrawer);
