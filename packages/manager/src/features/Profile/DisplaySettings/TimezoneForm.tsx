import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import timezones from 'src/assets/timezones/timezones';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'copy' | 'button' | 'loggedInAsCustomerNotice';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down('md')]: {
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
  });

interface Props {
  timezone: string;
  loggedInAsCustomer: boolean;
  updateTimezone: (newTimezone: string) => Promise<Profile>;
  errors?: APIError[];
}

interface State {
  updatedTimezone: Item | null;
  inputValue: string;
  submitting: boolean;
  success?: string;
  errors?: APIError[];
}

interface Timezone {
  label: string;
  name: string;
  offset: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const formatOffset = (offset: number, label: string) => {
  const remainder = Math.abs(offset) % 1;
  // Translate a decimal to minutes.
  // Example: (0.75 * 100) / (100 / 60) = 0.45
  const minutes = (remainder * 100) / (100 / 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const isPositive = Math.abs(offset) === offset ? '+' : '-';
  const rounded = Math.floor(Math.abs(offset));
  return `\(GMT ${isPositive}${rounded}:${formattedMinutes}\) ${label}`;
};

const renderTimeZonesList = (): Item[] => {
  return timezones.map((tz: Timezone) => {
    const label = formatOffset(tz.offset, tz.label);
    return { label, value: tz.name };
  });
};

const timezoneList = renderTimeZonesList();

export class TimezoneForm extends React.Component<CombinedProps, State> {
  state: State = {
    updatedTimezone: null,
    inputValue: '',
    submitting: false,
    success: undefined,
    errors: this.props.errors,
  };

  getTimezone = (timezoneValue: string) => {
    const idx = timezoneList.findIndex((el) => {
      return el.value === timezoneValue;
    });
    return timezoneList[idx];
  };

  handleTimezoneChange = (timezone: Item) => {
    if (timezone) {
      this.setState(set(lensPath(['updatedTimezone']), timezone));
    } else {
      this.setState({ success: undefined });
    }
  };

  onSubmit = () => {
    const { updatedTimezone } = this.state;
    if (!updatedTimezone) {
      return;
    }
    this.setState({ submitting: true, success: undefined });

    this.props
      .updateTimezone(updatedTimezone.value as string)
      .then(() => {
        this.setState({
          submitting: false,
          success: 'Account timezone updated.',
          updatedTimezone: null,
          errors: undefined,
        });
      })
      .catch((e) => {
        this.setState(
          {
            submitting: false,
            success: undefined,
            errors: e,
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const { classes, loggedInAsCustomer, timezone } = this.props;
    const { errors, submitting, success, updatedTimezone } = this.state;
    const timezoneDisplay = pathOr(
      timezone,
      ['label'],
      this.getTimezone(timezone)
    );

    const hasErrorFor = getAPIErrorFor(
      {
        timezone: 'timezone',
      },
      errors
    );
    const generalError = hasErrorFor('none');
    const timezoneError = hasErrorFor('timezone');

    const defaultTimeZone = timezoneList.find((eachZone) => {
      return eachZone.label === timezoneDisplay;
    });

    return (
      <>
        {loggedInAsCustomer ? (
          <div
            className={classes.loggedInAsCustomerNotice}
            data-qa-admin-notice
          >
            <Typography variant="h2">
              While you are logged in as a customer, all times, dates, and
              graphs will be displayed in your browser&rsquo;s timezone (
              {timezone}).
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
            errorText={timezoneError}
            onChange={this.handleTimezoneChange}
            data-qa-tz-select
            defaultValue={defaultTimeZone}
            isClearable={false}
            label="Timezone"
          />
          <ActionsPanel>
            <Button
              className={classes.button}
              buttonType="primary"
              onClick={this.onSubmit}
              disabled={updatedTimezone === null}
              loading={submitting}
              data-qa-tz-submit
            >
              Update Timezone
            </Button>
          </ActionsPanel>
        </Box>
        {success ? (
          <Notice success text={success} spacingTop={8} spacingBottom={8} />
        ) : null}
        {generalError ? (
          <Notice error text={generalError} spacingTop={8} spacingBottom={8} />
        ) : null}
      </>
    );
  }
}

const styled = withStyles(styles);

export default styled(TimezoneForm);
