import {
  ClusterSize,
  ComprehensiveReplicationType,
  CreateDatabasePayload,
  DatabaseClusterSizeObject,
  DatabaseEngine,
  DatabasePriceObject,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import { APIError } from '@linode/api-v4/lib/types';
import { createDatabaseSchema } from '@linode/validation/lib/databases.schema';
import { useFormik } from 'formik';
import { groupBy } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MongoDBIcon from 'src/assets/icons/mongodb.svg';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import PostgreSQLIcon from 'src/assets/icons/postgresql.svg';
import BreadCrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import RegionOption from 'src/components/EnhancedSelect/variants/RegionSelect/RegionOption';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import Radio from 'src/components/Radio';
import { regionHelperText } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import TextField from 'src/components/TextField';
import { databaseEngineMap } from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer';
import SelectPlanPanel, {
  PlanSelectionType,
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import useFlags from 'src/hooks/useFlags';
import {
  useCreateDatabaseMutation,
  useDatabaseEnginesQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases';
import { useRegionsQuery } from 'src/queries/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import {
  ExtendedIP,
  ipFieldPlaceholder,
  validateIPs,
} from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { typeLabelDetails } from 'src/features/linodes/presentation';

const useStyles = makeStyles((theme: Theme) => ({
  formControlLabel: {
    marginBottom: theme.spacing(),
  },
  btnCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      marginTop: theme.spacing(),
    },
  },
  createBtn: {
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
  },
  createText: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(),
      marginRight: 0,
    },
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
  notice: {
    fontSize: 15,
    lineHeight: '18px',
  },
  engineSelect: {
    '& .react-select__option--is-focused': {
      '&:not(.react-select__option--is-selected)': {
        '& svg': {
          filter: 'brightness(0) invert(1)',
        },
      },
    },
  },
}));

const engineIcons = {
  mysql: () => <MySQLIcon width="24" height="24" />,
  postgresql: () => <PostgreSQLIcon width="24" height="24" />,
  mongodb: () => <MongoDBIcon width="24" height="24" />,
};

const getEngineOptions = (engines: DatabaseEngine[]) => {
  const groupedEngines = groupBy<DatabaseEngine>((engineObject) => {
    if (engineObject.engine.match(/mysql/i)) {
      return 'MySQL';
    }
    if (engineObject.engine.match(/postgresql/i)) {
      return 'PostgreSQL';
    }
    if (engineObject.engine.match(/mongodb/i)) {
      return 'MongoDB';
    }
    if (engineObject.engine.match(/redis/i)) {
      return 'Redis';
    }
    return 'Other';
  }, engines);
  return ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Other'].reduce(
    (accum, thisGroup) => {
      if (
        !groupedEngines[thisGroup] ||
        groupedEngines[thisGroup].length === 0
      ) {
        return accum;
      }
      return [
        ...accum,
        {
          label: thisGroup,
          options: groupedEngines[thisGroup]
            .map((engineObject) => ({
              ...engineObject,
              label: `${databaseEngineMap[engineObject.engine]} v${
                engineObject.version
              }`,
              value: `${engineObject.engine}/${engineObject.version}`,
              flag: engineIcons[engineObject.engine],
            }))
            .sort((a, b) => (a.version > b.version ? -1 : 1)),
        },
      ];
    },
    []
  );
};

interface NodePricing {
  single: DatabasePriceObject | undefined;
  multi: DatabasePriceObject | undefined;
}

const DatabaseCreate: React.FC<{}> = () => {
  const classes = useStyles();
  const history = useHistory();
  const flags = useFlags();

  const {
    data: regionsData,
    isLoading: regionsLoading,
    error: regionsError,
  } = useRegionsQuery();

  const {
    data: engines,
    isLoading: enginesLoading,
    error: enginesError,
  } = useDatabaseEnginesQuery();

  const {
    data: dbtypes,
    isLoading: typesLoading,
    error: typesError,
  } = useDatabaseTypesQuery();

  const { mutateAsync: createDatabase } = useCreateDatabaseMutation();

  const [nodePricing, setNodePricing] = React.useState<NodePricing>();
  const [createError, setCreateError] = React.useState<string>();
  const [ipErrorsFromAPI, setIPErrorsFromAPI] = React.useState<APIError[]>();

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);

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
      engine: 'mysql' as Engine,
      region: '',
      type: '',
      cluster_size: -1 as ClusterSize,
      replication_type: 'none' as ComprehensiveReplicationType,
      replication_commit_type: undefined, // specific to Postgres
      allow_list: [
        {
          address: '',
          error: '',
        },
      ],
      ssl_connection: true,
      storage_engine: undefined, // specific to MongoDB
      compression_type: undefined, // specific to MongoDB
    },
    validationSchema: createDatabaseSchema,
    validateOnChange: false,
    validate: handleIPValidation,
    onSubmit: submitForm,
  });

  const selectedEngine = values.engine.split('/')[0] as Engine;

  const displayTypes: PlanSelectionType[] = React.useMemo(() => {
    if (!dbtypes) {
      return [];
    }
    return dbtypes.map((type) => {
      const { label } = type;
      const formattedLabel = formatStorageUnits(label);
      const singleNodePricing = type.engines[selectedEngine].find(
        (cluster) => cluster.quantity === 1
      );
      const price = singleNodePricing?.price ?? { monthly: null, hourly: null };
      const subHeadings = [
        `$${price.monthly}/mo ($${price.hourly}/hr)`,
        typeLabelDetails(type.memory, type.disk, type.vcpus),
      ] as [string, string];
      return {
        ...type,
        label: formattedLabel,
        heading: formattedLabel,
        price,
        subHeadings,
      };
    });
  }, [dbtypes, selectedEngine]);

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

  const nodeOptions = [
    {
      value: 1,
      label: (
        <Typography>
          1 Node {` `}
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${nodePricing?.single?.monthly || 0}/month $${
              nodePricing?.single?.hourly || 0
            }/hr`}
          </span>
        </Typography>
      ),
    },
    {
      value: 3,
      label: (
        <Typography>
          3 Nodes - High Availability (recommended)
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${nodePricing?.multi?.monthly || 0}/month $${
              nodePricing?.multi?.hourly || 0
            }/hr`}
          </span>
        </Typography>
      ),
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

    const engineType = values.engine.split('/')[0];

    setNodePricing({
      single: type.engines[engineType].find(
        (cluster: DatabaseClusterSizeObject) => cluster.quantity === 1
      )?.price,
      multi: type.engines[engineType].find(
        (cluster: DatabaseClusterSizeObject) => cluster.quantity === 3
      )?.price,
    });
    setFieldValue(
      'cluster_size',
      values.cluster_size < 1 ? 3 : values.cluster_size
    );
    setFieldValue(
      'replication_type',
      determineReplicationType(values.cluster_size, values.engine)
    );
    setFieldValue(
      'replication_commit_type',
      determineReplicationCommitType(values.engine)
    );
    setFieldValue('storage_engine', determineStorageEngine(values.engine));
    setFieldValue('compression_type', determineCompressionType(values.engine));
  }, [dbtypes, setFieldValue, values.cluster_size, values.type, values.engine]);

  if (regionsLoading || !regionsData || enginesLoading || typesLoading) {
    return <CircleProgress />;
  }

  if (regionsError || enginesError || typesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {flags.databaseBeta ? (
        <DismissibleBanner
          preferenceKey="dbaas-open-beta-notice"
          productInformationIndicator
        >
          <Typography>
            Managed Database for MySQL is available in a free, open beta period
            until May 2nd, 2022. This is a beta environment and should not be
            used to support production workloads. Review the{' '}
            <Link to="https://www.linode.com/legal-eatp">
              Early Adopter Program SLA
            </Link>
            .
          </Typography>
        </DismissibleBanner>
      ) : null}
      <ProductInformationBanner
        bannerLocation="Databases"
        productInformationIndicator={false}
        productInformationWarning
      />
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
          suffixComponent: flags.databaseBeta ? (
            <Chip className={classes.chip} label="beta" component="span" />
          ) : null,
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
            className={classes.engineSelect}
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
          <div style={{ marginTop: 8 }}>{regionHelperText()}</div>
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
            updateFor={[values.type, selectedEngine, errors]}
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
          <Typography style={{ marginBottom: 8 }}>
            We recommend 3 nodes in a database cluster to avoid downtime during
            upgrades and maintenance.
          </Typography>
          <FormControl
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldValue('cluster_size', +e.target.value);
              setFieldValue(
                'replication_type',
                +e.target.value === 1 ? 'none' : 'semi_synch'
              );
            }}
            data-testid="database-nodes"
          >
            {errors.cluster_size ? (
              <Notice error text={errors.cluster_size} />
            ) : null}
            <RadioGroup
              style={{ marginTop: 0, marginBottom: 0 }}
              value={values.cluster_size}
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
          </FormControl>
          <Grid item xs={12} md={8}>
            {flags.databaseBeta ? (
              <Notice informational className={classes.notice}>
                <strong>
                  Notice: There is no charge for database clusters during beta.
                </strong>{' '}
                Database clusters will be subject to charges when the beta
                period ends on May 2nd, 2022.{' '}
                <Link to="https://www.linode.com/pricing/#databases">
                  View pricing
                </Link>
                .
              </Notice>
            ) : undefined}
          </Grid>
        </Grid>
        <Divider spacingTop={26} spacingBottom={12} />
        <Grid item>
          <Typography variant="h2" style={{ marginBottom: 4 }}>
            Add Access Controls
          </Typography>
          <Typography>
            Add any IPv4 address or range that should be authorized to access
            this cluster.
          </Typography>
          <Typography>
            By default, all public and private connections are denied.{' '}
            <Link to="https://www.linode.com/docs/products/databases/managed-databases/guides/manage-access-controls/">
              Learn more
            </Link>
            .
          </Typography>
          <Typography style={{ marginTop: 16 }}>
            You can add or modify access controls after your database cluster is
            active.{' '}
          </Typography>
          <Grid style={{ marginTop: 24, maxWidth: 450 }}>
            {ipErrorsFromAPI
              ? ipErrorsFromAPI.map((apiError: APIError) => (
                  <Notice key={apiError.reason} text={apiError.reason} error />
                ))
              : null}
            <MultipleIPInput
              title="Allowed IP Address(es) or Range(s)"
              placeholder={ipFieldPlaceholder}
              ips={values.allow_list}
              onChange={(address) => setFieldValue('allow_list', address)}
              onBlur={handleIPBlur}
            />
          </Grid>
        </Grid>
      </Paper>
      <Grid className={classes.btnCtn}>
        <Typography className={classes.createText}>
          Your database node(s) will take approximately 15-30 minutes to
          provision.
        </Typography>
        <Button
          type="submit"
          buttonType="primary"
          loading={isSubmitting}
          className={classes.createBtn}
        >
          Create Database Cluster
        </Button>
      </Grid>
    </form>
  );
};

const determineReplicationType = (clusterSize: number, engine: string) => {
  if (Boolean(engine.match(/mongo/))) {
    return undefined;
  }

  // If engine is a MySQL or Postgres one and it's a standalone DB instance
  if (clusterSize === 1) {
    return 'none';
  }

  // MySQL engine & cluster = semi_synch. PostgreSQL engine & cluster = asynch.
  if (Boolean(engine.match(/mysql/))) {
    return 'semi_synch';
  } else {
    return 'asynch';
  }
};

const determineReplicationCommitType = (engine: string) => {
  // 'local' is the default.
  if (Boolean(engine.match(/postgres/))) {
    return 'local';
  }

  return undefined;
};

const determineStorageEngine = (engine: string) => {
  // 'wiredtiger' is the default.
  if (Boolean(engine.match(/mongo/))) {
    return 'wiredtiger';
  }

  return undefined;
};

const determineCompressionType = (engine: string) => {
  // 'none' is the default.
  if (Boolean(engine.match(/mongo/))) {
    return 'none';
  }

  return undefined;
};

export default DatabaseCreate;
