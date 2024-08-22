import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import timezones from 'src/assets/timezones/timezones';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { CircleProgress } from 'src/components/CircleProgress';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';

interface Props {
  loggedInAsCustomer: boolean;
}

interface Timezone {
  label: string;
  name: string;
  offset: number;
}

interface TimezoneOption {
  label: string;
  value: string;
}

export const formatOffset = ({ label, offset }: Timezone) => {
  const minutes = (Math.abs(offset) % 60).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hours = Math.floor(Math.abs(offset) / 60);
  const isPositive = Math.abs(offset) === offset ? '+' : '-';

  return `\(GMT ${isPositive}${hours}:${minutes}\) ${label}`;
};

const renderTimezonesList = () => {
  return timezones
    .map((tz) => ({ ...tz, offset: DateTime.now().setZone(tz.name).offset }))
    .sort((a, b) => a.offset - b.offset)
    .map((tz: Timezone) => {
      const label = formatOffset(tz);
      return { label, value: tz.name };
    });
};

const timezoneList: TimezoneOption[] = renderTimezonesList();

export const TimezoneForm = (props: Props) => {
  const { loggedInAsCustomer } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { error, isLoading, mutateAsync: updateProfile } = useMutateProfile();
  const [timezoneValue, setTimezoneValue] = React.useState<null | string>(null);
  const timezone = profile?.timezone ?? '';

  const handleTimezoneChange = (timezone: string) => {
    setTimezoneValue(timezone);
  };

  const onSubmit = () => {
    if (timezoneValue === null) {
      return;
    }

    updateProfile({ timezone: timezoneValue }).then(() => {
      enqueueSnackbar('Successfully updated timezone', { variant: 'success' });
    });
  };

  const defaultTimezone = timezoneList.find((eachZone) => {
    return eachZone.value === timezone;
  });

  const disabled =
    timezoneValue === null || defaultTimezone?.value === timezoneValue;

  if (!profile) {
    return <CircleProgress />;
  }

  return (
    <>
      {loggedInAsCustomer ? (
        <StyledLoggedInAsCustomerNotice data-testid="admin-notice">
          <Typography variant="h2">
            While you are logged in as a customer, all times, dates, and graphs
            will be displayed in your browser&rsquo;s timezone ({timezone}).
          </Typography>
        </StyledLoggedInAsCustomerNotice>
      ) : null}
      <StyledRootContainer>
        <Stack>
          <Autocomplete
            value={timezoneList.find(
              (option) => option.value === timezoneValue
            )}
            data-qa-tz-select
            defaultValue={defaultTimezone}
            disableClearable
            errorText={error?.[0].reason}
            label="Timezone"
            onChange={(_, option) => handleTimezoneChange(option.value)}
            options={timezoneList}
            placeholder="Choose a Timezone"
            sx={{ width: '416px' }}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            disabled,
            label: 'Update Timezone',
            loading: isLoading,
            onClick: onSubmit,
            sx: {
              margin: '0',
              minWidth: 180,
            },
          }}
          sx={{
            padding: 0,
          }}
        />
      </StyledRootContainer>
    </>
  );
};

const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  alignItems: 'flex-end',
  display: 'flex',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

const StyledLoggedInAsCustomerNotice = styled('div', {
  label: 'StyledLoggedInAsCustomerNotice',
})(({ theme }) => ({
  backgroundColor: theme.color.red,
  marginBottom: 8,
  padding: 16,
  textAlign: 'center',
}));
