import { yupResolver } from '@hookform/resolvers/yup';
import { useDatabaseMutation } from '@linode/queries';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { updateMaintenanceSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import { Button } from 'akamai-cds-react-components';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

import type { Database, UpdatesSchedule } from '@linode/api-v4/lib/databases';
import type { SelectOption } from '@linode/ui';

interface Props {
  database: Database;
  disabled?: boolean;
  timezone?: string;
}

export const MaintenanceWindow = (props: Props) => {
  const { database, disabled, timezone } = props;

  const [modifiedWeekSelectionMap, setModifiedWeekSelectionMap] =
    React.useState<SelectOption<number>[]>([]);

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

  const onSubmit = async (values: Partial<UpdatesSchedule>) => {
    // @TODO Update this to only send 'updates' and not 'allow_list' when the API supports it.
    // Additionally, at that time, enable the validationSchema which currently does not work
    // because allow_list is a required field in the schema.
    try {
      await updateDatabase({
        allow_list: database.allow_list,
        updates: values as UpdatesSchedule,
      });
      enqueueSnackbar('Maintenance Window settings saved successfully.', {
        variant: 'success',
      });
    } catch (errors) {
      setError('root', { message: errors[0].reason });
    }
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

  const form = useForm<Partial<UpdatesSchedule>>({
    defaultValues: {
      day_of_week: database.updates?.day_of_week ?? 1,
      frequency: database.updates?.frequency ?? 'weekly',
      hour_of_day: database.updates?.hour_of_day ?? 20,
      week_of_month: getInitialWeekOfMonth(),
    },
    mode: 'onBlur',
    resolver: yupResolver(updateMaintenanceSchema),
  });

  const {
    control,
    formState: { isSubmitting, isDirty, errors },
    handleSubmit,
    setValue,
    setError,
  } = form;

  const [dayOfWeek, hourOfDay, frequency, weekOfMonth] = useWatch({
    control,
    name: ['day_of_week', 'hour_of_day', 'frequency', 'week_of_month'],
  });

  const isLegacy = database.platform === 'rdbms-legacy';

  const typographyLegacyDatabase =
    'Select when you want the required OS and database engine updates to take place. The maintenance may cause downtime on clusters with less than 3 nodes (non high-availability clusters).';

  const typographyDatabase =
    "OS and database engine updates will be performed on the schedule below. Select the frequency, day, and time you'd prefer maintenance to occur.";

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledStack direction="row">
          <Stack>
            <Typography mb={0.5} variant="h3">
              {isLegacy
                ? 'Maintenance Window'
                : 'Set a Weekly Maintenance Window'}
            </Typography>
            {errors.root?.message && (
              <Notice spacingTop={8} variant="error">
                {errors.root?.message}
              </Notice>
            )}
            <StyledTypography>
              {isLegacy ? typographyLegacyDatabase : typographyDatabase}{' '}
              {database.cluster_size !== 3 &&
                'For non-HA plans, expect downtime during this window.'}
            </StyledTypography>
            <Stack direction="row" mt={2} spacing={6}>
              <FormControl>
                <Controller
                  control={control}
                  name="day_of_week"
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      autoHighlight
                      disableClearable
                      disabled={disabled}
                      errorText={fieldState.error?.message}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      label="Day of Week"
                      noMarginTop
                      onChange={(_, day) => {
                        field.onChange(day.value);
                        weekSelectionModifier(day.label, weekSelectionMap);
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
                        (thisOption) => thisOption.value === dayOfWeek
                      )}
                    />
                  )}
                />
              </FormControl>
              <FormControl>
                <div style={{ alignItems: 'center', display: 'flex' }}>
                  <Controller
                    control={control}
                    name="hour_of_day"
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        autoHighlight
                        defaultValue={hourSelectionMap.find(
                          (option) => option.value === 20
                        )}
                        disableClearable
                        disabled={disabled}
                        errorText={fieldState.error?.message}
                        label="Time"
                        noMarginTop
                        onChange={(_, hour) => {
                          field.onChange(hour?.value);
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
                          (thisOption) => thisOption.value === hourOfDay
                        )}
                      />
                    )}
                  />
                  <TooltipIcon
                    status="info"
                    sxTooltipIcon={{
                      marginTop: '1.75rem',
                      padding: '0px 8px',
                    }}
                    text={
                      <Typography>
                        UTC is {utcOffsetText(utcOffsetInHours)} hours compared
                        to your local timezone. Click{' '}
                        <Link to="/profile/display">here</Link> to view or
                        change your timezone settings.
                      </Typography>
                    }
                  />
                </div>
              </FormControl>
            </Stack>
            {isLegacy && (
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <FormControl
                    disabled={disabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e.target.value);
                      if (e.target.value === 'weekly') {
                        // If the frequency is weekly, set the 'week_of_month' field to null since that should only be specified for a monthly frequency.
                        setValue('week_of_month', null);
                      }

                      if (e.target.value === 'monthly') {
                        const _dayOfWeek =
                          daySelectionMap.find(
                            (option) => option.value === dayOfWeek
                          ) ?? daySelectionMap[0];

                        weekSelectionModifier(
                          _dayOfWeek.label,
                          weekSelectionMap
                        );
                        setValue(
                          'week_of_month',
                          modifiedWeekSelectionMap[0].value
                        );
                      }
                    }}
                  >
                    <RadioGroup
                      style={{ marginBottom: 0, marginTop: 0 }}
                      value={frequency}
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
              />
            )}
            <div>
              {frequency === 'monthly' && (
                <Controller
                  control={control}
                  name="week_of_month"
                  render={({ field, fieldState }) => (
                    <FormControl style={{ minWidth: '250px' }}>
                      <Autocomplete
                        autoHighlight
                        defaultValue={modifiedWeekSelectionMap[0]}
                        disableClearable
                        errorText={fieldState.error?.message}
                        label="Repeats on"
                        noMarginTop
                        onChange={(_, week) => {
                          field.onChange(week.value);
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
                          (thisOption) => thisOption.value === weekOfMonth
                        )}
                      />
                    </FormControl>
                  )}
                />
              )}
            </div>
          </Stack>
          <StyledButtonStack>
            <Button
              data-testid="save-changes-button"
              disabled={!isDirty || isSubmitting || disabled}
              processing={isSubmitting}
              title="Save Changes"
              type="submit"
              variant="primary"
            >
              Save Changes
            </Button>
          </StyledButtonStack>
        </StyledStack>
      </form>
    </FormProvider>
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

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginBottom: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  width: '65%',
}));

const StyledStack = styled(Stack, {
  label: 'StyledStack',
})(({ theme }) => ({
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const StyledButtonStack = styled(Stack, {
  label: 'StyledButtonStack',
})(({ theme }) => ({
  alignSelf: 'end',
  marginBottom: '1rem',
  marginTop: '1rem',
  minWidth: 214,
  [theme.breakpoints.down('md')]: {
    alignSelf: 'flex-start',
  },
}));
