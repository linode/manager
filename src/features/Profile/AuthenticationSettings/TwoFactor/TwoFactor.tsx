import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { disableTwoFactor, getTFAToken } from 'src/services/profile';
import { handleUpdate } from 'src/store/reducers/resources/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import EnableTwoFactorForm from './EnableTwoFactorForm';

type ClassNames = 'root'
  | 'container'
  | 'title'
  | 'visibility'
  | 'showHideText';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
    root: {
      padding: theme.spacing.unit * 3,
      paddingBottom: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
    },
    container: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      justifyContent: 'left',
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
    },
    title: {
      marginBottom: theme.spacing.unit,
    },
    visibility: {
      color: theme.palette.primary.main,
      padding: 0,
      border: 0,
    },
    showHideText: {
      fontSize: '1rem',
      marginLeft: theme.spacing.unit * 2,
      color: theme.palette.text.primary,
    },
  });

interface Props {
  clearState: () => void;
}

interface ConfirmDisable {
  open: boolean;
  submitting: boolean;
  error?: string;
}

interface State {
  disableDialog: ConfirmDisable;
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  secret: string;
  showQRCode: boolean;
  success?: string;
  twoFactorEnabled?: boolean;
  twoFactorConfirmed?: boolean;
}

type CombinedProps = Props & StateProps & DispatchProps & WithStyles<ClassNames>;

export class TwoFactor extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    errors: undefined,
    loading: false,
    secret: '',
    showQRCode: false,
    success: undefined,
    twoFactorEnabled: this.props.twoFactor,
    twoFactorConfirmed: this.props.twoFactor,
    disableDialog: {
      open: false,
      error: undefined,
      submitting: false,
    }
  }

  /*
  * @todo This logic can be removed when IP Whitelisting (legacy)
  * has been fully deprecated.
  */
  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (prevState.twoFactorEnabled !== this.state.twoFactorEnabled) {
      this.props.clearState();
    }
    if (prevProps.twoFactor !== this.props.twoFactor) {
      this.setState({ twoFactorConfirmed: this.props.twoFactor });
    }
  }

  openDisableDialog = () => {
    this.setState({ disableDialog: { open: true, error: undefined, submitting: false, } });
  }

  closeDisableDialog = () => {
    this.setState({
      // If cancelling a disable action, TFA must still be enabled
      twoFactorEnabled: true,
      disableDialog: {
        error: undefined,
        open: false,
        submitting: false,
  }
    });
  }

  confirmToken = () => {
    this.props.actions.updateProfile({
      ...this.props.profile,
      two_factor_auth: true,
    });
    this.setState({
      success: "Two-factor authentication has been enabled.",
      showQRCode: false,
      twoFactorEnabled: true,
      twoFactorConfirmed: true,
    })
  }

  disableTFA = () => {
    disableTwoFactor()
    .then((response) => {
      this.props.actions.updateProfile({
          ...this.props.profile,
        two_factor_auth: false,
      });
      this.setState({
        success: "Two-factor authentication has been disabled.",
        twoFactorEnabled: false,
        twoFactorConfirmed: false,
        disableDialog: {
          error: undefined,
          open: false,
          success: undefined,
          submitting: false,
        }
      });
    })
    .catch((error) => {
      const fallbackError = [{ reason: 'There was an error disabling TFA.' }];
      const disableError = pathOr(fallbackError, ['response', 'data', 'errors'], error);
      this.setState({
        twoFactorEnabled: true,
        disableDialog: {
          error: disableError[0].reason,
          submitting: false,
          open: true,
          success: undefined,
        }
      });
    })
  }

  getActions = () => {
    return (
      <ActionsPanel>
        <Button
          onClick={this.closeDisableDialog}
          type="cancel"
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          loading={this.state.disableDialog.submitting}
          onClick={this.disableTFA}
          data-qa-submit
        >
          Disable Two-factor Authenitcation
        </Button>
      </ActionsPanel>
    )
  }

  getToken = () => {
    this.setState({ loading: true });
    getTFAToken()
      .then((response) => {
        this.setState({ secret: response.data.secret, loading: false })
      })
      .catch((error) => {
        const fallbackError = [{ reason: 'There was an error retrieving your secret key. Please try again.' }];
        this.setState({
            errors: pathOr(fallbackError, ['response', 'data', 'errors'], error),
            loading: false,
            twoFactorEnabled: false,
          }, () => {
          scrollErrorIntoView();
        });
      });
  }

  toggleHidden = () => {
    const { showQRCode } = this.state;
    if (!showQRCode) {
      this.getToken();
    }
    this.setState({ showQRCode: !this.state.showQRCode });
  }

  toggleTwoFactorEnabled = () => {
    this.setState({ errors: undefined, success: undefined });
    const { twoFactorEnabled, twoFactorConfirmed } = this.state;
    const toggle = !twoFactorEnabled;
    if (toggle) {
      // Enable TFA. Ask the API for a TFA secret.
      this.setState({ twoFactorEnabled: true, loading: true, showQRCode: true, });
      this.getToken();
    } else {
      // If TFA isn't active on the account,
      // there's nothing to do here; just flip the toggle.
      if (!twoFactorConfirmed) {
        this.setState({ twoFactorEnabled: false })
        return;
      }
      // Deactivate TFA.
      // This is destructive (sort of), so
      // open a confirmation dialog.
      this.openDisableDialog();
    }
  }

  render() {
    const { classes, username } = this.props;
    const { errors, loading, secret, showQRCode, success, twoFactorEnabled, twoFactorConfirmed } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          {success && <Notice success text={success} />}
          {generalError && <Notice error text={generalError} />}
          <Typography
            role="header"
            variant="title"
            className={classes.title}
            data-qa-title
          >
              Two-Factor Authentication (TFA)
          </Typography>
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
          <Typography
              variant="body1"
              data-qa-copy
          >
            Two-factor authentication increases the security of your Linode account by requiring two different
            forms of authentication to log in: your account password and a security token. You can set up a
            third party app such as Authy or Google Authenticator to generate these tokens for you.
          </Typography>
          {twoFactorEnabled &&
            <div className={classes.container}>
              {showQRCode
                ? <Button
                    type="secondary"
                    className={classes.visibility}
                    onClick={this.toggleHidden}
                    destructive
                  >
                    <SettingsBackupRestore />
                    <span className={classes.showHideText}>Hide QR Code</span>
                  </Button>
                : <Button
                    type="secondary"
                    className={classes.visibility}
                    onClick={this.toggleHidden}
                  >
                    <SettingsBackupRestore />
                    <span className={classes.showHideText}>{twoFactorConfirmed ? "Reset two-factor authentication" : "Show QR Code"}</span>
                  </Button>
              }
            </div>
          }
          {twoFactorEnabled && showQRCode && username && twoFactorConfirmed !== undefined &&
            <EnableTwoFactorForm
              secret={secret}
              username={username}
              loading={loading}
              onSuccess={this.confirmToken}
              twoFactorConfirmed={twoFactorConfirmed}
            />
          }
        </Paper>
        <ConfirmationDialog
          open={this.state.disableDialog.open}
          title="Disable Two-Factor Authentication"
          onClose={this.closeDisableDialog}
          actions={this.getActions}
        >
          {this.state.disableDialog.error &&
          <Notice error text={this.state.disableDialog.error} />
        }
        <Typography>Are you sure you want to disable two-factor authentication?</Typography>
      </ConfirmationDialog>
    </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  profile?: Linode.Profile;
  twoFactor?: boolean;
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => ({
  profile: path(['data'], state.__resources.profile),
  twoFactor: path(['data', 'two_factor_auth'], state.__resources.profile),
  username: path(['data', 'username'], state.__resources.profile),
});

interface DispatchProps {
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => ({
  actions: {
    updateProfile: (profile: Linode.Profile) => dispatch(handleUpdate(profile)),
  }
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<any, any, any>(styled, connected);

export default enhanced(TwoFactor);
