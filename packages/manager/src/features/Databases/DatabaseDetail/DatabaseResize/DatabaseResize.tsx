import {
  Database,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  DatabaseType,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useDatabaseMutation } from 'src/queries/databases/databases';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import {
  StyledGrid,
  StyledPlanSummarySpan,
  StyledPlansPanel,
  StyledResizeButton,
} from './DatabaseResize.style';
import { DatabaseResizeCurrentConfiguration } from './DatabaseResizeCurrentConfiguration';

interface Props {
  database: Database;
}

export const DatabaseResize = ({ database }: Props) => {
  const history = useHistory();

  const [planSelected, setPlanSelected] = React.useState<string>();
  const [summaryText, setSummaryText] = React.useState<{
    numberOfNodes: number;
    plan: string;
    price: string;
  }>();
  // This will be set to `false` once one of the configuration is selected from available plan. This is used to disable the
  // "Resize" button unless there have been changes to the form.
  const [
    shouldSubmitBeDisabled,
    setShouldSubmitBeDisabled,
  ] = React.useState<boolean>(true);

  const [
    isResizeConfirmationDialogOpen,
    setIsResizeConfirmationDialogOpen,
  ] = React.useState(false);

  const {
    error: resizeError,
    isLoading: submitInProgress,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(database.engine, database.id);

  const {
    data: dbTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery();

  const { enqueueSnackbar } = useSnackbar();

  const onResize = () => {
    updateDatabase({
      type: planSelected,
    }).then(() => {
      enqueueSnackbar(`Database cluster ${database.label} is being resized.`, {
        variant: 'info',
      });
      history.push(`/databases/${database.engine}/${database.id}`);
    });
  };

  const resizeDescription = (
    <>
      <Typography variant="h2">Resize a Database Cluster</Typography>
      <Typography sx={{ marginTop: '4px' }}>
        Adapt the cluster to your needs by resizing to a larger plan. Clusters
        cannot be resized to smaller plans.
      </Typography>
    </>
  );

  const summaryPanel = (
    <>
      <Typography variant="h2">Summary</Typography>
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
        data-testid="summary"
      >
        {summaryText ? (
          <>
            <StyledPlanSummarySpan>{summaryText.plan}</StyledPlanSummarySpan>{' '}
            {summaryText.numberOfNodes} Node
            {summaryText.numberOfNodes > 1 ? 's' : ''}: {summaryText.price}
          </>
        ) : (
          'Please select a plan.'
        )}
      </Box>
    </>
  );

  const costSummary = (
    <Typography sx={{ marginBottom: '10px' }} variant="h3">
      {`The cost of the resized database is ${summaryText?.price}.`}
    </Typography>
  );
  const confirmationPopUpMessage =
    database.cluster_size === 1 ? (
      <>
        {costSummary}
        <Notice variant="warning">
          <Typography variant="h3">{`Warning: This operation will cause downtime for your resized node cluster.`}</Typography>
        </Notice>
      </>
    ) : (
      <>
        {costSummary}
        <Notice variant="info">
          <Typography variant="h3">{`Operation can take up to 2 hours and will incur a failover.`}</Typography>
        </Notice>
      </>
    );

  React.useEffect(() => {
    if (!planSelected || !dbTypes) {
      return;
    }

    const selectedPlanType = dbTypes.find(
      (type: DatabaseType) => type.id === planSelected
    );
    if (!selectedPlanType) {
      setPlanSelected(undefined);
      setSummaryText(undefined);
      setShouldSubmitBeDisabled(true);
      return;
    }

    const engineType = database.engine.split('/')[0] as Engine;
    const price = selectedPlanType.engines[engineType].find(
      (cluster: DatabaseClusterSizeObject) =>
        cluster.quantity === database.cluster_size
    )?.price as DatabasePriceObject;

    setShouldSubmitBeDisabled(false);

    setSummaryText({
      numberOfNodes: database.cluster_size,
      plan: formatStorageUnits(selectedPlanType.label),
      price: `$${price?.monthly}/month or $${price?.hourly}/hour`,
    });
  }, [
    dbTypes,
    database.engine,
    database.type,
    planSelected,
    database.cluster_size,
  ]);

  const selectedEngine = database.engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionType[] = React.useMemo(() => {
    if (!dbTypes) {
      return [];
    }
    return dbTypes.map((type: DatabaseType) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);
      const nodePricing = type.engines[selectedEngine].find(
        (cluster: DatabaseClusterSizeObject) =>
          cluster.quantity === database.cluster_size
      );
      const price = nodePricing?.price ?? {
        hourly: null,
        monthly: null,
      };
      const subHeadings = [
        `$${price.monthly}/mo ($${price.hourly}/hr)`,
        typeLabelDetails(type.memory, type.disk, type.vcpus),
      ];
      return {
        ...type,
        formattedLabel,
        heading: formattedLabel,
        price,
        subHeadings,
      };
    });
  }, [database.cluster_size, dbTypes, selectedEngine]);

  const currentPlan = displayTypes?.find((type) => type.id === database.type);
  const currentPlanDisk = currentPlan ? currentPlan.disk : 0;
  const disabledPlans = displayTypes?.filter((type) =>
    type.class === 'dedicated'
      ? type.disk < currentPlanDisk
      : type.disk <= currentPlanDisk
  );

  if (typesLoading) {
    return <CircleProgress />;
  }

  if (typesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }
  return (
    <>
      <Paper sx={{ marginTop: 2 }}>
        {resizeDescription}
        <Box sx={{ marginTop: 2 }}>
          <DatabaseResizeCurrentConfiguration database={database} />
        </Box>
      </Paper>
      <Paper sx={{ marginTop: 2 }}>
        <StyledPlansPanel
          currentPlanHeading={currentPlan?.heading}
          data-qa-select-plan
          disabledSmallerPlans={disabledPlans}
          header="Choose a Plan"
          onSelect={(selected: string) => setPlanSelected(selected)}
          selectedId={planSelected}
          types={displayTypes}
        />
      </Paper>
      <Paper sx={{ marginTop: 2 }}>{summaryPanel}</Paper>
      <StyledGrid>
        <StyledResizeButton
          onClick={() => {
            setIsResizeConfirmationDialogOpen(true);
          }}
          buttonType="primary"
          disabled={shouldSubmitBeDisabled}
          type="submit"
        >
          Resize Database Cluster
        </StyledResizeButton>
      </StyledGrid>
      <TypeToConfirmDialog
        entity={{
          action: 'resizing',
          name: database.label,
          primaryBtnText: 'Resize Cluster',
          subType: 'Cluster',
          type: 'Database',
        }}
        label={'Cluster Name'}
        loading={submitInProgress}
        onClick={onResize}
        onClose={() => setIsResizeConfirmationDialogOpen(false)}
        open={isResizeConfirmationDialogOpen}
        title={`Resize Database Cluster ${database.label}?`}
      >
        {resizeError ? (
          <Notice text={resizeError[0].reason} variant="error" />
        ) : null}
        {confirmationPopUpMessage}
      </TypeToConfirmDialog>
    </>
  );
};
