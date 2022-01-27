import {
  CreateDatabasePayload,
  DatabaseType,
  DatabaseVersion,
  Engine,
  FailoverCount,
  ReplicationType,
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
import HelpIcon from 'src/components/HelpIcon';
import Link from 'src/components/Link';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { databaseEngineMap } from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import {
  useDatabaseVersionsQuery,
  useDatabaseTypesQuery,
  useCreateDatabaseMutation,
} from 'src/queries/databases';
import { useRegionsQuery } from 'src/queries/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { validateIPs } from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import Chip from 'src/components/core/Chip';
import { APIError } from '@linode/api-v4/lib/types';

const useStyles = makeStyles((theme: Theme) => ({
  formControlLabel: {
    marginBottom: theme.spacing(),
  },
  btnCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  selectPlanPanel: {
    padding: 0,
    margin: 0,
  },
  labelToolTipCtn: {
    '& strong': {
      padding: 8,
    },
    '& ul': {
      margin: '4px',
    },
  },
  nodeHelpIcon: {
    padding: '0px 0px 0px 2px',
    marginTop: '-2px',
  },
  createText: {
    [theme.breakpoints.down('xs')]: {
      padding: `0 ${theme.spacing()}px`,
    },
  },
  chip: {
    fontFamily: theme.font.bold,
    fontSize: '0.625rem',
    height: 16,
    marginTop: 4,
    marginLeft: theme.spacing(),
    letterSpacing: '.25px',
    textTransform: 'uppercase',
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      [theme.breakpoints.up('md')]: {
        minWidth: 350,
      },
    },
  },
}));

const engineIcons = {
  mysql: () => <MySQLIcon width="24" height="24" />,
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
          options: groupedVersions[thisGroup]
            .map((version) => ({
              ...version,
              label: `${databaseEngineMap[version.engine]} v${version.version}`,
              value: `${version.engine}/${version.version}`,
              flag: engineIcons[version.engine],
            }))
            .sort((a, b) => (a.version > b.version ? -1 : 1)),
        },
      ];
    },
    []
  );
};

export interface ExtendedDatabaseType extends DatabaseType {
  heading: string;
  subHeadings: [string, string];
}

interface NodePricing {
  hourly: string;
  monthly: string;
}

const DatabaseCreate: React.FC<{}> = () => {
  const classes = useStyles();
  const history = useHistory();

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

  const [type, setType] = React.useState<DatabaseType>();
  const [createError, setCreateError] = React.useState<string>();
  const [ipErrorsFromAPI, setIPErrorsFromAPI] = React.useState<APIError[]>();
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

  const handleIPValidation = () => {
    const validatedIps = validateIPs(values.allow_list, {
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
    const createPayload: CreateDatabasePayload = {
      ...values,
      allow_list: values.allow_list.map((ip) => ip.address),
      ssl_connection: true,
    };

    try {
      const response = await createDatabase(createPayload);
      history.push(`/databases/${response.id}`);
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

  const {
    values,
    errors,
    isSubmitting,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setSubmitting,
  } = useFormik({
    initialValues: {
      label: '',
      engine: '' as Engine,
      region: '',
      type: '',
      failover_count: -1 as FailoverCount,
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
    validate: handleIPValidation,
    onSubmit: submitForm,
  });

  React.useEffect(() => {
    if (errors || createError) {
      scrollErrorIntoView();
    }
  }, [errors, createError]);

  const labelToolTip = (
    <div className={classes.labelToolTipCtn}>
      <strong>Label must:</strong>
      <ul>
        <li>Begin with an alpha character</li>
        <li>Contain only alpha characters or single hyphens</li>
        <li>Be between 3 - 32 characters</li>
      </ul>
    </div>
  );

  const is1GbPlan = type?.class.includes('nanode');

  const nodeOptions = [
    {
      value: 0,
      label: (
        <Typography>
          1 Node {` `}
          {is1GbPlan ? (
            <HelpIcon
              className={classes.nodeHelpIcon}
              text="1 GB Linodes are only available for single-node database deployments."
              tooltipPosition="right"
            />
          ) : null}
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${type?.price.monthly || 0}/month $${
              type?.price.hourly.toFixed(2) || 0.0
            }/hr`}
          </span>
        </Typography>
      ),
      disabled: is1GbPlan,
    },
    {
      value: 2,
      label: (
        <Typography>
          3 Nodes - High Availability {!is1GbPlan && '(recommended)'}
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${multiNodePricing.monthly || 0}/month $${
              parseFloat(multiNodePricing.hourly).toFixed(2) || 0.0
            }/hr`}
          </span>
        </Typography>
      ),
      disabled: is1GbPlan,
    },
  ];

  React.useEffect(() => {
    if (values.type.length === 0 || !dbtypes) {
      return;
    }

    const type = dbtypes.find((type) => type.id === values.type);
    if (!type) {
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
    setFieldValue('failover_count', is1GbPlan ? 0 : 2);
    setFieldValue('replication_type', is1GbPlan ? 'none' : 'semi_synch');
  }, [dbtypes, is1GbPlan, setFieldValue, values.type]);

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
        labelOptions={{
          suffixComponent: (
            <Chip className={classes.chip} label="beta" component="span" />
          ),
        }}
      />
      <Paper>
        {createError ? <Notice error text={createError} /> : null}
        <Grid item>
          <Typography variant="h2">Name Your Cluster</Typography>
          <TextField
            data-qa-label-input
            errorText={errors.label}
            label="Cluster Label"
            tooltipText={labelToolTip}
            tooltipClasses={classes.tooltip}
            onChange={(e) => setFieldValue('label', e.target.value)}
            value={values.label}
          />
        </Grid>
        <Divider spacingTop={38} spacingBottom={12} />
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
          <Typography style={{ marginTop: 8 }}>
            <a
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
              href="https://www.linode.com/speed-test/"
            >
              Use our speedtest page
            </a>
            {` `}
            to find the best region for your current location.
          </Typography>
        </Grid>
        <Divider spacingTop={38} spacingBottom={12} />
        <Grid item>
          <SelectPlanPanel
            data-qa-select-plan
            error={errors.type}
            types={displayTypes}
            onSelect={(selected: string) => {
              setFieldValue('type', selected);
            }}
            selectedID={values.type}
            updateFor={[values.type, errors]}
            header="Choose a Plan"
            className={classes.selectPlanPanel}
            isCreate
          />
        </Grid>
        <Divider spacingTop={26} spacingBottom={12} />
        <Grid item>
          <Typography variant="h2" style={{ marginBottom: 4 }}>
            Set Number of Nodes{' '}
          </Typography>
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
                +e.target.value === 0 ? 'none' : 'semi_synch'
              );
            }}
            data-testid="database-nodes"
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
                  disabled={nodeOption.disabled}
                  control={<Radio />}
                  data-qa-radio={nodeOption.label}
                  className={classes.formControlLabel}
                />
              ))}
            </RadioGroup>
            <FormHelperText>{errors.failover_count}</FormHelperText>
          </FormControl>
        </Grid>
        <Divider spacingTop={26} spacingBottom={12} />
        <Grid item>
          <Typography variant="h2" style={{ marginBottom: 4 }}>
            Add Access Controls
          </Typography>
          <Typography>
            Add the IP addresses for other instances or users that should have
            the authorization to view this cluster’s database.
          </Typography>
          <Typography>
            By default, all public and private connections are denied.{' '}
            <Link to="https://www.linode.com/docs/products/database">
              Learn more.
            </Link>
          </Typography>
          <Grid style={{ marginTop: 24, maxWidth: 450 }}>
            {ipErrorsFromAPI
              ? ipErrorsFromAPI.map((apiError: APIError) => (
                  <Notice key={apiError.reason} text={apiError.reason} error />
                ))
              : null}
            <MultipleIPInput
              title="Inbound Sources"
              placeholder="Add IP Address or range"
              ips={values.allow_list}
              onChange={(address) => setFieldValue('allow_list', address)}
              required
            />
          </Grid>
        </Grid>
      </Paper>
      <Grid className={classes.btnCtn}>
        <Button type="submit" buttonType="primary" loading={isSubmitting}>
          Create Database Cluster
        </Button>
      </Grid>
      <Grid className={classes.btnCtn}>
        <Typography className={classes.createText}>
          Your database node(s) will take approximately 15-30 minutes to
          provision.
        </Typography>
      </Grid>
    </form>
  );
};

export default DatabaseCreate;
