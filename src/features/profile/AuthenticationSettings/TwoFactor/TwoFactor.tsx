import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import {
    StyleRulesCallback,
    Theme,
    WithStyles,
    withStyles,
} from '@material-ui/core/styles';  
import Typography from '@material-ui/core/Typography';

import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import EnableTwoFactorForm from './EnableTwoFactorForm';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
    root: {
      padding: theme.spacing.unit * 3,
      paddingBottom: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
    },
    title: {
      marginBottom: theme.spacing.unit * 2,
    },
  });

interface Props {
  twoFactor: boolean;
  updateProfile: (v: Partial<Linode.Profile>) => void;
}

interface State {
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  twoFactorEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const L = {
  twoFactorEnabled: lensPath(['twoFactorEnabled']),
};

export class TwoFactor extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    errors: undefined,
    submitting: false,
    twoFactorEnabled: this.props.twoFactor || false,
  }

  componentDidMount () {
    this.mounted = true;
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  onSubmit = () => {
    this.setState({ errors: undefined, submitting: true });

    // This feature can only be disabled.
    updateProfile({ ip_whitelist_enabled: false, })
      .then((response) => {
        this.props.updateProfile(response);
        if (this.mounted) {
            this.setState({
              submitting: false,
              errors: undefined,
            })
        }
      })
      .catch((error) => {
        if (!this.mounted) { return; }
        const fallbackError = [{ reason: 'An unexpected error occured.' }];
        this.setState({
            submitting: false,
            errors: pathOr(fallbackError, ['response', 'data', 'errors'], error),
        }, () => {
            scrollErrorIntoView();
        })
      });
  };

  toggleTwoFactorEnabled = () => {
    this.setState(set(L.twoFactorEnabled, !this.state.twoFactorEnabled));
  }

  render() {
    const { classes, } = this.props;
    const { errors, submitting, twoFactorEnabled } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
        <Paper className={classes.root}>
          <Typography
              variant="title"
              className={classes.title}
              data-qa-title
          >
              Two-Factor Authentication
          </Typography>
          <Typography
              variant="body1"
              data-qa-copy
          >
            Two-factor authentication increases the security of your Linode account by requiring two different
            forms of authentication to log in: your account password and a security token. You can set up a
            third party app such as Authy or Google Authenticator to generate these tokens for you.
          </Typography>
          {generalError && <Notice error text={generalError} />}
          <FormControl fullWidth>
            <FormControlLabel
              label={twoFactorEnabled ? "Enabled" : "Disabled"}
              control={
              <Toggle
                  checked={twoFactorEnabled}
                  onChange={this.toggleTwoFactorEnabled}
              />
              }
            />
          </FormControl>
          {twoFactorEnabled &&
            <EnableTwoFactorForm

            />
          }
        </Paper>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TwoFactor);