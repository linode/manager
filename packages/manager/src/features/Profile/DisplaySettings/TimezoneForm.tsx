import * as React from 'react';
import timezones from 'src/assets/timezones/timezones';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import CircleProgress from 'src/components/CircleProgress';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useSnackbar } from 'notistack';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  button: {
    minWidth: 180,
    [theme.breakpoints.up('md')]: {
      marginTop: 16,
    },
  },
  loggedInAsCustomerNotice: {
    backgroundColor: 'pink',
    padding: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
}));

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

const renderTimeZonesList = (): Item[] => {
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
  const classes = useStyles();
  const { loggedInAsCustomer } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile, isLoading, error } = useMutateProfile();
  const [value, setValue] = React.useState<Item | null>(null);

  const timezone = profile?.timezone ?? '';

  const handleTimezoneChange = (timezone: Item) => {
    setValue(timezone);
  };

  const onSubmit = () => {
    if (value === null) {
      return;
    }

    updateProfile({ timezone: String(value.value) }).then(() => {
      enqueueSnackbar('Successfully update timezone', { variant: 'success' });
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
        <div
          className={classes.loggedInAsCustomerNotice}
          data-testid="admin-notice"
        >
          <Typography variant="h2">
            While you are logged in as a customer, all times, dates, and graphs
            will be displayed in your browser&rsquo;s timezone ({timezone}).
          </Typography>
        </div>
      ) : null}
      <Box
        display="flex"
        justifyContent="space-between"
        className={classes.root}
      >
        <Select
          options={timezoneList}
          placeholder={'Choose a Timezone'}
          errorText={error?.[0].reason}
          onChange={handleTimezoneChange}
          data-qa-tz-select
          defaultValue={defaultTimeZone}
          isClearable={false}
          label="Timezone"
        />
        <ActionsPanel>
          <Button
            className={classes.button}
            buttonType="primary"
            onClick={onSubmit}
            disabled={disabled}
            loading={isLoading}
            data-qa-tz-submit
          >
            Update Timezone
          </Button>
        </ActionsPanel>
      </Box>
    </>
  );
};

export default TimezoneForm;
