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
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { groupBy } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import MongoDBIcon from 'src/assets/icons/mongodb.svg';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import PostgreSQLIcon from 'src/assets/icons/postgresql.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { _SingleValue } from 'src/components/EnhancedSelect/components/SingleValue';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { RegionOption } from 'src/components/EnhancedSelect/variants/RegionSelect/RegionOption';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { databaseEngineMap } from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { typeLabelDetails } from 'src/features/Linodes/presentation';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { useFlags } from 'src/hooks/useFlags';
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

import type { PlanSelectionType } from 'src/features/components/PlansPanel/types';

const useStyles = makeStyles()((theme: Theme) => ({
  btnCtn: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-end',
      flexDirection: 'column',
      marginTop: theme.spacing(),
    },
  },
  chip: {
    marginTop: 4,
  },
  createBtn: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
    whiteSpace: 'nowrap',
  },
  createText: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      padding: theme.spacing(),
    },
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
  formControlLabel: {
    marginBottom: theme.spacing(),
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
    marginTop: '-2px',
    padding: '0px 0px 0px 2px',
  },
  notice: {
    fontSize: 15,
    lineHeight: '18px',
  },
  selectPlanPanel: {
    margin: 0,
    padding: 0,
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
  mongodb: <MongoDBIcon height="24" width="24" />,
  mysql: <MySQLIcon height="24" width="24" />,
  postgresql: <PostgreSQLIcon height="24" width="24" />,
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
              flag: engineIcons[engineObject.engine],
              label: `${databaseEngineMap[engineObject.engine]} v${
                engineObject.version
              }`,
              value: `${engineObject.engine}/${engineObject.version}`,
            }))
            .sort((a, b) => (a.version > b.version ? -1 : 1)),
        },
      ];
    },
    []
  );
};

interface NodePricing {
  multi: DatabasePriceObject | undefined;
  single: DatabasePriceObject | undefined;
}

const DatabaseCreate = () => {
  const { classes } = useStyles();
  const history = useHistory();
  const flags = useFlags();

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

  const {
    errors,
    handleSubmit,
    isSubmitting,
    setFieldError,
    setFieldValue,
    setSubmitting,
    values,
  } = useFormik({
    initialValues: {
      allow_list: [
        {
          address: '',
          error: '',
        },
      ],
      cluster_size: -1 as ClusterSize,
      compression_type: undefined, // specific to MongoDB
      engine: 'mysql' as Engine,
      label: '',
      region: '',
      replication_commit_type: undefined, // specific to Postgres
      replication_type: 'none' as ComprehensiveReplicationType,
      ssl_connection: true,
      storage_engine: undefined, // specific to MongoDB
      type: '',
    },
    onSubmit: submitForm,
    validate: handleIPValidation,
    validateOnChange: false,
    validationSchema: createDatabaseSchema,
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
      value: 1,
    },
    {
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
      value: 3,
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
      multi: type.engines[engineType].find(
        (cluster: DatabaseClusterSizeObject) => cluster.quantity === 3
      )?.price,
      single: type.engines[engineType].find(
        (cluster: DatabaseClusterSizeObject) => cluster.quantity === 1
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
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Database Clusters',
              position: 1,
            },
          ],
          labelOptions: {
            suffixComponent: flags.databaseBeta ? (
              <BetaChip className={classes.chip} component="span" />
            ) : null,
          },
          pathname: location.pathname,
        }}
        title="Create"
      />
      <Paper>
        {createError ? <Notice text={createError} variant="error" /> : null}
        <Grid>
          <Typography variant="h2">Name Your Cluster</Typography>
          <TextField
            data-qa-label-input
            errorText={errors.label}
            label="Cluster Label"
            onChange={(e) => setFieldValue('label', e.target.value)}
            tooltipClasses={classes.tooltip}
            tooltipText={labelToolTip}
            value={values.label}
          />
        </Grid>
        <Divider spacingBottom={12} spacingTop={38} />
        <Grid>
          <Typography variant="h2">Select Engine and Region</Typography>
          <Select
            onChange={(selected: Item<string>) => {
              setFieldValue('engine', selected.value);
            }}
            value={getSelectedOptionFromGroupedOptions(
              values.engine,
              engineOptions
            )}
            className={classes.engineSelect}
            components={{ Option: RegionOption, SingleValue: _SingleValue }}
            errorText={errors.engine}
            isClearable={false}
            label="Database Engine"
            options={engineOptions}
            placeholder={'Select a Database Engine'}
          />
        </Grid>
        <Grid>
          <RegionSelect
            handleSelection={(selected: string) =>
              setFieldValue('region', selected)
            }
            errorText={errors.region}
            regions={regionsData}
            selectedID={values.region}
          />
          <RegionHelperText mt={1} />
        </Grid>
        <Divider spacingBottom={12} spacingTop={38} />
        <Grid>
          <PlansPanel
            onSelect={(selected: string) => {
              setFieldValue('type', selected);
            }}
            className={classes.selectPlanPanel}
            data-qa-select-plan
            error={errors.type}
            header="Choose a Plan"
            isCreate
            selectedID={values.type}
            types={displayTypes}
          />
        </Grid>
        <Divider spacingBottom={12} spacingTop={26} />
        <Grid>
          <Typography style={{ marginBottom: 4 }} variant="h2">
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
              <Notice text={errors.cluster_size} variant="error" />
            ) : null}
            <RadioGroup
              style={{ marginBottom: 0, marginTop: 0 }}
              value={values.cluster_size}
            >
              {nodeOptions.map((nodeOption) => (
                <FormControlLabel
                  className={classes.formControlLabel}
                  control={<Radio />}
                  data-qa-radio={nodeOption.label}
                  key={nodeOption.value}
                  label={nodeOption.label}
                  value={nodeOption.value}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <Grid md={8} xs={12}>
            {flags.databaseBeta ? (
              <Notice className={classes.notice} variant="info">
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
        <Divider spacingBottom={12} spacingTop={26} />
        <Grid>
          <Typography style={{ marginBottom: 4 }} variant="h2">
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
                  <Notice
                    key={apiError.reason}
                    text={apiError.reason}
                    variant="error"
                  />
                ))
              : null}
            <MultipleIPInput
              ips={values.allow_list}
              onBlur={handleIPBlur}
              onChange={(address) => setFieldValue('allow_list', address)}
              placeholder={ipFieldPlaceholder}
              title="Allowed IP Address(es) or Range(s)"
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
          buttonType="primary"
          className={classes.createBtn}
          loading={isSubmitting}
          type="submit"
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
