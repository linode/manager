import { useRegionsQuery } from '@linode/queries';
import { CircleProgress, Divider, ErrorState, Notice, Paper } from '@linode/ui';
import { formatStorageUnits, scrollErrorIntoViewV2 } from '@linode/utilities';
import { getDynamicDatabaseSchema } from '@linode/validation/lib/databases.schema';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { LandingHeader } from 'src/components/LandingHeader';
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
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useCreateDatabaseMutation,
  useDatabaseEnginesQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases/databases';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { validateIPs } from 'src/utilities/ipUtils';

import { ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT } from '../constants';
import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import { DatabaseCreateNetworkingConfiguration } from './DatabaseCreateNetworkingConfiguration';

import type { AccessProps } from './DatabaseCreateAccessControls';
import type {
  ClusterSize,
  CreateDatabasePayload,
  Engine,
  VPC,
} from '@linode/api-v4/lib/databases/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';
import type { DatabaseCreateValues } from 'src/features/Databases/DatabaseCreate/DatabaseClusterData';
import type { ExtendedIP } from 'src/utilities/ipUtils';

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
    platform: 'rdbms-default',
  });

  const flags = useFlags();
  const isVPCEnabled = flags.databaseVpc;

  const formRef = React.useRef<HTMLFormElement>(null);
  const { mutateAsync: createDatabase } = useCreateDatabaseMutation();

  const [createError, setCreateError] = React.useState<string>();
  const [ipErrorsFromAPI, setIPErrorsFromAPI] = React.useState<APIError[]>();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedVPC, setSelectedVPC] = React.useState<null | VPC>(null);
  const isVPCSelected = Boolean(selectedVPC);

  const handleIPBlur = (ips: ExtendedIP[]) => {
    const ipsWithMasks = enforceIPMasks(ips);
    setFieldValue('allow_list', ipsWithMasks);
  };

  const handleIPValidation = () => {
    const validatedIps = validateIPs(values.allow_list, {
      allowEmptyAddress: true,
      errorMessage: ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
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
    const hasVpc =
      values.private_network.vpc_id && values.private_network.subnet_id;
    const privateNetwork = hasVpc ? values.private_network : null;

    const createPayload: CreateDatabasePayload = {
      ...values,
      allow_list: _allow_list,
      private_network: privateNetwork,
    };

    // TODO (UIE-8831): Remove post VPC release, since it will always be in create payload
    if (!isVPCEnabled) {
      delete createPayload.private_network;
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
    engine: 'mysql/8' as Engine,
    label: '',
    region: '',
    type: '',
    private_network: {
      vpc_id: null,
      subnet_id: null,
      public_access: false,
    },
  };

  const {
    errors,
    handleSubmit,
    isSubmitting,
    resetForm,
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
    validationSchema: getDynamicDatabaseSchema(isVPCSelected),
  });

  React.useEffect(() => {
    if (setFieldValue) {
      setFieldValue(
        'cluster_size',
        values.cluster_size < 1 ? 3 : values.cluster_size
      );
    }
  }, [setFieldValue, values.cluster_size, values.engine]);

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

  const accessControlsConfiguration: AccessProps = {
    disabled: isRestricted,
    errors: ipErrorsFromAPI,
    ips: values.allow_list,
    onBlur: handleIPBlur,
    onChange: (ips: ExtendedIP[]) => setFieldValue('allow_list', ips),
    variant: isVPCEnabled ? 'networking' : 'standard',
  };

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
  };

  const handleNetworkingConfigurationChange = (vpc: null | VPC) => {
    setSelectedVPC(vpc);
  };

  const handleResetForm = (partialValues?: Partial<DatabaseCreateValues>) => {
    if (partialValues) {
      resetForm({
        values: {
          ...values,
          ...partialValues,
        },
      });
    } else {
      resetForm();
    }
  };

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
      <form data-testid="db-create-form" onSubmit={handleSubmit} ref={formRef}>
        {isRestricted && (
          <Notice
            spacingTop={16}
            text={getRestrictedResourceText({
              action: 'create',
              resourceType: 'Databases',
            })}
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
            onChange={(field: string, value: any) =>
              setFieldValue(field, value)
            }
            regionsData={regionsData}
            values={values}
          />
          <Divider spacingBottom={12} spacingTop={38} />
          <Grid>
            <StyledPlansPanel
              data-qa-select-plan
              disabled={isRestricted}
              error={errors.type}
              handleTabChange={handleTabChange}
              header="Choose a Plan"
              isCreate
              onSelect={(selected: string) => {
                setFieldValue('type', selected);
              }}
              regionsData={regionsData}
              selectedId={values.type}
              selectedRegionID={values.region}
              types={displayTypes}
            />
          </Grid>
          <Divider spacingBottom={12} spacingTop={26} />
          <Grid>
            <DatabaseNodeSelector
              displayTypes={displayTypes}
              error={errors.cluster_size}
              handleNodeChange={(v: ClusterSize) => {
                handleNodeChange(v);
              }}
              selectedClusterSize={values.cluster_size}
              selectedEngine={selectedEngine}
              selectedPlan={selectedPlan}
              selectedTab={selectedTab}
            />
          </Grid>
          <Divider spacingBottom={12} spacingTop={26} />
          {isVPCEnabled ? (
            <DatabaseCreateNetworkingConfiguration
              accessControlsConfiguration={accessControlsConfiguration}
              errors={errors}
              onChange={(field: string, value: boolean | null | number) =>
                setFieldValue(field, value)
              }
              onNetworkingConfigurationChange={
                handleNetworkingConfigurationChange
              }
              privateNetworkValues={values.private_network}
              resetFormFields={handleResetForm}
              selectedRegionId={values.region}
            />
          ) : (
            <DatabaseCreateAccessControls {...accessControlsConfiguration} />
          )}
        </Paper>
        <Paper sx={{ marginTop: 3 }}>
          <DatabaseSummarySection
            currentClusterSize={values.cluster_size}
            currentEngine={selectedEngine}
            currentPlan={selectedPlan}
            mode="create"
            selectedVPC={selectedVPC}
          />
        </Paper>
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
        <DatabaseLogo />
      </form>
    </>
  );
};
