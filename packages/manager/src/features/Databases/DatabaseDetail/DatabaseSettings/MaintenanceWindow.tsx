import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormLabel,
  Icon,
  NotificationBanner,
  Select,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDatabaseMutation } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import { updateMaintenanceSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Stack } from '../../shared/Stack/Stack';

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
      toast.open({
        text: 'Maintenance Window settings saved successfully.',
        type: 'success',
      });
      // reset dirty state to disable Save Changes button
      reset(getValues(), { keepValues: true, keepDirty: false });
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
    getValues,
    handleSubmit,
    reset,
    setError,
  } = form;

  const [dayOfWeek, hourOfDay, frequency, weekOfMonth] = useWatch({
    control,
    name: ['day_of_week', 'hour_of_day', 'frequency', 'week_of_month'],
  });

  const typographyDatabase =
    "OS and database engine updates will be performed on the schedule below. Select the frequency, day, and time you'd prefer maintenance to occur.";

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledDiv>
          <Stack>
            <h3 style={{ marginBottom: Spacing.S4, marginTop: 0 }}>
              Set a Weekly Maintenance Window
            </h3>
            {errors.root?.message && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S16, marginTop: Spacing.S8 }}
                text={errors.root?.message}
                type="error"
              >
                {errors.root?.message}
              </NotificationBanner>
            )}
            <StyledParagraph>
              {typographyDatabase}{' '}
              {database.cluster_size !== 3 &&
                'For non-HA plans, expect downtime during this window.'}
            </StyledParagraph>
            <Stack
              direction="row"
              spacing={Spacing.S6}
              style={{ marginTop: Spacing.S16 }}
            >
              <Controller
                control={control}
                name="day_of_week"
                render={({ field }) => (
                  <Stack spacing={Spacing.S4}>
                    <FormLabel
                      data-qa-dropdown-label="day-of-week-select"
                      data-qa-textfield-label="Day of Week"
                      slot="label"
                      style={{ marginBottom: Spacing.S8 }}
                    >
                      Day of Week
                    </FormLabel>
                    <div
                      data-qa-autocomplete="Day of Week"
                      style={{ width: '125px' }}
                    >
                      <Select
                        autocomplete
                        id="dayOfWeek"
                        items={daySelectionMap}
                        onChange={(e: CustomEvent) => {
                          const day: { label: string; value: number } =
                            e.detail;
                          field.onChange(day.value);
                          weekSelectionModifier(day.label, weekSelectionMap);
                        }}
                        placeholder="Choose a day"
                        selected={daySelectionMap.find(
                          (thisOption) => thisOption.value === dayOfWeek
                        )}
                        valueFn={(day: { label: string; value: number }) =>
                          `${day.label}`
                        }
                      />
                    </div>
                  </Stack>
                )}
              />
              <Controller
                control={control}
                name="hour_of_day"
                render={({ field }) => (
                  <Stack
                    spacing={Spacing.S4}
                    style={{ marginLeft: Spacing.S48 }}
                  >
                    <FormLabel
                      data-qa-dropdown-label="time-select"
                      data-qa-textfield-label="Time"
                      slot="label"
                      style={{ marginBottom: Spacing.S8 }}
                    >
                      Time
                    </FormLabel>
                    <div data-qa-autocomplete="Time">
                      <div
                        style={{
                          display: 'flex',
                        }}
                      >
                        <div style={{ width: '120px' }}>
                          <Select
                            autocomplete
                            disabled={disabled}
                            id="time"
                            items={hourSelectionMap}
                            onChange={(e: CustomEvent) => {
                              const hour: { label: string; value: number } =
                                e.detail;
                              field.onChange(hour?.value);
                            }}
                            placeholder="Choose a time"
                            selected={hourSelectionMap.find(
                              (thisOption) => thisOption.value === hourOfDay
                            )}
                            valueFn={(time: { label: string }) =>
                              `${time.label}`
                            }
                          />
                        </div>
                        <Tooltip
                          style={{ marginLeft: Spacing.S8 }}
                          tooltipPlacement="bottom"
                          tooltipText={`UTC is ${utcOffsetText(utcOffsetInHours)} hours
                              compared to your local timezone. To view or change your timezone settings, navigate to the Display tab under your profile.`}
                        >
                          <Icon
                            icon="info-outline"
                            size="m"
                            style={{
                              position: 'relative',
                              top: 5,
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </Stack>
                )}
              />
            </Stack>
            <div>
              {frequency === 'monthly' && (
                <Controller
                  control={control}
                  name="week_of_month"
                  render={({ field, fieldState }) => (
                    <div style={{ minWidth: '250px' }}>
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
                    </div>
                  )}
                />
              )}
            </div>
          </Stack>
          <StyledButtonDiv>
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
          </StyledButtonDiv>
        </StyledDiv>
      </form>
    </FormProvider>
  );
};

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

const StyledParagraph = styled('p', {
  label: 'StyledParagraph',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginBottom: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  margin: 0,
  width: '65%',
}));

const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const StyledButtonDiv = styled('div', {
  label: 'StyledButtonDiv',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'end',
  marginBottom: '1rem',
  marginTop: '1rem',
  minWidth: 214,
  [theme.breakpoints.down('md')]: {
    alignSelf: 'flex-start',
  },
}));
