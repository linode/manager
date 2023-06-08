import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import timezones from 'src/assets/timezones/timezones';
import Typography from 'src/components/core/Typography';
import { CircleProgress } from 'src/components/CircleProgress';
import { DateTime } from 'luxon';
import { styled } from '@mui/material/styles';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { useSnackbar } from 'notistack';

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
  const { mutateAsync: updateProfile, isLoading, error } = useMutateProfile();
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
        <ActionsPanel>
          <StyledButton
            buttonType="primary"
            data-qa-tz-submit
            disabled={disabled}
            loading={isLoading}
            onClick={onSubmit}
          >
            Update Timezone
          </StyledButton>
        </ActionsPanel>
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

const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  minWidth: 180,
  [theme.breakpoints.up('md')]: {
    marginTop: 16,
  },
}));

const StyledLoggedInAsCustomerNotice = styled('div', {
  label: 'StyledLoggedInAsCustomerNotice',
})(({ theme }) => ({
  backgroundColor: theme.color.red,
  padding: 16,
  marginBottom: 8,
  textAlign: 'center',
}));
