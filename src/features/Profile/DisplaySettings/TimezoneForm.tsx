import * as moment from 'moment-timezone';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import timezones from 'src/assets/timezones/timezones';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import { updateProfile } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'select' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 3,
  },
  select: {
    maxWidth: '30%',  
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  timezone: string;
  updateProfile: (v: Linode.Profile) => void;
}

interface State {
  updatedTimezone: string;
  inputValue: string;
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  success?: string;
}

interface Timezone {
  label: string;
  name: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const renderTimezoneOffset = (tz:Timezone) => {
  const offset = moment.tz(tz.name).format("Z");
  return `\(GMT ${offset}\) ${tz.label}`;
}

const renderTimeZonesList = () => {
  return timezones.map((tz:Timezone) => {
    const label = renderTimezoneOffset(tz);
    return { label, value: tz.name}
  });
}

const timezoneList = renderTimeZonesList();

export class TimezoneForm extends React.Component<CombinedProps, State> {
  state: State = {
    updatedTimezone: '',
    inputValue: '',
    errors: undefined,
    submitting: false,
    success: undefined,
  }

  getTimezone = (timezoneValue:string) => {
    const idx = timezoneList.findIndex((el) => {
      return el.value === timezoneValue;
    });
    return timezoneList[idx];
  }

  handleTimezoneChange = (timezone: Item) => {
    if (timezone) { this.setState(set(lensPath(['updatedTimezone']), timezone.value)); }
  }

  onCancel = () => {
    this.setState({
      submitting: false,
      errors: undefined,
      success: undefined,
      updatedTimezone: this.props.timezone || '',
    })
  }

  onInputValueChange = (inputValue:string) => {
    this.setState({ inputValue });
  }

  onSubmit = () => {
    const { updatedTimezone } = this.state;
    this.setState({ errors: undefined, submitting: true });

    updateProfile({ timezone: updatedTimezone, })
      .then((response) => {
        this.props.updateProfile(response);
        this.setState({
          submitting: false,
          success: 'Account timezone updated.',
        })
      })
      .catch((error) => {
        const fallbackError = [{ reason: 'An unexpected error has occured.' }];
        this.setState({
          submitting: false,
          errors: pathOr(fallbackError, ['response', 'data', 'errors'], error),
          success: undefined,
        }, () => {
          scrollErrorIntoView();
        })
      });
  };

  render() {
    const { classes, timezone } = this.props;
    const { errors, inputValue, submitting, success, updatedTimezone } = this.state;
    const timezoneDisplay = pathOr(timezone, ['label'], this.getTimezone(timezone));

    const hasErrorFor = getAPIErrorFor({
        timezone: 'timezone',
      }, errors);
      const generalError = hasErrorFor('none');
      const timezoneError = hasErrorFor('timezone');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          {success && <Notice success text={success} />}
          {generalError && <Notice error text={generalError} />}
          <Typography
            variant="body1"
            data-qa-copy
          >
            This setting converts the dates and times displayed in the Linode Manager
            to a timezone of your choice.
            Your current timezone is: <strong>{timezoneDisplay}</strong>.
          </Typography>
          <React.Fragment>
            <EnhancedSelect
              className={classes.select}
              options={timezoneList}
              errorText={timezoneError}
              label='Timezone'
              onSubmit={this.onSubmit}
              value={updatedTimezone}
              placeholder={"Choose a timezone."}
              handleSelect={this.handleTimezoneChange}
              inputValue={inputValue}
              onInputValueChange={this.onInputValueChange}
              data-qa-tz-select
            />
            <ActionsPanel>
              <Button
                type="primary"
                onClick={this.onSubmit}
                loading={submitting}
                data-qa-tz-submit
              >
                Save
              </Button>
              <Button
                type="cancel"
                onClick={this.onCancel}
                data-qa-tz-cancel
              >
                Cancel
              </Button>
            </ActionsPanel>
          </React.Fragment>
        </Paper>
      </React.Fragment>)
    }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TimezoneForm);