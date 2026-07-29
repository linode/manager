import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormField,
  Modal,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { formatStorageUnits } from '@akamai/compute-ui-core/api';
import {
  useDatabaseMutation,
  useDatabaseTypesQuery,
  usePreferences,
  useRegionAvailabilityQuery,
  useRegionsQuery,
} from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import {
  determineInitialPlanCategoryTab,
  getIsLimitedAvailability,
} from 'src/features/components/PlansPanel/utils';
import { DatabaseNodeSelector } from 'src/features/Databases/DatabaseCreate/DatabaseNodeSelector';
import { DatabaseSummarySection } from 'src/features/Databases/DatabaseCreate/DatabaseSummarySection';
import { DatabaseResizeCurrentConfiguration } from 'src/features/Databases/DatabaseDetail/DatabaseResize/DatabaseResizeCurrentConfiguration';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useFlags } from 'src/hooks/useFlags';
import { useIsGenerationalPlansEnabled } from 'src/utilities/linodes';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';

import {
  PREMIUM_CPU_PLANS_RENAME,
  RESIZE_DISABLED_DEDICATED_SHARED_PLAN_TABS_TEXT,
  RESIZE_DISABLED_NON_G7_DEDICATED_SHARED_PLAN_TABS_TEXT,
  RESIZE_DISABLED_PREMIUM_PLAN_TAB_TEXT,
} from '../../constants';
import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { Divider } from '../../shared/Divider/Divider';
import { ErrorState } from '../../shared/ErrorState/ErrorState';
import { Paper } from '../../shared/Paper/Paper';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { StyledPlansPanel, StyledResizeButton } from './DatabaseResize.style';
import { isSmallerOrEqualCurrentPlan } from './DatabaseResize.utils';

import type {
  ClusterSize,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  DatabaseType,
  Engine,
  UpdateDatabasePayload,
} from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

export const DatabaseResize = () => {
  const { database, disabled } = useDatabaseDetailContext();
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = React.useState<
    string | undefined
  >(database.type);

  const [isResizeConfirmationDialogOpen, setIsResizeConfirmationDialogOpen] =
    React.useState(false);

  const [selectedTab, setSelectedTab] = React.useState(0);
  const flags = useFlags();

  const [clusterSize, setClusterSize] = React.useState<ClusterSize | undefined>(
    database.cluster_size
  );

  const [clusterName, setClusterName] = React.useState('');

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const isTypeToConfirmEnabled =
    typeToConfirmPreference === true || typeToConfirmPreference == null
      ? true
      : false;

  const {
    error: resizeError,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
    reset: resetMutation,
  } = useDatabaseMutation(database.engine, database.id);

  const {
    data: dbTypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery({ platform: database.platform });

  const {
    formatPrice: formatSelectedPlanPrice,
    priceLabel: selectedPlanPriceLabel,
  } = useComputePricing(selectedPlanId);

  const shouldProvideRegions = flags.databasePremium;

  // When databasePremium flag is enabled for a new database cluster, provide the database region ID to perform queries and enable additional behavior for the PlansPanel
  const databaseRegion = shouldProvideRegions ? database.region : '';

  const {
    data: regionsData,
    error: regionsError,
    isLoading: regionsLoading,
  } = useRegionsQuery();

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    databaseRegion,
    Boolean(flags.soldOutChips && flags.databasePremium && databaseRegion)
  );

  const currentPlanType = dbTypes?.find(
    (type: DatabaseType) => type.id === database.type
  );

  const { isGenerationalPlansEnabled } = useIsGenerationalPlansEnabled(
    dbTypes,
    currentPlanType?.class
  );

  const disabledTabsConfig = React.useMemo(() => {
    if (
      !flags.databaseRestrictPlanResize ||
      (flags.databaseResizeGenerationalPlans &&
        currentPlanType?.class === 'premium')
    ) {
      return {
        disabledTabs: [],
      };
    }

    if (!isGenerationalPlansEnabled && currentPlanType?.class === 'premium') {
      return {
        disabledTabs: [
          {
            tab: 'shared',
            copy: RESIZE_DISABLED_DEDICATED_SHARED_PLAN_TABS_TEXT,
          },
          {
            tab: 'dedicated',
            copy: RESIZE_DISABLED_DEDICATED_SHARED_PLAN_TABS_TEXT,
          },
        ],
      };
    }

    if (isGenerationalPlansEnabled && currentPlanType?.class === 'premium') {
      return {
        disabledTabs: [
          {
            tab: 'shared',
            copy: RESIZE_DISABLED_NON_G7_DEDICATED_SHARED_PLAN_TABS_TEXT,
          },
        ],
      };
    }

    if (
      isGenerationalPlansEnabled &&
      flags.databaseResizeGenerationalPlans &&
      currentPlanType?.class !== 'premium'
    ) {
      return {
        disabledTabs: [
          {
            tab: 'premium',
            copy: PREMIUM_CPU_PLANS_RENAME,
          },
        ],
      };
    }

    return {
      disabledTabs: [
        {
          tab: 'premium',
          copy: RESIZE_DISABLED_PREMIUM_PLAN_TAB_TEXT,
        },
      ],
    };
  }, [
    currentPlanType?.class,
    flags.databaseResizeGenerationalPlans,
    flags.databaseRestrictPlanResize,
    isGenerationalPlansEnabled,
  ]);

  const onResize = () => {
    const payload: UpdateDatabasePayload = {};

    if (clusterSize) {
      payload.cluster_size = clusterSize;
    }

    if (selectedPlanId) {
      payload.type = selectedPlanId;
    }

    updateDatabase(payload).then(() => {
      toast.open({
        text: `Database cluster ${database.label} is being resized.`,
        type: 'info',
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
      <h3 style={{ marginTop: Spacing.S4, marginBottom: 0 }}>
        Resize a Database Cluster
      </h3>
      <p style={{ marginTop: Spacing.S4 }}>
        Adapt the cluster to your needs by resizing it to a smaller or larger
        plan.
      </p>
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

    const price = selectedPlanType.engines[selectedEngine]?.find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === clusterSize
    )?.price as DatabasePriceObject;
    const resizeBasePrice = selectedPlanType.engines[selectedEngine]?.[0]
      .price as DatabasePriceObject;
    const baseNodePrice = `$${formatSelectedPlanPrice(resizeBasePrice)}/${selectedPlanPriceLabel}`;
    const selectedNodePrice = `$${formatSelectedPlanPrice(price)}/${selectedPlanPriceLabel}`;

    return {
      basePrice: baseNodePrice,
      numberOfNodes: clusterSize,
      plan: formatStorageUnits(selectedPlanType.label),
      price: selectedNodePrice,
    };
  }, [selectedPlanId, clusterSize, selectedTab]);

  const costSummary = (
    <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
      {`The cost of the resized database is ${summaryText?.price}.`}
    </h3>
  );

  const confirmationPopUpMessage =
    database.cluster_size === 1 ? (
      <>
        {costSummary}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <h3 style={{ margin: 0 }}>
            Warning: This operation will cause downtime for your resized node
            cluster.
          </h3>
        </NotificationBanner>
      </>
    ) : (
      <>
        {costSummary}
        <NotificationBanner style={{ marginBottom: Spacing.S16 }} type="info">
          <h3 style={{ margin: 0 }}>
            Operation can take up to 2 hours and will incur a failover.
          </h3>
        </NotificationBanner>
      </>
    );

  const currentPlanUnavailableNotice = (
    <NotificationBanner style={{ marginBottom: Spacing.S16 }} type="warning">
      Warning: Your current plan is currently unavailable and it can’t be used
      to resize the cluster. You can only resize the cluster using other
      available plans.
    </NotificationBanner>
  );

  const displayTypes: PlanSelectionWithDatabaseType[] = React.useMemo(() => {
    if (!dbTypes) {
      return [];
    }

    const _dbtypes = dbTypes.filter((type) =>
      Boolean(type.engines[selectedEngine])
    );

    return _dbtypes.map((type: DatabaseType) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);

      const nodePricing = type.engines[selectedEngine]?.find(
        (cluster: DatabaseClusterSizeObject) =>
          selectedTab === 1 && database.cluster_size === 2
            ? cluster.quantity === 3
            : cluster.quantity === clusterSize
      );

      const price = nodePricing?.price ?? {
        hourly: 0,
        monthly: null,
      };
      const subHeadings = [
        `$${price.monthly}/mo ($${price.hourly}/hr)`,
        typeLabelDetails(
          type.memory,
          type.disk,
          type.vcpus,
          selectedEngine === 'valkey'
        ),
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

  const isCurrentPlanUnavailable = currentPlan
    ? getIsLimitedAvailability({
        plan: currentPlan,
        regionAvailabilities: regionAvailabilities ?? [],
        selectedRegionId: databaseRegion,
      })
    : false;

  React.useEffect(() => {
    const initialTab = determineInitialPlanCategoryTab(
      displayTypes,
      database.type,
      currentPlan?.heading
    );
    setSelectedTab(initialTab);
  }, []);

  const disabledPlansDueToDiskSize = isSmallerOrEqualCurrentPlan(
    currentPlan?.id,
    database?.used_disk_size_gb,
    displayTypes
  );

  // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
  const isCurrentPlanAPremiumPlan =
    currentPlan?.class.includes('premium') ||
    currentPlan?.id.includes('g7-dedicated');

  const disabledResizeToPremiumPlans =
    !flags.databaseResizeGenerationalPlans && !isCurrentPlanAPremiumPlan
      ? displayTypes.filter(
          (type) =>
            type.class.includes('premium') || type.id.includes('g7-dedicated')
        )
      : [];

  const disabledResizeFromPremiumPlans =
    !flags.databaseResizeGenerationalPlans && isCurrentPlanAPremiumPlan
      ? displayTypes.filter(
          (type) =>
            !type.class.includes('premium') && !type.id.includes('g7-dedicated')
        )
      : [];

  const shouldSubmitBeDisabled = React.useMemo(() => {
    return !summaryText;
  }, [summaryText]);

  const handleNodeChange = (size: ClusterSize | undefined): void => {
    const selectedPlanTab = determineInitialPlanCategoryTab(
      displayTypes,
      selectedPlanId
    );
    // The 2 node selection is not available for Shared plans
    // If 2 Nodes is selected for an incompatible plan, clear selected plan and related information
    const isSharedPlan = selectedPlanTab === 1;
    const hasInvalidSelection = size === 2 && isSharedPlan;
    if (hasInvalidSelection) {
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

    if (initialTab === index) {
      setSelectedPlanId(database.type);
      setClusterSize(database.cluster_size);
    } else {
      setClusterSize(3);
      setSelectedPlanId(undefined);
    }
    setSelectedTab(index);
  };

  const handleOnClose = () => {
    setIsResizeConfirmationDialogOpen(false);
    setClusterName('');
    resetMutation?.();
  };

  if (typesLoading || regionsLoading) {
    return <CircleProgress />;
  }

  if (typesError || regionsError) {
    return <ErrorState />;
  }

  return (
    <>
      <Paper>
        {resizeDescription}
        <div style={{ marginTop: Spacing.S16 }}>
          <DatabaseResizeCurrentConfiguration database={database} />
        </div>
      </Paper>
      <Paper marginTop={Spacing.S16}>
        <StyledPlansPanel
          additionalBanners={
            isCurrentPlanUnavailable && Boolean(flags.databasePremium)
              ? [currentPlanUnavailableNotice]
              : []
          }
          currentPlanHeading={currentPlan?.heading}
          data-qa-select-plan
          disabled={disabled}
          // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
          disabledResizeFromPremiumPlans={disabledResizeFromPremiumPlans}
          disabledResizeToPremiumPlans={disabledResizeToPremiumPlans}
          disabledSmallerPlans={disabledPlansDueToDiskSize}
          disabledTabs={disabledTabsConfig.disabledTabs}
          flow="database"
          handleTabChange={handleTabChange}
          header="Choose a Plan"
          isResize
          onSelect={(selected: string) => setSelectedPlanId(selected)}
          regionsData={shouldProvideRegions ? regionsData : undefined}
          selectedId={selectedPlanId}
          selectedRegionID={databaseRegion}
          types={displayTypes}
        />
        <Divider marginBottom={Spacing.S20} marginTop={Spacing.S20} />
        <DatabaseNodeSelector
          currentClusterSize={database.cluster_size}
          currentPlan={currentPlan}
          disabled={
            isCurrentPlanUnavailable && currentPlan?.id === selectedPlanId
          }
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
      </Paper>
      <Paper marginTop={Spacing.S16}>
        <DatabaseSummarySection
          currentClusterSize={database.cluster_size}
          currentEngine={selectedEngine}
          currentPlan={currentPlan}
          label={database.label}
          mode="resize"
          platform={database.platform}
          resizeData={summaryText}
        />
      </Paper>
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}
      >
        <StyledResizeButton
          data-testid="resize-database-button"
          disabled={shouldSubmitBeDisabled || disabled}
          onClick={() => {
            setIsResizeConfirmationDialogOpen(true);
          }}
          type="submit"
          variant="primary"
        >
          Resize Database Cluster
        </StyledResizeButton>
      </div>
      <Modal
        closeModal={handleOnClose}
        open={isResizeConfirmationDialogOpen}
        size="medium"
      >
        <span slot="title">Resize Database Cluster {database.label}?</span>
        <div slot="body">
          {resizeError ? (
            <NotificationBanner
              style={{ marginBottom: Spacing.S16 }}
              text={resizeError[0].reason}
              type="error"
            />
          ) : null}
          <p>{confirmationPopUpMessage}</p>
          {isTypeToConfirmEnabled ? (
            <>
              <p>
                To confirm resizing, type the name of the Database Cluster{' '}
                <strong>({database.label})</strong> in the field below:
              </p>
              <FormField>
                <label
                  htmlFor="clusterName" // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
                  style={{ fontWeight: 700, marginBottom: Spacing.S8 }}
                >
                  Cluster Name
                </label>
                <TextField
                  id="clusterName"
                  onChange={(e) =>
                    setClusterName(e.detail as unknown as string)
                  }
                  placeholder=""
                  value={clusterName}
                />
              </FormField>
              <p style={{ margin: 0 }}>
                To disable type-to-confirm, go to the Type-to-Confirm section of{' '}
                <a href="/profile/preferences">Preferences</a>.
              </p>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              To enable type-to-confirm, go to the Type-to-Confirm section of{' '}
              <a href="/profile/preferences">Preferences</a>.
            </p>
          )}
        </div>
        <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={handleOnClose} variant="link">
            Cancel
          </Button>
          <Button
            disabled={
              isTypeToConfirmEnabled ? clusterName !== database.label : false
            }
            onClick={onResize}
            processing={submitInProgress}
            variant="primary"
          >
            Resize Cluster
          </Button>
        </div>
      </Modal>
    </>
  );
};
