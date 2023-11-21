import {
  Database,
  DatabaseClusterSizeObject,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import { useDatabaseTypesQuery } from 'src/queries/databases';
import { useDatabaseMutation } from 'src/queries/databases';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { DatabaseScaleUpCurrentConfiguration } from './DatabaseScaleUpCurrentConfiguration';

const useStyles = makeStyles()((theme: Theme) => ({
  btnCtn: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-end',
      flexDirection: 'column',
      marginTop: theme.spacing(),
    },
  },
  scaleUpBtn: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
    whiteSpace: 'nowrap',
  },
  selectPlanPanel: {
    margin: 0,
    padding: 0,
  },
  selectedPlanTitle: {
    fontFamily: theme.font.bold,
  },
}));

interface Props {
  database: Database;
}

export const DatabaseScaleUp = ({ database }: Props) => {
  const { classes } = useStyles();
  const history = useHistory();

  const [planSelected, setPlanSelected] = React.useState<string>();
  const [summaryText, setSummaryText] = React.useState<{
    numberOfNodes: number;
    plan: string;
    price: string;
  }>();
  // This will be set to `false` once one of the configuration is selected from available plan. This is used to disable the
  // "Scale up" button unless there have been changes to the form.
  const [
    shouldSubmitBeDisabled,
    setShouldSubmitBeDisabled,
  ] = React.useState<boolean>(true);

  const [
    isScaleUpConfirmationDialogOpen,
    setIsScaleUpConfirmationDialogOpen,
  ] = React.useState(false);

  const {
    error: scaleUpError,
    isLoading: submitInProgress,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(database.engine, database.id);

  const {
    data: dbtypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery();

  const { enqueueSnackbar } = useSnackbar();

  const onScaleUp = () => {
    updateDatabase({
      type: planSelected,
    }).then(() => {
      enqueueSnackbar(
        `Your database cluster ${database.label} is being scaled up.`,
        {
          variant: 'info',
        }
      );
      history.push(`/databases/${database.engine}/${database.id}`);
    });
  };

  const scaleUpDescription = (
    <>
      <Typography variant="h2">Scaling up a Database Cluster</Typography>
      <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
        Adapt the cluster to your needs by scaling it up. Clusters cannot be
        scaled down.
      </Typography>
    </>
  );

  const summaryPanel = (
    <>
      <Typography variant="h2">Summary</Typography>
      <div data-testid="summary" style={{ lineHeight: '20px', marginTop: 16 }}>
        {summaryText ? (
          <span>
            <span className={classes.selectedPlanTitle}>
              {summaryText.plan}
            </span>{' '}
            {summaryText.numberOfNodes} Node
            {summaryText.numberOfNodes > 1 ? 's' : ''}: {summaryText.price}
          </span>
        ) : (
          'Please choose your plan.'
        )}
      </div>
    </>
  );

  const confirmationDialogActions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'button-confirm',
        label: 'Continue',
        loading: submitInProgress,
        onClick: onScaleUp,
      }}
      secondaryButtonProps={{
        'data-testid': 'button-cancel',
        label: 'Cancel',
        onClick: () => setIsScaleUpConfirmationDialogOpen(false),
      }}
    />
  );

  const confirmationPopUpMessage =
    database.cluster_size === 1 ? (
      <Notice variant="warning">
        <Typography variant="h3">{`Warning: This operation will cause downtime for your upscaled node cluster.`}</Typography>
      </Notice>
    ) : (
      <Notice variant="info">
        <Typography variant="h3">{`Operation can take up to 2 hours and will incur a failover.`}</Typography>
      </Notice>
    );

  React.useEffect(() => {
    if (!planSelected || !dbtypes) {
      return;
    }

    const selectedPlanType = dbtypes.find((type) => type.id === planSelected);
    if (!selectedPlanType) {
      setPlanSelected(undefined);
      setSummaryText(undefined);
      setShouldSubmitBeDisabled(true);
      return;
    }

    const engineType = database.engine.split('/')[0];
    const price = selectedPlanType.engines[engineType].find(
      (cluster: DatabaseClusterSizeObject) =>
        cluster.quantity === database.cluster_size
    )?.price;

    setShouldSubmitBeDisabled(false);

    setSummaryText({
      numberOfNodes: database.cluster_size,
      plan: formatStorageUnits(selectedPlanType.label),
      price: `$${price.monthly}/month or $${price.hourly}/hour`,
    });
  }, [
    dbtypes,
    database.engine,
    database.type,
    planSelected,
    database.cluster_size,
  ]);

  const selectedEngine = database.engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionType[] = React.useMemo(() => {
    if (!dbtypes) {
      return [];
    }
    return dbtypes.map((type) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);
      const nodePricing = type.engines[selectedEngine].find(
        (cluster) => cluster.quantity === database.cluster_size
      );
      const price = nodePricing?.price ?? {
        hourly: null,
        monthly: null,
      };
      const subHeadings = [
        `$${price.monthly}/mo ($${price.hourly}/hr)`,
        typeLabelDetails(type.memory, type.disk, type.vcpus),
      ] as [string, string];
      return {
        ...type,
        formattedLabel,
        heading: formattedLabel,
        price,
        subHeadings,
      };
    });
  }, [database.cluster_size, dbtypes, selectedEngine]);

  const currentPlan = displayTypes?.find((type) => type.id === database.type);

  if (typesLoading) {
    return <CircleProgress />;
  }

  if (typesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <>
      <Paper style={{ marginTop: 16 }}>
        {scaleUpDescription}
        <div style={{ marginTop: 16 }}>
          <DatabaseScaleUpCurrentConfiguration database={database} />
        </div>
      </Paper>
      <Paper style={{ marginTop: 16 }}>
        <PlansPanel
          className={classes.selectPlanPanel}
          currentPlanHeading={currentPlan?.heading}
          data-qa-select-plan
          header="Choose a Plan"
          onSelect={(selected: string) => setPlanSelected(selected)}
          selectedDiskSize={currentPlan?.disk}
          selectedId={planSelected}
          types={displayTypes}
        />
      </Paper>
      <Paper style={{ marginTop: 16 }}>{summaryPanel}</Paper>
      <Grid className={classes.btnCtn}>
        <Button
          onClick={() => {
            setIsScaleUpConfirmationDialogOpen(true);
          }}
          buttonType="primary"
          className={classes.scaleUpBtn}
          disabled={shouldSubmitBeDisabled}
          type="submit"
        >
          Scale Up Database Cluster
        </Button>
      </Grid>
      <ConfirmationDialog
        actions={confirmationDialogActions}
        error={scaleUpError?.[0].reason}
        onClose={() => setIsScaleUpConfirmationDialogOpen(false)}
        open={isScaleUpConfirmationDialogOpen}
        title={`Scale up ${database.label}?`}
      >
        {confirmationPopUpMessage}
      </ConfirmationDialog>
    </>
  );
};
