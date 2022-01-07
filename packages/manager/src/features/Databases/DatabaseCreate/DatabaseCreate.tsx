import {
  CreateDatabasePayload,
  DatabaseType,
  DatabaseVersion,
  Engine,
  FailoverCount,
  ReplicationType,
  ExtendedDatabaseType,
} from '@linode/api-v4/lib/databases/types';
import { createDatabaseSchema } from '@linode/validation/lib/databases.schema';
import { useFormik } from 'formik';
import { groupBy } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Divider from 'src/components/core/Divider';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import Typography from 'src/components/core/Typography';
import BreadCrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import RegionOption from 'src/components/EnhancedSelect/variants/RegionSelect/RegionOption';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { validateIPs } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import useFlags from 'src/hooks/useFlags';
import {
  useDatabaseVersionsQuery,
  useDatabaseTypesQuery,
  useCreateDatabaseMutation,
} from 'src/queries/databases';
import { useRegionsQuery } from 'src/queries/regions';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

const useStyles = makeStyles((theme: Theme) => ({
  formControlLabel: {
    marginBottom: theme.spacing(),
  },
  btnCtn: {
    display: 'flex',
    justifyContent: 'end',
    marginTop: theme.spacing(2),
  },
}));

const engineIcons = {
  mysql: () => <MySQLIcon width="32" height="24" />,
};

const getEngineOptions = (versions: DatabaseVersion[]) => {
  const groupedVersions = groupBy<DatabaseVersion>((version) => {
    if (version.engine.match(/mysql/i)) {
      return 'MySQL';
    }
    if (version.engine.match(/postgresql/i)) {
      return 'PostgreSQL';
    }
    if (version.engine.match(/mongodb/i)) {
      return 'MongoDB';
    }
    if (version.engine.match(/redis/i)) {
      return 'Redis';
    }
    return 'Other';
  }, versions);
  return ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Other'].reduce(
    (accum, thisGroup) => {
      if (
        !groupedVersions[thisGroup] ||
        groupedVersions[thisGroup].length === 0
      ) {
        return accum;
      }
      return [
        ...accum,
        {
          label: thisGroup,
          options: groupedVersions[thisGroup].map((version) => ({
            ...version,
            value: `${version.engine}/${version.version}`,
            flag: engineIcons[version.engine],
          })),
        },
      ];
    },
    []
  );
};

interface NodePricing {
  hourly: string;
  monthly: string;
}

const DatabaseCreate: React.FC<{}> = () => {
  const classes = useStyles();
  const history = useHistory();
  const flags = useFlags(); // @TODO: Remove when Database goes to GA

  const {
    data: regionsData,
    isLoading: regionsLoading,
    error: regionsError,
  } = useRegionsQuery();

  const {
    data: versions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useDatabaseVersionsQuery();

  const {
    data: dbtypes,
    isLoading: typesLoading,
    error: typesError,
  } = useDatabaseTypesQuery();

  const { mutateAsync: createDatabase } = useCreateDatabaseMutation();

  const [type, setType] = React.useState<DatabaseType | null>(null);
  const [multiNodePricing, setMultiNodePricing] = React.useState<NodePricing>({
    hourly: '0',
    monthly: '0',
  });

  const engineOptions = React.useMemo(() => {
    if (!versions) {
      return [];
    }
    return getEngineOptions(versions);
  }, [versions]);

  const displayTypes: ExtendedDatabaseType[] = React.useMemo(() => {
    if (!dbtypes) {
      return [];
    }
    return dbtypes.map((type) => {
      const {
        label,
        memory,
        vcpus,
        disk,
        price: { monthly, hourly },
      } = type;
      const formattedLabel = formatStorageUnits(label);
      return {
        ...type,
        label: formattedLabel,
        heading: formattedLabel,
        subHeadings: [
          `$${monthly}/mo ($${hourly}/hr)`,
          typeLabelDetails(memory, disk, vcpus),
        ] as [string, string],
      };
    });
  }, [dbtypes]);

  const submitForm = async () => {
    const validatedIps = validateIPs(values.allow_list, {
      errorMessage: 'Must be a valid IPv4 address',
    });

    if (validatedIps.some((ip) => ip.error)) {
      setFieldValue('allow_list', validatedIps);
      return;
    }

    setSubmitting(true);
    const createPayload: CreateDatabasePayload = {
      ...values,
      allow_list: validatedIps.map((ip) => ip.address),
    };
    console.log(createPayload)

    try {
      const response = await createDatabase(createPayload);
      history.push(`/databases/${response.id}`);
    } catch (error) {
      console.log(error)
    }

    setSubmitting(false);
  };

  const {
    values,
    errors,
    isSubmitting,
    handleSubmit,
    setFieldValue,
    setSubmitting,
  } = useFormik({
    initialValues: {
      label: '',
      engine: '' as Engine,
      region: '',
      type: '',
      failover_count: 0 as FailoverCount,
      replication_type: 'none' as ReplicationType,
      allow_list: [
        {
          address: '',
          error: '',
        },
      ],
    },
    validationSchema: createDatabaseSchema,
    validateOnChange: false,
    onSubmit: submitForm,
  });

  const disableCreateButton =
    !values.label ||
    !values.engine ||
    !values.region ||
    !values.type ||
    values.allow_list.some((item) => item.address === '');

  const nodeOptions = [
    {
      value: 0,
      label: (
        <Typography>
          1 Node
          <br />
          {`$${type?.price.monthly || 0}/month $${type?.price.hourly || 0}/hr`}
        </Typography>
      ),
    },
    {
      value: 2,
      label: (
        <Typography>
          3 Nodes - High Availability (recommended)
          <br />
          {`$${multiNodePricing.monthly}/month $${multiNodePricing.hourly}/hr`}
        </Typography>
      ),
    },
  ];

  React.useEffect(() => {
    if (values.type.length === 0 || !dbtypes) {
      return;
    }

    const type = dbtypes.find((type) => type.id === values.type);
    if (typeof type === 'undefined') {
      return;
    }

    setType(type);
    setMultiNodePricing({
      hourly: Number(
        type.price.hourly + type.addons.failover.price.hourly
      ).toFixed(2),
      monthly: Number(
        type.price.monthly + type.addons.failover.price.monthly
      ).toFixed(2),
    });
  }, [dbtypes, values.type]);

  if (!flags.databases) {
    return null;
  }

  if (regionsLoading || !regionsData || versionsLoading || typesLoading) {
    return <CircleProgress />;
  }

  if (regionsError || versionsError || typesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <BreadCrumb
        labelTitle="Create"
        pathname={location.pathname}
        crumbOverrides={[
          {
            position: 1,
            label: 'Database Clusters',
          },
        ]}
      />
      <Paper>
        <Grid item>
          <Typography variant="h2">Name Your Cluster</Typography>
          <TextField
            data-qa-label-input
            errorText={errors.label}
            label="Database Label"
            onChange={(e) => setFieldValue('label', e.target.value)}
            value={values.label}
          />
        </Grid>
        <Divider spacingTop={38} />
        <Grid item>
          <Typography variant="h2">Select Engine and Region</Typography>
          <Select
            label="Database Engine"
            value={getSelectedOptionFromGroupedOptions(
              values.engine,
              engineOptions
            )}
            errorText={errors.engine}
            options={engineOptions}
            components={{ Option: RegionOption, SingleValue }}
            placeholder={'Select a Database Engine'}
            onChange={(selected: Item<string>) => {
              setFieldValue('engine', selected.value);
            }}
            isClearable={false}
          />
        </Grid>
        <Grid item>
          <RegionSelect
            errorText={errors.region}
            handleSelection={(selected: string) =>
              setFieldValue('region', selected)
            }
            regions={regionsData}
            selectedID={values.region}
          />
        </Grid>
        <Divider spacingTop={38} />
        <Grid item>
          <SelectPlanPanel
            data-qa-select-plan
            error={errors.type}
            types={displayTypes}
            onSelect={(selected: string) => setFieldValue('type', selected)}
            selectedID={values.type}
            updateFor={[values.type, errors]}
            isCreate
          />
        </Grid>
        <Divider />
        <Grid item>
          <Typography variant="h2">Set Number of Nodes</Typography>
          <Typography>
            We recommend 3 nodes in a database cluster to avoid downtime during
            upgrades and maintenance.
          </Typography>
          <FormControl
            error={Boolean(errors.failover_count)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldValue('failover_count', +e.target.value);
              setFieldValue(
                'replication_type',
                +e.target.value === 0 ? 'none' : 'semi-synch'
              );
            }}
          >
            <RadioGroup
              style={{ marginBottom: 0 }}
              value={values.failover_count}
            >
              {nodeOptions.map((nodeOption) => (
                <FormControlLabel
                  key={nodeOption.value}
                  value={nodeOption.value}
                  label={nodeOption.label}
                  control={<Radio />}
                  data-qa-radio={nodeOption.label}
                  className={classes.formControlLabel}
                />
              ))}
            </RadioGroup>
            <FormHelperText>{errors.failover_count}</FormHelperText>
          </FormControl>
        </Grid>
        <Divider spacingTop={30} />
        <Grid item style={{ maxWidth: 450 }}>
          <Typography variant="h2">Add Access Controls</Typography>
          <MultipleIPInput
            title="Inbound Sources"
            placeholder="Add IP Address or range"
            ips={values.allow_list}
            onChange={(address) => setFieldValue('allow_list', address)}
          />
        </Grid>
      </Paper>
      <Grid className={classes.btnCtn}>
        <Button
          type="submit"
          buttonType="primary"
          disabled={false}
          loading={isSubmitting}
        >
          Create Database
        </Button>
      </Grid>
    </form>
  );
};

export default DatabaseCreate;
