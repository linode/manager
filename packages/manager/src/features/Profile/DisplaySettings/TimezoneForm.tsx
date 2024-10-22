import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { timezones } from 'src/assets/timezones/timezones';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { useIsLoggedInAsCustomer } from 'src/hooks/useIsLoggedInAsCustomer';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';

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

export const TimezoneForm = () => {
  const loggedInAsCustomer = useIsLoggedInAsCustomer();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { error, isPending, mutateAsync: updateProfile } = useMutateProfile();

  const [timezoneValue, setTimezoneValue] = React.useState(profile?.timezone);

  const onSubmit = () => {
    if (!timezoneValue) {
      enqueueSnackbar('Please select a valid timezone.', { variant: 'error' });
    }

    updateProfile({ timezone: timezoneValue }).then(() => {
      enqueueSnackbar('Successfully updated timezone', { variant: 'success' });
    });
  };

  const disabled = !timezoneValue || profile?.timezone === timezoneValue;

  if (!profile) {
    return <CircleProgress />;
  }

  return (
    <>
      {loggedInAsCustomer && (
        <Notice dataTestId="admin-notice" variant="error">
          While you are logged in as a customer, all times, dates, and graphs
          will be displayed in the user&rsquo;s timezone ({profile.timezone}).
        </Notice>
      )}
      <SingleTextFieldFormContainer>
        <Autocomplete
          value={timezoneOptions.find(
            (option) => option.value === timezoneValue
          )}
          autoHighlight
          disableClearable
          errorText={error?.[0].reason}
          fullWidth
          label="Timezone"
          noMarginTop
          onChange={(e, option) => setTimezoneValue(option.value)}
          options={timezoneOptions}
          placeholder="Choose a Timezone"
        />
        <Button
          buttonType="primary"
          disabled={disabled}
          loading={isPending}
          onClick={onSubmit}
          sx={{ minWidth: 180 }}
        >
          Update Timezone
        </Button>
      </SingleTextFieldFormContainer>
    </>
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
