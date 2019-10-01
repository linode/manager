import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import timezones from 'src/assets/timezones/timezones';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      marginTop: theme.spacing(3)
    },
    select: {},
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  timezone: string;
  loggedInAsCustomer: boolean;
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
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

const formatOffset = (offset: number, label: string) => {
  const isHalfHour = offset % 1 === 0.5 ? ':30' : ':00';
  const isPositive = Math.abs(offset) === offset ? '+' : '-';
  const rounded = Math.floor(Math.abs(offset));
  return `\(GMT ${isPositive}${rounded}${isHalfHour}\) ${label}`;
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
    errors: this.props.errors
  };

  getTimezone = (timezoneValue: string) => {
    const idx = timezoneList.findIndex(el => {
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
    this.setState({ submitting: true });

    this.props
      .updateProfile({ timezone: updatedTimezone.value as string })
      .then(() => {
        this.setState({
          submitting: false,
          success: 'Account timezone updated.',
          errors: undefined
        });
      })
      .catch(e => {
        this.setState(
          {
            submitting: false,
            success: undefined,
            errors: e
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const { classes, loggedInAsCustomer, timezone } = this.props;
    const { errors, submitting, success } = this.state;
    const timezoneDisplay = pathOr(
      timezone,
      ['label'],
      this.getTimezone(timezone)
    );

    const hasErrorFor = getAPIErrorFor(
      {
        timezone: 'timezone'
      },
      errors
    );
    const generalError = hasErrorFor('none');
    const timezoneError = hasErrorFor('timezone');

    const defaultTimeZone = timezoneList.find(eachZone => {
      return eachZone.label === timezoneDisplay;
    });

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          {loggedInAsCustomer && (
            <div
              style={{
                backgroundColor: 'pink',
                padding: '1em',
                marginBottom: '0.5em',
                textAlign: 'center'
              }}
              data-qa-admin-notice
            >
              <Typography style={{ fontSize: '1.2em', color: 'black' }}>
                {`While you are logged in as a customer, all times, dates, and graphs will be displayed in your browser's timezone (${timezone}).`}
              </Typography>
            </div>
          )}
          {success && <Notice success text={success} />}
          {generalError && <Notice error text={generalError} />}
          <Typography variant="body1" data-qa-copy>
            This setting converts the dates and times displayed in the Linode
            Manager to a timezone of your choice.{' '}
          </Typography>
          <React.Fragment>
            <Select
              options={timezoneList}
              placeholder={'Choose a timezone'}
              errorText={timezoneError}
              onChange={this.handleTimezoneChange}
              data-qa-tz-select
              defaultValue={defaultTimeZone}
              isClearable={false}
            />
            <ActionsPanel>
              <Button
                buttonType="primary"
                onClick={this.onSubmit}
                loading={submitting}
                data-qa-tz-submit
              >
                Save
              </Button>
            </ActionsPanel>
          </React.Fragment>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TimezoneForm);
