import { Theme, styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import timezones from 'src/assets/timezones/timezones';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Typography } from 'src/components/Typography';
import { useMutateProfile, useProfile } from 'src/queries/profile';

interface Props {
  loggedInAsCustomer: boolean;
}

interface Timezone {
  label: string;
  name: string;
  offset: number;
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

const renderTimeZonesList = (): Item<string>[] => {
  return timezones
    .map((tz) => ({ ...tz, offset: DateTime.now().setZone(tz.name).offset }))
    .sort((a, b) => a.offset - b.offset)
    .map((tz: Timezone) => {
      const label = formatOffset(tz);
      return { label, value: tz.name };
    });
};

const timezoneList = renderTimeZonesList();

export const TimezoneForm = (props: Props) => {
  const { loggedInAsCustomer } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { error, isLoading, mutateAsync: updateProfile } = useMutateProfile();
  const [value, setValue] = React.useState<Item<string> | null>(null);
  const timezone = profile?.timezone ?? '';

  const handleTimezoneChange = (timezone: Item<string>) => {
    setValue(timezone);
  };

  const onSubmit = () => {
    if (value === null) {
      return;
    }

    updateProfile({ timezone: String(value.value) }).then(() => {
      enqueueSnackbar('Successfully updated timezone', { variant: 'success' });
    });
  };

  const defaultTimeZone = timezoneList.find((eachZone) => {
    return eachZone.value === timezone;
  });

  const disabled = value === null || defaultTimeZone?.value === value?.value;

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
      <StyledRootContainer display="flex" justifyContent="space-between">
        <Select
          data-qa-tz-select
          defaultValue={defaultTimeZone}
          errorText={error?.[0].reason}
          isClearable={false}
          label="Timezone"
          onChange={handleTimezoneChange}
          options={timezoneList}
          placeholder={'Choose a Timezone'}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled,
            label: 'Update Timezone',
            loading: isLoading,
            onClick: onSubmit,
            sx: {
              marginTop: (theme: Theme) => (theme.breakpoints.up('md') ? 2 : 0),
              minWidth: 180,
            },
          }}
        />
      </StyledRootContainer>
    </>
  );
};

const StyledRootContainer = styled(Box, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
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
