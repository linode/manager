import { createDatabaseSchema } from '@linode/validation/lib/databases.schema';
import { useFormik } from 'formik';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import Typography from 'src/components/core/Typography';
import BreadCrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import {
  useDatabaseVersionsQuery,
  useDatabaseTypesQuery,
  useCreateDatabaseMutation,
} from 'src/queries/databases';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import RegionOption from 'src/components/EnhancedSelect/variants/RegionSelect/RegionOption';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import { DatabaseType } from '@linode/api-v4/lib/databases/types';
import { useHistory } from 'react-router-dom';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';

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

  const submitForm = async () => {
    if (errors.allow_list) {
      return;
    }

    setSubmitting(true);
    const validatedIps = values.allow_list.map((value) => ({
      address: value.address,
    }));
    const { allow_list, ...rest } = values;
    const createPayload = { ...rest, allow_list: validatedIps };
    console.log(createPayload)

    try {
      const response = await createDatabase(createPayload);
      history.push(`/databases/${response.id}`);
    } catch (error) {
      console.log(error)
    }

    setSubmitting(false);
  };

  const engineOptions = versions?.map((version) => ({
    ...version,
    flag: engineIcons[version.engine],
  }));

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
      engine: {},
      region: '',
      type: '',
      failover_count: 0,
      replication_type: 'none',
      allow_list: [
        {
          address: '',
        },
      ],
    },
    validationSchema: createDatabaseSchema,
    validateOnChange: false,
    onSubmit: submitForm,
  });

  console.log(errors)

  const disableCreateButton =
    !values.label ||
    !values.engine ||
    !values.region ||
    !values.type ||
    !values.failover_count ||
    values.allow_list.some((item) => item.address === '');

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
            value={values.engine}
            errorText={errors.engine}
            options={engineOptions}
            components={{ Option: RegionOption, SingleValue }}
            placeholder={'Select a Database Engine'}
            onChange={(selected: Item<string>) => {
              setFieldValue('engine', selected);
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
            types={dbtypes}
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
              setFieldValue('replication_type', 'semi-synch');
            }}
          >
            <RadioGroup
              style={{ marginBottom: 0 }}
              value={values.failover_count}
            >
              <FormControlLabel
                className={classes.formControlLabel}
                value={0}
                label={
                  <Typography>
                    1 Node
                    <br />
                    {`$${type?.price.monthly || 0}/month $${
                      type?.price.hourly || 0
                    }/hr`}
                  </Typography>
                }
                control={<Radio />}
                data-qa-radio={'1 Node'}
              />
              <FormControlLabel
                className={classes.formControlLabel}
                value={2}
                label={
                  <Typography>
                    3 Nodes - High Availability (recommended)
                    <br />
                    {`$${multiNodePricing.monthly}/month $${multiNodePricing.hourly}/hr`}
                  </Typography>
                }
                control={<Radio />}
                data-qa-radio={'3 Nodes - High Availability (recommended)'}
              />
            </RadioGroup>
            <FormHelperText>{errors.failover_count}</FormHelperText>
          </FormControl>
        </Grid>
        <Divider spacingTop={30} />
        <Grid item>
          <Typography variant="h2">Add Access Controls</Typography>
          <MultipleIPInput
            title="Inbound Sources"
            ips={values.allow_list.map((value, idx) => ({
              ...value,
              error:
                errors.allow_list && errors.allow_list[idx]
                  ? errors.allow_list[idx].address
                  : null,
            }))}
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
          Create Volume
        </Button>
      </Grid>
    </form>
  );
};

export default DatabaseCreate;
