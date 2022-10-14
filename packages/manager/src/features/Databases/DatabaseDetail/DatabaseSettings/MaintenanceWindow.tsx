import { Database, UpdatesSchedule } from '@linode/api-v4/lib/databases';
import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import { useDatabaseMutation } from 'src/queries/databases';
// import { updateDatabaseSchema } from '@linode/validation/src/databases.schema';

const useStyles = makeStyles((theme: Theme) => ({
  topSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  sectionTitleAndText: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    width: '65%',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  sectionButton: {
    minWidth: 214,
    marginTop: '1rem',
    marginBottom: '1rem',
    alignSelf: 'end',
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'flex-start',
    },
  },
  helpIcon: {
    padding: '0px 8px',
    marginTop: '1.25rem',
  },
  formControlDropdown: {
    marginRight: '3rem',
  },
}));

interface Props {
  database: Database;
  timezone?: string;
}

export const MaintenanceWindow: React.FC<Props> = (props) => {
  const { database, timezone } = props;

  const [maintenanceUpdateError, setMaintenanceUpdateError] = React.useState<
    APIError[]
  >();

  // This will be set to `true` once a form field has been touched. This is used to disable the
  // "Save Changes" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  const [
    modifiedWeekSelectionMap,
    setModifiedWeekSelectionMap,
  ] = React.useState<Item[]>([]);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const weekSelectionModifier = (day: string, weekSelectionMap: Item[]) => {
    const modifiedMap = weekSelectionMap.map((weekSelectionElement) => {
      return {
        label: `${weekSelectionElement.label} ${day} of each month`,
        value: weekSelectionElement.value,
      };
    });

    setModifiedWeekSelectionMap(modifiedMap);
  };

  React.useEffect(() => {
    // This is so that if a user loads the page and just changes to the Monthly frequency, the "Repeats on" field will be accurate.
    const initialDay = database.updates?.day_of_week;
    const dayOfWeek =
      daySelectionMap.find((option) => option.value === initialDay) ??
      daySelectionMap[0];

    weekSelectionModifier(dayOfWeek.label, weekSelectionMap);
  }, []);

  const handleSaveMaintenanceWindow = (
    values: Omit<UpdatesSchedule, 'duration'>,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    // @TODO Update this to only send 'updates' and not 'allow_list' when the API supports it.
    // Additionally, at that time, enable the validationSchema which currently does not work
    // because allow_list is a required field in the schema.
    updateDatabase({
      allow_list: database.allow_list,
      updates: values as UpdatesSchedule,
    })
      .then(() => {
        setSubmitting(false);
        enqueueSnackbar('Maintenance Window settings saved successfully.', {
          variant: 'success',
        });
        setFormTouched(false);
      })
      .catch((e: APIError[]) => {
        setMaintenanceUpdateError(e);
        setSubmitting(false);
      });
  };

  const scheduledUpdateDay = daySelectionMap.find(
    (thisOption) => thisOption.value === database.updates?.day_of_week
  );

  const scheduledUpdateHour = hourSelectionMap.find(
    (thisOption) => thisOption.value === database.updates?.hour_of_day
  );

  const utcOffsetInHours = timezone
    ? DateTime.fromISO(new Date().toISOString(), { zone: timezone }).offset / 60
    : DateTime.now().offset / 60;

  const getInitialWeekOfMonth = () => {
    if (database.updates?.frequency === 'monthly') {
      return database.updates?.week_of_month ?? 1;
    }
    return null;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      frequency: database.updates?.frequency ?? 'weekly',
      hour_of_day: database.updates?.hour_of_day ?? 20,
      day_of_week: database.updates?.day_of_week ?? 1,
      week_of_month: getInitialWeekOfMonth(),
    },
    // validationSchema: updateDatabaseSchema,
    onSubmit: handleSaveMaintenanceWindow,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <Typography variant="h3" className={classes.sectionTitle}>
            Maintenance Window
          </Typography>
          {maintenanceUpdateError ? (
            <Notice error spacingTop={8}>
              {maintenanceUpdateError[0].reason}
            </Notice>
          ) : null}
          <Typography className={classes.sectionText}>
            OS and DB engine updates will be performed on the schedule below.
            Select the frequency, day, and time you&rsquo;d prefer maintenance
            to occur.{' '}
            {database.cluster_size !== 3
              ? 'For non-HA plans, expect downtime during this window.'
              : null}
          </Typography>
          <div>
            <FormControl className={classes.formControlDropdown}>
              <Select
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-weekday-select': true,
                  },
                }}
                options={daySelectionMap}
                defaultValue={scheduledUpdateDay?.value ?? 1}
                value={daySelectionMap.find(
                  (thisOption) => thisOption.value === values.day_of_week
                )}
                onChange={(e: Item) => {
                  setFormTouched(true);
                  setFieldValue('day_of_week', e.value);
                  weekSelectionModifier(e.label, weekSelectionMap);

                  // If week_of_month is not null (i.e., the user has selected a value for "Repeats on" already),
                  // refresh the field value so that the selected option displays the chosen day.
                  if (values.week_of_month) {
                    setFieldValue('week_of_month', values.week_of_month);
                  }
                }}
                label="Day of Week"
                placeholder="Choose a day"
                isClearable={false}
                menuPlacement="top"
                name="Day of Week"
                error={touched.day_of_week && Boolean(errors.day_of_week)}
                errorText={touched.day_of_week ? errors.day_of_week : undefined}
                noMarginTop
              />
            </FormControl>
            <FormControl className={classes.formControlDropdown}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-time-select': true,
                    },
                  }}
                  options={hourSelectionMap}
                  defaultValue={scheduledUpdateHour?.value ?? 20}
                  value={hourSelectionMap.find(
                    (thisOption) => thisOption.value === values.hour_of_day
                  )}
                  onChange={(e: Item) => {
                    setFormTouched(true);
                    setFieldValue('hour_of_day', +e.value);
                  }}
                  label="Time of Day (UTC)"
                  placeholder="Choose a time"
                  isClearable={false}
                  menuPlacement="top"
                  name="Time of Day"
                  error={touched.hour_of_day && Boolean(errors.hour_of_day)}
                  errorText={
                    touched.hour_of_day ? errors.hour_of_day : undefined
                  }
                  noMarginTop
                />
                <HelpIcon
                  interactive
                  className={classes.helpIcon}
                  text={
                    <Typography>
                      UTC is {utcOffsetText(utcOffsetInHours)} hours compared to
                      your local timezone. Click{' '}
                      <Link to="/profile/display">here</Link> to view or change
                      your timezone settings.
                    </Typography>
                  }
                />
              </div>
            </FormControl>
          </div>
          <FormControl
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormTouched(true);
              setFieldValue('frequency', e.target.value);
              if (e.target.value === 'weekly') {
                // If the frequency is weekly, set the 'week_of_month' field to null since that should only be specified for a monthly frequency.
                setFieldValue('week_of_month', null);
              }

              if (e.target.value === 'monthly') {
                const dayOfWeek =
                  daySelectionMap.find(
                    (option) => option.value === values.day_of_week
                  ) ?? daySelectionMap[0];

                weekSelectionModifier(dayOfWeek.label, weekSelectionMap);
                setFieldValue(
                  'week_of_month',
                  modifiedWeekSelectionMap[0].value
                );
              }
            }}
          >
            <RadioGroup
              style={{ marginTop: 0, marginBottom: 0 }}
              value={values.frequency}
            >
              {maintenanceFrequencyMap.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  label={option.key}
                  control={<Radio />}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <div>
            {values.frequency === 'monthly' ? (
              <FormControl
                className={classes.formControlDropdown}
                style={{ minWidth: '250px' }}
              >
                <Select
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-week-in-month-select': true,
                    },
                  }}
                  options={modifiedWeekSelectionMap}
                  defaultValue={modifiedWeekSelectionMap[0]}
                  value={modifiedWeekSelectionMap.find(
                    (thisOption) => thisOption.value === values.week_of_month
                  )}
                  onChange={(e: Item) => {
                    setFormTouched(true);
                    setFieldValue('week_of_month', +e.value);
                  }}
                  label="Repeats on"
                  placeholder="Repeats on"
                  isClearable={false}
                  menuPlacement="top"
                  name="Repeats on"
                  error={touched.week_of_month && Boolean(errors.week_of_month)}
                  errorText={
                    touched.week_of_month ? errors.week_of_month : undefined
                  }
                  noMarginTop
                />
              </FormControl>
            ) : null}
          </div>
        </div>
        <Button
          className={classes.sectionButton}
          disabled={!formTouched || isSubmitting}
          loading={isSubmitting}
          type="submit"
          buttonType="primary"
          compactX
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

const maintenanceFrequencyMap = [
  {
    key: 'Weekly',
    value: 'weekly',
  },
  {
    key: 'Monthly',
    value: 'monthly',
  },
];

const daySelectionMap = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 7 },
];

const hourSelectionMap = [
  { label: '00:00', value: 0 },
  { label: '01:00', value: 2 },
  { label: '02:00', value: 1 },
  { label: '03:00', value: 3 },
  { label: '04:00', value: 4 },
  { label: '05:00', value: 5 },
  { label: '06:00', value: 6 },
  { label: '07:00', value: 7 },
  { label: '08:00', value: 8 },
  { label: '09:00', value: 9 },
  { label: '10:00', value: 10 },
  { label: '11:00', value: 11 },
  { label: '12:00', value: 12 },
  { label: '13:00', value: 13 },
  { label: '14:00', value: 14 },
  { label: '15:00', value: 15 },
  { label: '16:00', value: 16 },
  { label: '17:00', value: 17 },
  { label: '18:00', value: 18 },
  { label: '19:00', value: 19 },
  { label: '20:00', value: 20 },
  { label: '21:00', value: 21 },
  { label: '22:00', value: 22 },
  { label: '23:00', value: 23 },
];

const weekSelectionMap = [
  { label: 'First', value: 1 },
  { label: 'Second', value: 2 },
  { label: 'Third', value: 3 },
  { label: 'Fourth', value: 4 },
];

const utcOffsetText = (utcOffsetInHours: number) => {
  return utcOffsetInHours < 0
    ? `+${Math.abs(utcOffsetInHours)}`
    : `-${utcOffsetInHours}`;
};

export default MaintenanceWindow;
