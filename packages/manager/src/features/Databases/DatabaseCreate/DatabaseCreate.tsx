import { BetaChip, Divider, Paper } from '@linode/ui';
import { createDatabaseSchema } from '@linode/validation/lib/databases.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { DatabaseClusterData } from 'src/features/Databases/DatabaseCreate/DatabaseClusterData';
import {
  StyledBtnCtn,
  StyledCreateBtn,
  StyledPlansPanel,
  StyledTypography,
} from 'src/features/Databases/DatabaseCreate/DatabaseCreate.style';
import { DatabaseNodeSelector } from 'src/features/Databases/DatabaseCreate/DatabaseNodeSelector';
import { DatabaseSummarySection } from 'src/features/Databases/DatabaseCreate/DatabaseSummarySection';
import { DatabaseLogo } from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useCreateDatabaseMutation,
  useDatabaseEnginesQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases/databases';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { validateIPs } from 'src/utilities/ipUtils';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import {
  determineReplicationCommitType,
  determineReplicationType,
} from './utilities';

import type {
  ClusterSize,
  ComprehensiveReplicationType,
  CreateDatabasePayload,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';
import type { DatabaseCreateValues } from 'src/features/Databases/DatabaseCreate/DatabaseClusterData';
import type { ExtendedIP } from 'src/utilities/ipUtils';

const DatabaseCreate = () => {
  const history = useHistory();
  const {
    isDatabasesV2Beta,
    isDatabasesV2Enabled,
    isDatabasesV2GA,
  } = useIsDatabasesEnabled();
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const {
    data: regionsData,
    error: regionsError,
    isLoading: regionsLoading,
  } = useRegionsQuery();

  const {
    data: engines,
    error: enginesError,
    isLoading: enginesLoading,
  } = useDatabaseEnginesQuery(true);

  const {
    data: dbtypes,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery({
    platform: isDatabasesV2Enabled ? 'rdbms-default' : 'rdbms-legacy',
  });

  const formRef = React.useRef<HTMLFormElement>(null);
  const { mutateAsync: createDatabase } = useCreateDatabaseMutation();

  const [createError, setCreateError] = React.useState<string>();
  const [ipErrorsFromAPI, setIPErrorsFromAPI] = React.useState<APIError[]>();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleIPBlur = (ips: ExtendedIP[]) => {
    const ipsWithMasks = enforceIPMasks(ips);
    setFieldValue('allow_list', ipsWithMasks);
  };

  const handleIPValidation = () => {
    const validatedIps = validateIPs(values.allow_list, {
      allowEmptyAddress: true,
      errorMessage: 'Must be a valid IPv4 address',
    });

    if (validatedIps.some((ip) => ip.error)) {
      setFieldValue('allow_list', validatedIps);
    } else {
      setFieldValue(
        'allow_list',
        validatedIps.map((ip) => {
          delete ip.error;
          return {
            ...ip,
          };
        })
      );
    }
  };

  const submitForm = async () => {
    if (values.allow_list.some((ip) => ip.error)) {
      return;
    }

    setCreateError(undefined);
    setSubmitting(true);

    const _allow_list = values.allow_list.reduce((accum, ip) => {
      if (ip.address !== '') {
        return [...accum, ip.address];
      }
      return accum;
    }, []);

    const createPayload: CreateDatabasePayload = {
      ...values,
      allow_list: _allow_list,
    };
    try {
      const response = await createDatabase(createPayload);
      history.push(`/databases/${response.engine}/${response.id}`);
    } catch (errors) {
      const ipErrors = errors.filter(
        (error: APIError) => error.field === 'allow_list'
      );
      if (ipErrors) {
        setIPErrorsFromAPI(ipErrors);
      }
      handleAPIErrors(errors, setFieldError, setCreateError);
    }

    setSubmitting(false);
  };

  const initialValues: DatabaseCreateValues = {
    allow_list: [
      {
        address: '',
        error: '',
      },
    ],
    cluster_size: -1 as ClusterSize,
    engine: 'mysql' as Engine,
    label: '',
    region: '',
    type: '',
  };

  if (!isDatabasesV2Enabled) {
    // TODO (UIE-8214) remove POST GA
    initialValues.replication_commit_type = undefined; // specific to Postgres
    initialValues.replication_type = 'none' as ComprehensiveReplicationType;
    initialValues.ssl_connection = true;
  }

  const {
    errors,
    handleSubmit,
    isSubmitting,
    setFieldError,
    setFieldValue,
    setSubmitting,
    values,
  } = useFormik({
    initialValues,
    onSubmit: submitForm,
    validate: () => {
      handleIPValidation();
      scrollErrorIntoViewV2(formRef);
    },
    validateOnChange: false,
    validationSchema: createDatabaseSchema,
  });

  React.useEffect(() => {
    if (setFieldValue) {
      setFieldValue(
        'cluster_size',
        values.cluster_size < 1 ? 3 : values.cluster_size
      );
      if (!isDatabasesV2Enabled) {
        // TODO (UIE-8214) remove POST GA
        setFieldValue(
          'replication_type',
          determineReplicationType(values.cluster_size, values.engine)
        );
        setFieldValue(
          'replication_commit_type',
          determineReplicationCommitType(values.engine)
        );
      }
    }
  }, [setFieldValue, values.cluster_size, values.engine, isDatabasesV2Enabled]);

  const selectedEngine = values.engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionWithDatabaseType[] = React.useMemo(() => {
    if (!dbtypes) {
      return [];
    }
    return dbtypes.map((type) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);
      const singleNodePricing = type.engines[selectedEngine]?.find(
        (cluster) => cluster.quantity === 1
      );
      const price = singleNodePricing?.price ?? {
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
  }, [dbtypes, selectedEngine]);

  const selectedPlan = React.useMemo(() => {
    return displayTypes?.find((type) => type.id === values.type);
  }, [displayTypes, values.type]);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    setFieldValue('type', undefined);
    setFieldValue('cluster_size', 3);
  };

  if (regionsLoading || !regionsData || enginesLoading || typesLoading) {
    return <CircleProgress />;
  }

  if (regionsError || typesError || enginesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  const handleNodeChange = (size: ClusterSize | undefined) => {
    setFieldValue('cluster_size', size);
    if (!isDatabasesV2Enabled) {
      // TODO (UIE-8214) remove POST GA
      setFieldValue('replication_type', size === 1 ? 'none' : 'semi_synch');
    }
  };
  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Database Clusters',
              position: 1,
            },
          ],
          labelOptions: {
            suffixComponent: isDatabasesV2Beta ? (
              <BetaChip
                component="span"
                sx={{ marginLeft: '6px', marginTop: '4px' }}
              />
            ) : null,
          },
          pathname: location.pathname,
        }}
        title="Create"
      />
      {isRestricted && (
        <Notice
          text={getRestrictedResourceText({
            action: 'create',
            resourceType: 'Databases',
          })}
          important
          spacingTop={16}
          variant="error"
        />
      )}
      <Paper>
        {createError && (
          <Notice variant="error">
            <ErrorMessage
              entity={{ type: 'database_id' }}
              message={createError}
            />
          </Notice>
        )}
        <DatabaseClusterData
          engines={engines}
          errors={errors}
          onChange={(field: string, value: any) => setFieldValue(field, value)}
          regionsData={regionsData}
          values={values}
        />
        <Divider spacingBottom={12} spacingTop={38} />
        <Grid>
          <StyledPlansPanel
            onSelect={(selected: string) => {
              setFieldValue('type', selected);
            }}
            data-qa-select-plan
            disabled={isRestricted}
            error={errors.type}
            handleTabChange={handleTabChange}
            header="Choose a Plan"
            isCreate
            regionsData={regionsData}
            selectedId={values.type}
            selectedRegionID={values.region}
            types={displayTypes}
          />
        </Grid>
        <Divider spacingBottom={12} spacingTop={26} />
        <Grid>
          <DatabaseNodeSelector
            handleNodeChange={(v: ClusterSize) => {
              handleNodeChange(v);
            }}
            displayTypes={displayTypes}
            error={errors.cluster_size}
            selectedClusterSize={values.cluster_size}
            selectedEngine={selectedEngine}
            selectedPlan={selectedPlan}
            selectedTab={selectedTab}
          />
        </Grid>
        <Divider spacingBottom={12} spacingTop={26} />
        <DatabaseCreateAccessControls
          disabled={isRestricted}
          errors={ipErrorsFromAPI}
          ips={values.allow_list}
          onBlur={handleIPBlur}
          onChange={(ips: ExtendedIP[]) => setFieldValue('allow_list', ips)}
        />
      </Paper>
      {isDatabasesV2GA && (
        <Paper sx={{ marginTop: 2 }}>
          <DatabaseSummarySection
            currentClusterSize={values.cluster_size}
            currentEngine={selectedEngine}
            currentPlan={selectedPlan}
          />
        </Paper>
      )}
      <StyledBtnCtn>
        <StyledTypography>
          Your database node(s) will take approximately 15-30 minutes to
          provision.
        </StyledTypography>
        <StyledCreateBtn
          buttonType="primary"
          disabled={isRestricted}
          loading={isSubmitting}
          type="submit"
        >
          Create Database Cluster
        </StyledCreateBtn>
      </StyledBtnCtn>
      {isDatabasesV2Enabled && <DatabaseLogo />}
    </form>
  );
};

export const databaseCreateLazyRoute = createLazyRoute('/databases/create')({
  component: DatabaseCreate,
});

export default DatabaseCreate;
