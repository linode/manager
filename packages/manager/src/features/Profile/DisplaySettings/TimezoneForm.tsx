import { useMutateProfile, useProfile } from '@linode/queries';
import { Autocomplete, Button, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { timezones } from 'src/assets/timezones/timezones';
import { useAuthentication } from 'src/hooks/useAuthentication';

import type { Profile } from '@linode/api-v4';

type Timezone = typeof timezones[number];

export const getOptionLabel = ({ label, offset }: Timezone) => {
  const minutes = (Math.abs(offset) % 60).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hours = Math.floor(Math.abs(offset) / 60);
  const isPositive = Math.abs(offset) === offset ? '+' : '-';

  return `(GMT ${isPositive}${hours}:${minutes}) ${label}`;
};

const getTimezoneOptions = () => {
  return timezones
    .map((tz) => {
      // We use Luxon to get the offset because it correctly factors in Daylight Savings Time (see https://github.com/linode/manager/pull/8526)
      const offset = DateTime.now().setZone(tz.name).offset;
      const label = getOptionLabel({ ...tz, offset });
      return { label, offset, value: tz.name };
    })
    .sort((a, b) => a.offset - b.offset);
};

const timezoneOptions = getTimezoneOptions();

type Values = Pick<Profile, 'timezone'>;

export const TimezoneForm = () => {
  const { loggedInAsCustomer } = useAuthentication();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const values = { timezone: profile?.timezone ?? '' };

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<Values>({
    defaultValues: values,
    values,
  });

  const onSubmit = async (values: Values) => {
    try {
      await updateProfile(values);
      enqueueSnackbar('Successfully updated timezone.', { variant: 'success' });
    } catch (error) {
      setError('timezone', { message: error[0].reason });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {loggedInAsCustomer && (
        <Notice dataTestId="admin-notice" variant="error">
          While you are logged in as a customer, all times, dates, and graphs
          will be displayed in the user&rsquo;s timezone ({profile?.timezone}).
        </Notice>
      )}
      <SingleTextFieldFormContainer>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              value={
                timezoneOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
              autoHighlight
              disableClearable={profile?.timezone !== undefined}
              errorText={fieldState.error?.message}
              fullWidth
              label="Timezone"
              noMarginTop
              onChange={(e, option) => field.onChange(option?.value ?? '')}
              options={timezoneOptions}
              placeholder="Choose a Timezone"
            />
          )}
          control={control}
          name="timezone"
        />
        <Button
          buttonType="primary"
          disabled={!isDirty}
          loading={isSubmitting}
          sx={{ minWidth: 180 }}
          type="submit"
        >
          Update Timezone
        </Button>
      </SingleTextFieldFormContainer>
    </form>
  );
};

export const SingleTextFieldFormContainer = styled('div', {
  label: 'SingleTextFieldFormContainer',
})(({ theme }) => ({
  alignItems: 'flex-end',
  display: 'flex',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: theme.spacing(),
  },
}));
