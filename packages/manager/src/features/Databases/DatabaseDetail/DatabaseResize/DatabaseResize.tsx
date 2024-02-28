import { LinodeTypeClass } from '@linode/api-v4';
import {
  Database,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import { getPlanSelectionsByPlanType } from 'src/features/components/PlansPanel/utils';
import { useDatabaseTypesQuery } from 'src/queries/databases';
import { useDatabaseMutation } from 'src/queries/databases';
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
      enqueueSnackbar(
        `Your database cluster ${database.label} is being resized.`,
        {
          variant: 'info',
        }
      );
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

  const confirmationDialogActions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'button-confirm',
        label: 'Resize',
        loading: submitInProgress,
        onClick: onResize,
      }}
      secondaryButtonProps={{
        'data-testid': 'button-cancel',
        label: 'Cancel',
        onClick: () => setIsResizeConfirmationDialogOpen(false),
      }}
    />
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

    const selectedPlanType = dbTypes.find((type) => type.id === planSelected);
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
    return dbTypes.map((type) => {
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
  // create an array of different class of types.
  const typeClasses: LinodeTypeClass[] = Object.keys(
    getPlanSelectionsByPlanType(displayTypes)
  ).map((plan) => (plan === 'shared' ? 'standard' : (plan as LinodeTypeClass)));
  const currentPlanClass = currentPlan?.class ?? 'dedicated';
  // We don't have a "Nanodes" tab anymore, so use `shared`
  const selectedTypeClass =
    currentPlanClass === 'nanode' ? 'standard' : currentPlanClass;
  // User cannot switch to different plan type apart from current plan while resizing a DB cluster. So disable rest of the tabs.
  const tabsToBeDisabled = typeClasses
    .filter((typeClass) => typeClass !== selectedTypeClass)
    .map((plan) => (plan === 'standard' ? 'shared' : plan));
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
          tabDisabledMessage={
            'You can resize your cluster only within already selected plan.'
          }
          currentPlanHeading={currentPlan?.heading}
          data-qa-select-plan
          disabledTabs={tabsToBeDisabled}
          header="Choose a Plan"
          onSelect={(selected: string) => setPlanSelected(selected)}
          selectedDiskSize={currentPlan?.disk}
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
      <ConfirmationDialog
        actions={confirmationDialogActions}
        error={resizeError?.[0].reason}
        onClose={() => setIsResizeConfirmationDialogOpen(false)}
        open={isResizeConfirmationDialogOpen}
        title={`Resize ${database.label}?`}
      >
        {confirmationPopUpMessage}
      </ConfirmationDialog>
    </>
  );
};
