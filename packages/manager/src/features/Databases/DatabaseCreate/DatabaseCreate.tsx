import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { formatStorageUnits } from '@akamai/compute-ui-core/api';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  useCreateDatabaseMutation,
  useDatabaseEnginesQuery,
  useDatabaseTypesQuery,
  useRegionAvailabilityQuery,
  useRegionsQuery,
} from '@linode/queries';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { getDynamicDatabaseSchema } from '@linode/validation/lib/databases.schema';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { LandingHeader } from 'src/components/LandingHeader';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  getIsLimitedAvailability,
  useShouldDisablePremiumPlansTab,
} from 'src/features/components/PlansPanel/utils';
import { DatabaseClusterData } from 'src/features/Databases/DatabaseCreate/DatabaseClusterData';
import {
  StyledCreateBtn,
  StyledPlansPanel,
  StyledTypography,
} from 'src/features/Databases/DatabaseCreate/DatabaseCreate.style';
import { DatabaseNodeSelector } from 'src/features/Databases/DatabaseCreate/DatabaseNodeSelector';
import { DatabaseSummarySection } from 'src/features/Databases/DatabaseCreate/DatabaseSummarySection';
import { DatabaseLogo } from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { PREMIUM_CPU_PLANS_RENAME } from '../constants';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { CircleProgress } from '../shared/CircleProgress/CircleProgress';
import { Divider } from '../shared/Divider/Divider';
import { ErrorState } from '../shared/ErrorState/ErrorState';
import { Paper } from '../shared/Paper/Paper';
import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import { DatabaseCreateNetworkingConfiguration } from './DatabaseCreateNetworkingConfiguration';

import type { AccessProps } from './DatabaseCreateAccessControls';
import type { ExtendedIP } from '@akamai/compute-ui-core/api';
import type {
  ClusterSize,
  CreateDatabasePayload,
  Engine,
  PrivateNetwork,
  VPC,
} from '@linode/api-v4/lib/databases/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

export interface DatabaseCreateValues {
  allow_list: ExtendedIP[];
  cluster_size: ClusterSize;
  engine: Engine;
  label: string;
  private_network?: null | PrivateNetwork;
  region: string;
  type: string;
}

export const DatabaseCreate = () => {
  const navigate = useNavigate();
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const {
    data: regionsData,
    error: regionsError,
    isLoading: regionsLoading,
  } = useRegionsQuery();

  const { error: enginesError, isLoading: enginesLoading } =
    useDatabaseEnginesQuery(true);

  const {
    data: dbtypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery({
    platform: 'rdbms-default',
  });

  const isSMDown = useBreakpoint('down', 'sm');
  const flags = useFlags();
  const isVPCEnabled = flags.databaseVpc;

  const formRef = React.useRef<HTMLFormElement>(null);
  const { mutateAsync: createDatabase } = useCreateDatabaseMutation();

  const [ipErrorsFromAPI, setIPErrorsFromAPI] = React.useState<APIError[]>();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedVPC, setSelectedVPC] = React.useState<null | VPC>(null);
  const isVPCSelected = Boolean(selectedVPC);

  const initialValues: DatabaseCreateValues = {
    allow_list: [
      {
        address: '',
        error: '',
      },
    ],
    cluster_size: 3,
    engine: 'mysql/8.4' as Engine,
    label: '',
    region: '',
    type: '',
    private_network: {
      vpc_id: null,
      subnet_id: null,
      public_access: false,
    },
  };

  const form = useForm<DatabaseCreateValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    // @ts-expect-error allow_list gets transformed to an array of strings in the onSubmit function
    resolver: yupResolver(getDynamicDatabaseSchema(isVPCSelected)),
  });

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    setError,
    setValue,
    watch,
  } = form;

  const [allowList, clusterSize, region, type, engine] = watch([
    'allow_list',
    'cluster_size',
    'region',
    'type',
    'engine',
  ]);

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    region || '',
    Boolean(flags.soldOutChips) && Boolean(region)
  );

  const selectedEngine = engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionWithDatabaseType[] = React.useMemo(() => {
    if (!dbtypes) {
      return [];
    }
    // Only display plans that support the selected engine
    const _dbtypes = dbtypes.filter((type) =>
      Boolean(type.engines[selectedEngine])
    );

    return _dbtypes.map((type) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);
      const singleNodePricing = type.engines[selectedEngine]?.find(
        (cluster) => cluster.quantity === 1
      );
      const price = singleNodePricing?.price ?? {
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
      ] as [string, string];
      return {
        ...type,
        formattedLabel,
        heading: formattedLabel,
        price,
        subHeadings,
      };
    });
  }, [dbtypes, selectedEngine]);

  const selectedPlan = React.useMemo(() => {
    return displayTypes?.find((displayType) => displayType.id === type);
  }, [displayTypes, type]);

  if (flags.databasePremium && selectedPlan) {
    const isLimitedAvailability = getIsLimitedAvailability({
      plan: selectedPlan,
      regionAvailabilities,
      selectedRegionId: region,
    });

    if (isLimitedAvailability) {
      setValue('type', '');
    }
  }

  const accessControlsConfiguration: AccessProps = {
    disabled: isRestricted,
    errors: ipErrorsFromAPI,
    variant: isVPCEnabled ? 'networking' : 'standard',
  };

  const handleTabChange = (index: number) => {
    // Return early to preserve current selections when selecting the same tab
    if (selectedTab === index) {
      return;
    }
    setSelectedTab(index);
    setValue('type', '');
    setValue('cluster_size', 3);
  };

  const onSubmit = async (values: DatabaseCreateValues) => {
    if (allowList.some((ip) => ip.error)) {
      return;
    }

    const _allowList = allowList.reduce((accum, ip) => {
      if (ip.address !== '') {
        return [...accum, ip.address];
      }
      return accum;
    }, []);

    const hasVpc =
      values.private_network &&
      values.private_network.vpc_id &&
      values.private_network.subnet_id;

    const createPayload: CreateDatabasePayload = {
      ...values,
      allow_list: _allowList,
      private_network: hasVpc ? values.private_network : null,
    };

    // TODO (UIE-8831): Remove post VPC release, since it will always be in create payload
    if (!isVPCEnabled) {
      setValue('private_network', undefined);
    }

    try {
      const response = await createDatabase(createPayload);
      navigate({
        to: `/databases/$engine/$databaseId`,
        params: {
          engine: response.engine,
          databaseId: response.id,
        },
      });
    } catch (errors) {
      const ipErrors = errors.filter(
        (error: APIError) => error.field === 'allow_list'
      );
      if (ipErrors) {
        setIPErrorsFromAPI(ipErrors);
      }

      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const shouldDisablePremiumPlansTab = useShouldDisablePremiumPlansTab({
    types: dbtypes,
  });

  const disabledTabsConfig = React.useMemo(() => {
    if (shouldDisablePremiumPlansTab) {
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
      disabledTabs: [],
    };
  }, [shouldDisablePremiumPlansTab]);

  if (regionsLoading || !regionsData || enginesLoading || typesLoading) {
    return <CircleProgress />;
  }

  if (regionsError || enginesError || typesError) {
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Create a Database" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Database Clusters',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        title="Create"
      />
      <FormProvider {...form}>
        <form
          data-testid="db-create-form"
          onSubmit={handleSubmit(onSubmit, () =>
            scrollErrorIntoViewV2(formRef)
          )}
          ref={formRef}
        >
          {isRestricted && (
            <NotificationBanner
              style={{ marginTop: Spacing.S16, marginBottom: Spacing.S16 }}
              text={getRestrictedResourceText({
                action: 'create',
                resourceType: 'Databases',
              })}
              type="error"
            />
          )}
          <Paper>
            {errors.root?.message && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S16 }}
                type="error"
              >
                <ErrorMessage
                  entity={{ type: 'database_id' }}
                  message={errors.root.message}
                />
              </NotificationBanner>
            )}
            <DatabaseClusterData selectedPlan={selectedPlan} />
            <Divider marginBottom={Spacing.S12} marginTop={Spacing.S32} />
            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <StyledPlansPanel
                  data-qa-select-plan
                  disabled={isRestricted}
                  disabledTabs={disabledTabsConfig.disabledTabs}
                  error={fieldState.error?.message}
                  flow="database"
                  handleTabChange={handleTabChange}
                  header="Choose a Plan"
                  isCreate
                  onSelect={field.onChange}
                  regionsData={regionsData}
                  selectedId={field.value}
                  selectedRegionID={region}
                  types={displayTypes}
                />
              )}
            />
            <Divider marginBottom={Spacing.S12} marginTop={Spacing.S24} />
            <Controller
              control={control}
              name="cluster_size"
              render={({ field, fieldState }) => (
                <DatabaseNodeSelector
                  displayTypes={displayTypes}
                  error={fieldState.error?.message}
                  handleNodeChange={field.onChange}
                  selectedClusterSize={field.value}
                  selectedEngine={selectedEngine}
                  selectedPlan={selectedPlan}
                  selectedTab={selectedTab}
                />
              )}
            />
            <Divider marginBottom={Spacing.S12} marginTop={Spacing.S24} />
            {isVPCEnabled ? (
              <DatabaseCreateNetworkingConfiguration
                accessControlsConfiguration={accessControlsConfiguration}
                onChange={setSelectedVPC}
              />
            ) : (
              <DatabaseCreateAccessControls {...accessControlsConfiguration} />
            )}
          </Paper>
          <Paper marginTop={Spacing.S24}>
            <DatabaseSummarySection
              currentClusterSize={clusterSize}
              currentEngine={selectedEngine}
              currentPlan={selectedPlan}
              mode="create"
              selectedVPC={selectedVPC}
            />
          </Paper>
          <div
            style={{
              alignItems: isSMDown ? 'flex-end' : 'center',
              display: 'flex',
              flexDirection: isSMDown ? 'column' : 'row',
              justifyContent: 'flex-end',
              marginTop: isSMDown ? Spacing.S8 : Spacing.S16,
            }}
          >
            <StyledTypography>
              Database nodes take approximately 15-30 minutes to provision.
            </StyledTypography>
            <StyledCreateBtn
              data-testid="create-database-cluster"
              disabled={isRestricted}
              processing={isSubmitting}
              type="submit"
              variant="primary"
            >
              Create Database Cluster
            </StyledCreateBtn>
          </div>
          <DatabaseLogo />
        </form>
      </FormProvider>
    </>
  );
};
