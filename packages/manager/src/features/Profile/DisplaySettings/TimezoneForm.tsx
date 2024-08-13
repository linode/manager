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

interface TimeZone {
  label: string;
  name: string;
  offset: number;
}

interface TimeZoneOption {
  label: string;
  value: string;
}

export const formatOffset = ({ label, offset }: TimeZone) => {
  const minutes = (Math.abs(offset) % 60).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hours = Math.floor(Math.abs(offset) / 60);
  const isPositive = Math.abs(offset) === offset ? '+' : '-';

  return `\(GMT ${isPositive}${hours}:${minutes}\) ${label}`;
};

const renderTimeZonesList = () => {
  return timezones
    .map((tz) => ({ ...tz, offset: DateTime.now().setZone(tz.name).offset }))
    .sort((a, b) => a.offset - b.offset)
    .map((tz: TimeZone) => {
      const label = formatOffset(tz);
      return { label, value: tz.name };
    });
};

const timeZoneList: TimeZoneOption[] = renderTimeZonesList();

export const TimeZoneForm = (props: Props) => {
  const { loggedInAsCustomer } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { error, isLoading, mutateAsync: updateProfile } = useMutateProfile();
  const [timeZoneValue, setTimeZoneValue] = React.useState<null | string>(null);
  const timeZone = profile?.timezone ?? '';

  const handleTimeZoneChange = (timezone: string) => {
    setTimeZoneValue(timezone);
  };

  const onSubmit = () => {
    if (timeZoneValue === null) {
      return;
    }

    updateProfile({ timezone: timeZoneValue }).then(() => {
      enqueueSnackbar('Successfully updated timezone', { variant: 'success' });
    });
  };

  const defaultTimeZone = timeZoneList.find((eachZone) => {
    return eachZone.value === timeZone;
  });

  const disabled =
    timeZoneValue === null || defaultTimeZone?.value === timeZoneValue;

  if (!profile) {
    return <CircleProgress />;
  }

  return (
    <>
      {loggedInAsCustomer ? (
        <StyledLoggedInAsCustomerNotice data-testid="admin-notice">
          <Typography variant="h2">
            While you are logged in as a customer, all times, dates, and graphs
            will be displayed in your browser&rsquo;s time zone ({timeZone}).
          </Typography>
        </StyledLoggedInAsCustomerNotice>
      ) : null}
      <StyledRootContainer>
        <Stack>
          <Autocomplete
            value={timeZoneList.find(
              (option) => option.value === timeZoneValue
            )}
            data-qa-tz-select
            defaultValue={defaultTimeZone}
            disableClearable
            errorText={error?.[0].reason}
            label="Time Zone"
            onChange={(_, option) => handleTimeZoneChange(option.value)}
            options={timeZoneList}
            placeholder="Choose a Time Zone"
            sx={{ width: '416px' }}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            disabled,
            label: 'Update Time Zone',
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
