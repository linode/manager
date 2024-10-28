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

import type {
  ClusterSize,
  Database,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  DatabaseType,
  Engine,
  UpdateDatabasePayload,
} from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';
import { determineInitialPlanCategoryTab } from 'src/features/components/PlansPanel/utils';
import { NodePricing } from '../../DatabaseCreate/DatabaseCreate';
import { useIsDatabasesEnabled } from '../../utilities';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { Divider } from 'src/components/Divider';
import { RadioGroup } from 'src/components/RadioGroup';
import { StyledChip } from 'src/features/components/PlansPanel/PlanSelection.styles';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  formControlLabel: {
    marginBottom: theme.spacing(),
  },
  disabledOptionLabel: {
    color:
      theme.palette.mode === 'dark' ? theme.color.grey6 : theme.color.grey1,
  },
  summarySpanBorder: {
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    paddingRight: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  nodeSpanSpacing: {
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseResize = ({ database, disabled = false }: Props) => {
  const { classes } = useStyles();
  const history = useHistory();

  const [planSelected, setPlanSelected] = React.useState<string | undefined>(
    database.type
  );
  const [summaryText, setSummaryText] = React.useState<{
    numberOfNodes: ClusterSize;
    plan: string;
    price: string;
    basePrice: string;
  }>();
  const [nodePricing, setNodePricing] = React.useState<
    NodePricing | undefined
  >();
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

  const [selectedTab, setSelectedTab] = React.useState(0);
  const { isDatabasesV2Enabled, isDatabasesV2GA } = useIsDatabasesEnabled();
  const [clusterSize, setClusterSize] = React.useState<ClusterSize | undefined>(
    database.cluster_size
  );

  const {
    error: resizeError,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(database.engine, database.id);

  const {
    data: dbTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery({ platform: database.platform });

  const { enqueueSnackbar } = useSnackbar();

  const onResize = () => {
    const payload: UpdateDatabasePayload = {};

    if (clusterSize && clusterSize > database.cluster_size && isDatabasesV2GA) {
      payload.cluster_size = clusterSize;
    }

    if (planSelected) {
      payload.type = planSelected;
    }

    updateDatabase(payload).then(() => {
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

  const resizeSummary = (
    <>
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
        data-testid="resizeSummary"
      >
        {summaryText ? (
          <>
            <StyledPlanSummarySpan>
              {isDatabasesV2GA
                ? 'Resized Cluster: ' + summaryText.plan
                : summaryText.plan}
            </StyledPlanSummarySpan>{' '}
            {isDatabasesV2GA ? (
              <span
                className={isDatabasesV2GA ? classes.summarySpanBorder : ''}
              >
                {summaryText.basePrice}
              </span>
            ) : null}
            <span className={isDatabasesV2GA ? classes.nodeSpanSpacing : ''}>
              {' '}
              {summaryText.numberOfNodes} Node
              {summaryText.numberOfNodes > 1 ? 's' : ''}
              {!isDatabasesV2GA ? ': ' : ' - HA '}
            </span>
            {summaryText.price}
          </>
        ) : isDatabasesV2GA ? (
          <>
            <StyledPlanSummarySpan>Resized Cluster:</StyledPlanSummarySpan>{' '}
            Please select a plan or set the number of nodes.
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

  const setSummaryAndPrices = (
    databaseTypeId: string,
    engine: Engine,
    dbTypes: DatabaseType[]
  ) => {
    const selectedPlanType = dbTypes.find(
      (type: DatabaseType) => type.id === databaseTypeId
    );
    if (selectedPlanType) {
      // When plan is found, set node pricing
      const nodePricingDetails = {
        double: selectedPlanType.engines[engine]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 2
        )?.price,
        multi: selectedPlanType.engines[engine]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 3
        )?.price,
        single: selectedPlanType.engines[engine]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 1
        )?.price,
      };
      setNodePricing(nodePricingDetails);
    } else {
      // If plan is not found, clear plan selection
      setPlanSelected(undefined);
    }

    if (!selectedPlanType || !clusterSize) {
      setSummaryText(undefined);
      setShouldSubmitBeDisabled(true);
      return;
    }

    const price = selectedPlanType.engines[engine].find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === clusterSize
    )?.price as DatabasePriceObject;
    const resizeBasePrice = selectedPlanType.engines[engine][0]
      .price as DatabasePriceObject;
    const currentPlanPrice = `$${resizeBasePrice?.monthly}/month`;

    setSummaryText({
      numberOfNodes: clusterSize,
      plan: formatStorageUnits(selectedPlanType.label),
      price: isDatabasesV2GA
        ? `$${price?.monthly}/month`
        : `$${price?.monthly}/month or $${price?.hourly}/hour`,
      basePrice: currentPlanPrice,
    });

    setShouldSubmitBeDisabled(false);
    return;
  };

  React.useEffect(() => {
    const nodeSelected = clusterSize && clusterSize > database.cluster_size;
    const isSamePlanSelected = planSelected === database.type;
    if (!dbTypes) {
      return;
    }
    // Set default message and disable submit when no new selection is made
    if (!nodeSelected && (!planSelected || isSamePlanSelected)) {
      setShouldSubmitBeDisabled(true);
      setSummaryText(undefined);
      return;
    }
    const engineType = database.engine.split('/')[0] as Engine;
    // When only a higher node selection is made and plan has not been changed
    if (isDatabasesV2GA && nodeSelected && isSamePlanSelected) {
      setSummaryAndPrices(database.type, engineType, dbTypes);
    }
    // No plan selection or plan selection is unchanged
    if (!planSelected || isSamePlanSelected) {
      return;
    }
    // When a new plan is selected
    setSummaryAndPrices(planSelected, engineType, dbTypes);
  }, [
    dbTypes,
    database.engine,
    database.type,
    planSelected,
    database.cluster_size,
    clusterSize,
  ]);

  const selectedEngine = database.engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionWithDatabaseType[] = React.useMemo(() => {
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
  const currentEngine = database.engine.split('/')[0] as Engine;
  const currentPrice = currentPlan?.engines[currentEngine].find(
    (cluster: DatabaseClusterSizeObject) =>
      cluster.quantity === database.cluster_size
  )?.price as DatabasePriceObject;
  const currentBasePrice = currentPlan?.engines[currentEngine][0]
    .price as DatabasePriceObject;
  const currentNodePrice = `$${currentPrice?.monthly}/month`;
  const currentPlanPrice = `$${currentBasePrice?.monthly}/month`;
  const currentSummary = (
    <Box data-testid="currentSummary">
      <StyledPlanSummarySpan>
        Current Cluster: {currentPlan?.heading}
      </StyledPlanSummarySpan>{' '}
      <span className={isDatabasesV2GA ? classes.summarySpanBorder : ''}>
        {currentPlanPrice}
      </span>
      <span className={classes.nodeSpanSpacing}>
        {' '}
        {database.cluster_size} Node
        {database.cluster_size > 1 ? 's - HA ' : ' '}
      </span>
      {currentNodePrice}
    </Box>
  );

  const isDisabledSharedTab = database.cluster_size === 2;

  React.useEffect(() => {
    const initialTab = determineInitialPlanCategoryTab(
      displayTypes,
      planSelected,
      currentPlan?.heading
    );
    setSelectedTab(initialTab);

    if (isDatabasesV2GA) {
      const engineType = database.engine.split('/')[0] as Engine;
      const nodePricingDetails = {
        double: currentPlan?.engines[engineType]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 2
        )?.price,
        multi: currentPlan?.engines[engineType]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 3
        )?.price,
        single: currentPlan?.engines[engineType]?.find(
          (cluster: DatabaseClusterSizeObject) => cluster.quantity === 1
        )?.price,
      };
      setNodePricing(nodePricingDetails);
    }
  }, [dbTypes, displayTypes]);

  const handleNodeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const size = Number(event.currentTarget.value) as ClusterSize;
    const selectedPlanTab = determineInitialPlanCategoryTab(
      displayTypes,
      planSelected
    );
    // If 2 Nodes is selected for an incompatible plan, clear selected plan and related information
    if (size === 2 && selectedPlanTab !== 0) {
      setNodePricing(undefined);
      setPlanSelected(undefined);
      setSummaryText(undefined);
    }
    setClusterSize(size);
  };

  const handleTabChange = (index: number) => {
    if (selectedTab === index) {
      return;
    }
    // Clear plan and related info when when 2 nodes option is selected for incompatible plan.
    if (isDatabasesV2GA && selectedTab === 0 && clusterSize === 2) {
      setClusterSize(undefined);
      setPlanSelected(undefined);
      setNodePricing(undefined);
      setSummaryText(undefined);
    }
    setSelectedTab(index);
  };

  const nodeOptions = React.useMemo(() => {
    const hasDedicated = displayTypes.some(
      (type) => type.class === 'dedicated'
    );

    const currentChip = (
      <StyledChip
        aria-label="This is your current number of nodes"
        label="Current"
      />
    );

    const isDisabled = (nodeSize: ClusterSize) => {
      return nodeSize < database.cluster_size;
    };

    const options = [
      {
        label: (
          <Typography
            component={'div'}
            className={isDisabled(1) ? classes.disabledOptionLabel : ''}
          >
            <span>1 Node {` `}</span>
            {database.cluster_size === 1 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {`$${nodePricing?.single?.monthly || 0}/month $${
                nodePricing?.single?.hourly || 0
              }/hr`}
            </span>
          </Typography>
        ),
        value: 1,
      },
    ];

    if (hasDedicated && selectedTab === 0 && isDatabasesV2Enabled) {
      options.push({
        label: (
          <Typography
            component={'div'}
            className={isDisabled(2) ? classes.disabledOptionLabel : ''}
          >
            <span>2 Nodes - High Availability</span>
            {database.cluster_size === 2 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {`$${nodePricing?.double?.monthly || 0}/month $${
                nodePricing?.double?.hourly || 0
              }/hr`}
            </span>
          </Typography>
        ),
        value: 2,
      });
    }

    options.push({
      label: (
        <Typography
          component={'div'}
          className={isDisabled(3) ? classes.disabledOptionLabel : ''}
        >
          <span>3 Nodes - High Availability (recommended)</span>
          {database.cluster_size === 3 && currentChip}
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${nodePricing?.multi?.monthly || 0}/month $${
              nodePricing?.multi?.hourly || 0
            }/hr`}
          </span>
        </Typography>
      ),
      value: 3,
    });

    return options;
  }, [selectedTab, nodePricing, displayTypes, isDatabasesV2Enabled]);

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
          disabled={disabled}
          disabledSmallerPlans={disabledPlans}
          disabledTabs={isDisabledSharedTab ? ['shared'] : []}
          header="Choose a Plan"
          onSelect={(selected: string) => setPlanSelected(selected)}
          handleTabChange={handleTabChange}
          selectedId={planSelected}
          tabDisabledMessage="Resizing a 2-nodes cluster is only allowed with Dedicated plans."
          types={displayTypes}
        />
        {isDatabasesV2GA && (
          <>
            <Divider spacingBottom={20} spacingTop={20} />

            <Typography style={{ marginBottom: 4 }} variant="h2">
              Set Number of Nodes{' '}
            </Typography>
            <Typography style={{ marginBottom: 8 }}>
              We recommend 3 nodes in a database cluster to avoid downtime
              during upgrades and maintenance.
            </Typography>

            <RadioGroup
              style={{ marginBottom: 0, marginTop: 0 }}
              value={clusterSize ?? ''}
              onChange={handleNodeChange}
              data-testid="database-nodes"
            >
              {nodeOptions.map((nodeOption) => (
                <FormControlLabel
                  className={classes.formControlLabel}
                  control={<Radio />}
                  data-testid={`database-node-${nodeOption.value}`}
                  data-qa-radio={nodeOption.label}
                  key={nodeOption.value}
                  label={nodeOption.label}
                  value={nodeOption.value}
                  disabled={nodeOption.value < database.cluster_size}
                />
              ))}
            </RadioGroup>
          </>
        )}
      </Paper>
      <Paper sx={{ marginTop: 2 }}>
        <Typography
          sx={(theme) => ({
            marginBottom: isDatabasesV2GA ? theme.spacing(2) : 0,
          })}
          variant="h2"
        >
          Summary {isDatabasesV2GA ? database.label : ''}
        </Typography>
        {isDatabasesV2GA && currentPlan ? currentSummary : null}
        {resizeSummary}
      </Paper>
      <StyledGrid>
        <StyledResizeButton
          onClick={() => {
            setIsResizeConfirmationDialogOpen(true);
          }}
          buttonType="primary"
          disabled={shouldSubmitBeDisabled || disabled}
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
