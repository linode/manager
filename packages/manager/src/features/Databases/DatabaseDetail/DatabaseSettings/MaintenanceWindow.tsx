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
import FormHelperText from 'src/components/core/FormHelperText';
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
  helperContent: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  helpIcon: {
    padding: '0px 8px',
  },
  formControl: {
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
  // Save Changes" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const handleSaveMaintenanceWindow = (
    values: UpdatesSchedule,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    // @TODO Update this to only send 'updates' and now 'allow_list' when the API supports it
    updateDatabase({ allow_list: database.allow_list, updates: values })
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
    (thisOption) => thisOption.value === database.updates?.day
  );

  const scheduledUpdateHour = hourSelectionMap.find(
    (thisOption) => thisOption.value === database.updates?.hour
  );

  const utcOffsetInHours = timezone
    ? DateTime.fromISO(new Date().toISOString(), { zone: timezone }).offset / 60
    : DateTime.now().offset / 60;

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
      duration: database.updates?.duration ?? 3,
      hour: database.updates?.hour ?? 20,
      day: database.updates?.day ?? 1,
      week:
        database.updates?.frequency === 'monthly' ? database.updates?.week : 1,
    },
    // enableReinitialize: true,
    // validationSchema: updateDatabaseSchema,
    // validateOnChange: false,
    // validate: updateDatabaseSchema,
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
            Select the frequency, day, and time you&apos;d prefer maintenance to
            occur. On non-HA plans, there may be downtime during this window.
          </Typography>
          <FormControl
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormTouched(true);
              setFieldValue('frequency', e.target.value);
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
              <FormControl style={{ marginRight: '3rem', minWidth: '150px' }}>
                <Select
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-week-in-month-select': true,
                    },
                  }}
                  options={weekSelectionMap}
                  defaultValue={null}
                  value={weekSelectionMap.find(
                    (thisOption) => thisOption.value === values.week
                  )}
                  onChange={(e: Item) => {
                    setFormTouched(true);
                    setFieldValue('week', +e.value);
                  }}
                  label="Week in the month"
                  placeholder="Choose a week"
                  isClearable={false}
                  menuPlacement="top"
                  name="Week in the month"
                  error={touched.week && Boolean(errors.week)}
                  errorText={touched.week ? errors.week : undefined}
                  noMarginTop
                />
              </FormControl>
            ) : null}
            <FormControl style={{ marginRight: '3rem' }}>
              <Select
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-weekday-select': true,
                  },
                }}
                options={daySelectionMap}
                defaultValue={scheduledUpdateDay?.value ?? 1}
                value={daySelectionMap.find(
                  (thisOption) => thisOption.value === values.day
                )}
                onChange={(e: Item) => {
                  setFormTouched(true);
                  setFieldValue('day', e.value);
                }}
                label="Day of Week"
                placeholder="Choose a day"
                isClearable={false}
                menuPlacement="top"
                name="Day of Week"
                error={touched.day && Boolean(errors.day)}
                errorText={touched.day ? errors.day : undefined}
                noMarginTop
              />
            </FormControl>
            <FormControl style={{ marginRight: '3rem' }}>
              <Select
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-time-select': true,
                  },
                }}
                options={hourSelectionMap}
                defaultValue={scheduledUpdateHour?.value ?? 20}
                value={hourSelectionMap.find(
                  (thisOption) => thisOption.value === values.hour
                )}
                onChange={(e: Item) => {
                  setFormTouched(true);
                  setFieldValue('hour', +e.value);
                }}
                label="Time of Day"
                placeholder="Choose a time"
                isClearable={false}
                menuPlacement="top"
                name="Time of Day"
                error={touched.hour && Boolean(errors.hour)}
                errorText={touched.hour ? errors.hour : undefined}
                noMarginTop
              />
              <FormHelperText className={classes.helperContent}>
                Time in UTC
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
              </FormHelperText>
            </FormControl>
          </div>
        </div>
        <Button
          className={classes.sectionButton}
          disabled={!formTouched || isSubmitting}
          type="submit"
          buttonType="primary"
          compact
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
  { label: 'Sunday', value: 1 },
  { label: 'Monday', value: 2 },
  { label: 'Tuesday', value: 3 },
  { label: 'Wednesday', value: 4 },
  { label: 'Thursday', value: 5 },
  { label: 'Friday', value: 6 },
  { label: 'Saturday', value: 7 },
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
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
];

const utcOffsetText = (utcOffsetInHours: number) => {
  return utcOffsetInHours < 0
    ? `+${Math.abs(utcOffsetInHours)}`
    : `-${utcOffsetInHours}`;
};

export default MaintenanceWindow;
