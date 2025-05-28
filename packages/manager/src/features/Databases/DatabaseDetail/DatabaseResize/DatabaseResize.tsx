import {
  Box,
  CircleProgress,
  Divider,
  ErrorState,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { determineInitialPlanCategoryTab } from 'src/features/components/PlansPanel/utils';
import { DatabaseNodeSelector } from 'src/features/Databases/DatabaseCreate/DatabaseNodeSelector';
import { DatabaseSummarySection } from 'src/features/Databases/DatabaseCreate/DatabaseSummarySection';
import { DatabaseResizeCurrentConfiguration } from 'src/features/Databases/DatabaseDetail/DatabaseResize/DatabaseResizeCurrentConfiguration';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useDatabaseMutation } from 'src/queries/databases/databases';

import {
  StyledGrid,
  StyledPlansPanel,
  StyledResizeButton,
} from './DatabaseResize.style';
import { isSmallerOrEqualCurrentPlan } from './DatabaseResize.utils';

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

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseResize = ({ database, disabled = false }: Props) => {
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = React.useState<
    string | undefined
  >(database.type);

  const [isResizeConfirmationDialogOpen, setIsResizeConfirmationDialogOpen] =
    React.useState(false);

  const [selectedTab, setSelectedTab] = React.useState(0);
  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const isNewDatabaseGA =
    isDatabasesV2GA && database.platform !== 'rdbms-legacy';
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

    if (clusterSize && isDatabasesV2GA) {
      payload.cluster_size = clusterSize;
    }

    if (selectedPlanId) {
      payload.type = selectedPlanId;
    }

    updateDatabase(payload).then(() => {
      enqueueSnackbar(`Database cluster ${database.label} is being resized.`, {
        variant: 'info',
      });
      navigate({
        to: '/databases/$engine/$databaseId',
        params: {
          engine: database.engine,
          databaseId: database.id,
        },
      });
    });
  };

  const resizeDescription = (
    <>
      <Typography variant="h2">Resize a Database Cluster</Typography>
      <Typography sx={{ marginTop: '4px' }}>
        {isNewDatabaseGA
          ? 'Adapt the cluster to your needs by resizing it to a smaller or larger plan.'
          : 'Adapt the cluster to your needs by resizing to a larger plan. Clusters cannot be resized to smaller plans.'}
      </Typography>
    </>
  );

  const selectedEngine = database.engine.split('/')[0] as Engine;

  const summaryText = React.useMemo(() => {
    const nodeSelected = clusterSize && clusterSize !== database.cluster_size;
    const isSamePlanSelected = selectedPlanId === database.type;
    if (!dbTypes) {
      return undefined;
    }
    // Set default message and disable submit when no new selection is made
    if (!nodeSelected && (!selectedPlanId || isSamePlanSelected)) {
      return undefined;
    }

    const selectedPlanType = dbTypes.find(
      (type: DatabaseType) => type.id === selectedPlanId
    );

    if (!selectedPlanType || !clusterSize) {
      return undefined;
    }

    const price = selectedPlanType.engines[selectedEngine].find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === clusterSize
    )?.price as DatabasePriceObject;
    const resizeBasePrice = selectedPlanType.engines[selectedEngine][0]
      .price as DatabasePriceObject;
    const currentPlanPrice = `$${resizeBasePrice?.monthly}/month`;

    return {
      basePrice: currentPlanPrice,
      numberOfNodes: clusterSize,
      plan: formatStorageUnits(selectedPlanType.label),
      price: isNewDatabaseGA
        ? `$${price?.monthly}/month`
        : `$${price?.monthly}/month or $${price?.hourly}/hour`,
    };
  }, [selectedPlanId, clusterSize, selectedTab]);

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

  const displayTypes: PlanSelectionWithDatabaseType[] = React.useMemo(() => {
    if (!dbTypes) {
      return [];
    }

    return dbTypes.map((type: DatabaseType) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);

      const nodePricing = type.engines[selectedEngine].find(
        (cluster: DatabaseClusterSizeObject) =>
          selectedTab === 1 && database.cluster_size === 2
            ? cluster.quantity === 3
            : cluster.quantity === clusterSize
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
  }, [database.cluster_size, dbTypes, selectedEngine, selectedTab]);

  const currentPlan = displayTypes?.find((type) => type.id === database.type);

  React.useEffect(() => {
    const initialTab = determineInitialPlanCategoryTab(
      displayTypes,
      database.type,
      currentPlan?.heading
    );
    setSelectedTab(initialTab);
  }, []);

  const disabledPlans = isSmallerOrEqualCurrentPlan(
    currentPlan?.id,
    database?.used_disk_size_gb,
    displayTypes,
    isNewDatabaseGA
  );
  const isDisabledSharedTab = database.cluster_size === 2;

  const shouldSubmitBeDisabled = React.useMemo(() => {
    return !summaryText;
  }, [summaryText]);

  const handleNodeChange = (size: ClusterSize | undefined): void => {
    const selectedPlanTab = determineInitialPlanCategoryTab(
      displayTypes,
      selectedPlanId
    );
    // If 2 Nodes is selected for an incompatible plan, clear selected plan and related information
    if (size === 2 && selectedPlanTab !== 0) {
      setSelectedPlanId(undefined);
    }
    setClusterSize(size);
  };

  const handleTabChange = (index: number) => {
    if (selectedTab === index) {
      return;
    }

    const initialTab = determineInitialPlanCategoryTab(
      displayTypes,
      database.type,
      currentPlan?.heading
    );

    if (isNewDatabaseGA) {
      if (initialTab === index) {
        setSelectedPlanId(database.type);
        setClusterSize(database.cluster_size);
      } else {
        setClusterSize(3);
        setSelectedPlanId(undefined);
      }
    }
    setSelectedTab(index);
  };

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
          disabledTabs={
            !isNewDatabaseGA && isDisabledSharedTab ? ['shared'] : []
          }
          handleTabChange={handleTabChange}
          header="Choose a Plan"
          isLegacyDatabase={!isNewDatabaseGA}
          onSelect={(selected: string) => setSelectedPlanId(selected)}
          selectedId={selectedPlanId}
          tabDisabledMessage="Resizing a 2-node cluster is only allowed with Dedicated plans."
          types={displayTypes}
        />
        {isNewDatabaseGA && (
          <>
            <Divider spacingBottom={20} spacingTop={20} />
            <DatabaseNodeSelector
              currentClusterSize={database.cluster_size}
              currentPlan={currentPlan}
              displayTypes={displayTypes}
              handleNodeChange={(size: ClusterSize) => {
                handleNodeChange(size);
              }}
              selectedClusterSize={clusterSize}
              selectedEngine={selectedEngine}
              selectedPlan={displayTypes?.find(
                (type) => type.id === selectedPlanId
              )}
              selectedTab={selectedTab}
            />
          </>
        )}
      </Paper>
      <Paper sx={{ marginTop: 2 }}>
        <DatabaseSummarySection
          currentClusterSize={database.cluster_size}
          currentEngine={selectedEngine}
          currentPlan={currentPlan}
          isResize={true}
          label={database.label}
          platform={database.platform}
          resizeData={summaryText}
        />
      </Paper>
      <StyledGrid>
        <StyledResizeButton
          buttonType="primary"
          disabled={shouldSubmitBeDisabled || disabled}
          onClick={() => {
            setIsResizeConfirmationDialogOpen(true);
          }}
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
