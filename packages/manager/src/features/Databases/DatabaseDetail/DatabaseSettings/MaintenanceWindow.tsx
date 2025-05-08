import {
  Autocomplete,
  Button,
  FormControl,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { useDatabaseMutation } from 'src/queries/databases/databases';

import type { Database, UpdatesSchedule } from '@linode/api-v4/lib/databases';
import type { APIError } from '@linode/api-v4/lib/types';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  formControlDropdown: {
    '& label': {
      overflow: 'visible',
    },
    marginRight: '3rem',
    minWidth: '125px',
  },
  sectionButton: {
    alignSelf: 'end',
    marginBottom: '1rem',
    marginTop: '1rem',
    minWidth: 214,
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-start',
    },
  },
  sectionText: {
    [theme.breakpoints.down('md')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '65%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionTitleAndText: {
    width: '100%',
  },
  topSection: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
    },
  },
}));

interface Props {
  database: Database;
  disabled?: boolean;
  timezone?: string;
}

export const MaintenanceWindow = (props: Props) => {
  const { database, disabled, timezone } = props;

  const [maintenanceUpdateError, setMaintenanceUpdateError] =
    React.useState<APIError[]>();

  // This will be set to `true` once a form field has been touched. This is used to disable the
  // "Save Changes" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  const [modifiedWeekSelectionMap, setModifiedWeekSelectionMap] =
    React.useState<SelectOption<number>[]>([]);

  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const weekSelectionModifier = (
    day: string,
    weekSelectionMap: SelectOption<number>[]
  ) => {
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

  const utcOffsetInHours = timezone
    ? DateTime.fromISO(new Date().toISOString(), { zone: timezone }).offset / 60
    : DateTime.now().offset / 60;

  const getInitialWeekOfMonth = () => {
    if (database.updates?.frequency === 'monthly') {
      return database.updates?.week_of_month ?? 1;
    }
    return null;
  };

  const { errors, handleSubmit, isSubmitting, setFieldValue, touched, values } =
    useFormik({
      initialValues: {
        day_of_week: database.updates?.day_of_week ?? 1,
        frequency: database.updates?.frequency ?? 'weekly',
        hour_of_day: database.updates?.hour_of_day ?? 20,
        week_of_month: getInitialWeekOfMonth(),
      },
      // validationSchema: updateDatabaseSchema,
      onSubmit: handleSaveMaintenanceWindow,
    });

  const isLegacy = database.platform === 'rdbms-legacy';

  const typographyLegacyDatabase =
    'Select when you want the required OS and database engine updates to take place. The maintenance may cause downtime on clusters with less than 3 nodes (non high-availability clusters).';

  const typographyDatabase =
    "OS and database engine updates will be performed on the schedule below. Select the frequency, day, and time you'd prefer maintenance to occur.";

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <Typography className={classes.sectionTitle} variant="h3">
            {isLegacy
              ? 'Maintenance Window'
              : 'Set a Weekly Maintenance Window'}
          </Typography>
          {maintenanceUpdateError ? (
            <Notice spacingTop={8} variant="error">
              {maintenanceUpdateError[0].reason}
            </Notice>
          ) : null}
          <Typography className={classes.sectionText}>
            {isLegacy ? typographyLegacyDatabase : typographyDatabase}{' '}
            {database.cluster_size !== 3
              ? 'For non-HA plans, expect downtime during this window.'
              : null}
          </Typography>
          <div>
            <FormControl className={classes.formControlDropdown}>
              <Autocomplete
                autoHighlight
                disableClearable
                disabled={disabled}
                errorText={touched.day_of_week ? errors.day_of_week : undefined}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                label="Day of Week"
                noMarginTop
                onChange={(_, day) => {
                  setFormTouched(true);
                  setFieldValue('day_of_week', day.value);
                  weekSelectionModifier(day.label, weekSelectionMap);
                  // If week_of_month is not null (i.e., the user has selected a value for "Repeats on" already),
                  // refresh the field value so that the selected option displays the chosen day.
                  if (values.week_of_month) {
                    setFieldValue('week_of_month', values.week_of_month);
                  }
                }}
                options={daySelectionMap}
                placeholder="Choose a day"
                renderOption={(props, option) => (
                  <li {...props}>{option.label}</li>
                )}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-weekday-select': true,
                  },
                }}
                value={daySelectionMap.find(
                  (thisOption) => thisOption.value === values.day_of_week
                )}
              />
            </FormControl>
            <FormControl className={classes.formControlDropdown}>
              <div style={{ alignItems: 'center', display: 'flex' }}>
                <Autocomplete
                  autoHighlight
                  defaultValue={hourSelectionMap.find(
                    (option) => option.value === 20
                  )}
                  disableClearable
                  disabled={disabled}
                  errorText={
                    touched.hour_of_day ? errors.hour_of_day : undefined
                  }
                  label="Time"
                  noMarginTop
                  onChange={(_, hour) => {
                    setFormTouched(true);
                    setFieldValue('hour_of_day', hour?.value);
                  }}
                  options={hourSelectionMap}
                  placeholder="Choose a time"
                  renderOption={(props, option) => (
                    <li {...props}>{option.label}</li>
                  )}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-time-select': true,
                    },
                  }}
                  value={hourSelectionMap.find(
                    (thisOption) => thisOption.value === values.hour_of_day
                  )}
                />
                <TooltipIcon
                  sxTooltipIcon={{
                    marginTop: '1.75rem',
                    padding: '0px 8px',
                  }}
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
          {isLegacy && (
            <FormControl
              disabled={disabled}
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
                style={{ marginBottom: 0, marginTop: 0 }}
                value={values.frequency}
              >
                {maintenanceFrequencyMap.map((option) => (
                  <FormControlLabel
                    control={<Radio />}
                    key={option.value}
                    label={option.key}
                    value={option.value}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
          <div>
            {values.frequency === 'monthly' ? (
              <FormControl
                className={classes.formControlDropdown}
                style={{ minWidth: '250px' }}
              >
                <Autocomplete
                  autoHighlight
                  defaultValue={modifiedWeekSelectionMap[0]}
                  disableClearable
                  errorText={
                    touched.week_of_month ? errors.week_of_month : undefined
                  }
                  label="Repeats on"
                  noMarginTop
                  onChange={(_, week) => {
                    setFormTouched(true);
                    setFieldValue('week_of_month', week?.value);
                  }}
                  options={modifiedWeekSelectionMap}
                  placeholder="Repeats on"
                  renderOption={(props, option) => (
                    <li {...props}>{option.label}</li>
                  )}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-week-in-month-select': true,
                    },
                  }}
                  value={modifiedWeekSelectionMap.find(
                    (thisOption) => thisOption.value === values.week_of_month
                  )}
                />
              </FormControl>
            ) : null}
          </div>
        </div>
        <Button
          buttonType="primary"
          className={classes.sectionButton}
          compactX
          disabled={!formTouched || isSubmitting || disabled}
          loading={isSubmitting}
          title="Save Changes"
          type="submit"
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
  { label: '01:00', value: 1 },
  { label: '02:00', value: 2 },
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
  return utcOffsetInHours <= 0
    ? `+${Math.abs(utcOffsetInHours)}`
    : `-${utcOffsetInHours}`;
};

export default MaintenanceWindow;
