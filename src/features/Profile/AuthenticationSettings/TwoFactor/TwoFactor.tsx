import { WithStyles } from '@material-ui/core/styles';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import ToggleState from 'src/components/ToggleState';
import { getTFAToken } from 'src/services/profile';
import { handleUpdate } from 'src/store/profile/profile.actions';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import DisableTwoFactorDialog from './DisableTwoFactorDialog';
import EnableTwoFactorForm from './EnableTwoFactorForm';
import ScratchDialog from './ScratchCodeDialog';

type ClassNames =
  | 'root'
  | 'container'
  | 'title'
  | 'helpText'
  | 'visibility'
  | 'showHideText';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(2),
      marginBottom: theme.spacing(3)
    },
    container: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      justifyContent: 'left',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    title: {
      marginBottom: theme.spacing(1)
    },
    helpText: {
      maxWidth: 900
    },
    visibility: {
      color: theme.palette.primary.main,
      padding: 0,
      border: 0
    },
    showHideText: {
      fontSize: '1rem',
      marginLeft: theme.spacing(2),
      color: theme.palette.text.primary
    }
  });

interface Props {
  clearState: () => void;
  twoFactor?: boolean;
  username?: string;
  updateProfile: (profile: Partial<Linode.Profile>) => void;
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
  scratchCode: string;
}

type CombinedProps = Props &
  StateProps &
  DispatchProps &
  WithStyles<ClassNames>;

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
      submitting: false
    },
    scratchCode: ''
  };

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
    this.setState({
      disableDialog: { open: true, error: undefined, submitting: false }
    });
  };

  closeDisableDialog = () => {
    this.setState({
      // If cancelling a disable action, TFA must still be enabled
      twoFactorEnabled: true,
      disableDialog: {
        error: undefined,
        open: false,
        submitting: false
      }
    });
  };

  confirmToken = (scratchCode: string) => {
    this.props.actions.updateProfile({
      ...this.props.profile,
      two_factor_auth: true
    });
    this.setState({
      success: 'Two-factor authentication has been enabled.',
      showQRCode: false,
      twoFactorEnabled: true,
      twoFactorConfirmed: true,
      scratchCode
    });
  };

  disableTFASuccess = () => {
    this.props.actions.updateProfile({
      ...this.props.profile,
      two_factor_auth: false
    });
    this.setState({
      success: 'Two-factor authentication has been disabled.',
      twoFactorEnabled: false,
      twoFactorConfirmed: false
    });
  };

  getToken = () => {
    this.setState({ loading: true });
    return getTFAToken()
      .then(response => {
        this.setState({
          secret: response.data.secret,
          loading: false,
          errors: undefined
        });
      })
      .catch(error => {
        this.setState(
          {
            errors: getAPIErrorOrDefault(
              error,
              'There was an error retrieving your secret key. Please try again.'
            ),
            loading: false
          },
          () => {
            scrollErrorIntoView();
          }
        );
        return Promise.reject('Error');
      });
  };

  toggleHidden = () => {
    const { showQRCode } = this.state;
    if (!showQRCode) {
      return this.getToken()
        .then(response => this.setState({ showQRCode: !showQRCode }))
        .catch(err => err);
    }
    return this.setState({ showQRCode: !this.state.showQRCode });
  };

  toggleTwoFactorEnabled = (toggleEnabled: boolean) => {
    this.setState({ errors: undefined, success: undefined });
    /** if we're turning TFA on, ask the API for a TFA secret */
    if (toggleEnabled) {
      this.getToken();
      return this.setState({
        twoFactorEnabled: true,
        loading: true,
        showQRCode: true
      });
    }
  };

  render() {
    const { classes, username } = this.props;
    const {
      errors,
      loading,
      secret,
      showQRCode,
      success,
      twoFactorEnabled,
      twoFactorConfirmed
    } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
      <ToggleState>
        {({ open: disable2FAOpen, toggle: toggleDisable2FA }) => (
          <ToggleState>
            {({ open: scratchDialogOpen, toggle: toggleScratchDialog }) => (
              <React.Fragment>
                <Paper className={classes.root}>
                  {success && <Notice success text={success} />}
                  {generalError && <Notice error text={generalError} />}
                  <Typography
                    variant="h2"
                    className={classes.title}
                    data-qa-title
                  >
                    Two-Factor Authentication (TFA)
                  </Typography>
                  <Typography
                    variant="body1"
                    className={classes.helpText}
                    data-qa-copy
                  >
                    Two-factor authentication increases the security of your
                    Linode account by requiring two different forms of
                    authentication to log in: your account password and a
                    security token. You can set up a third party app such as
                    Authy or Google Authenticator to generate these tokens for
                    you.
                  </Typography>
                  {typeof twoFactorConfirmed !== 'undefined' && (
                    <TwoFactorToggle
                      twoFactorEnabled={twoFactorEnabled || false}
                      onChange={this.toggleTwoFactorEnabled}
                      toggleDisableDialog={toggleDisable2FA}
                      twoFactorConfirmed={twoFactorConfirmed}
                    />
                  )}
                  {twoFactorEnabled && (
                    <div className={classes.container}>
                      {showQRCode ? (
                        <Button
                          type="secondary"
                          className={classes.visibility}
                          onClick={this.toggleHidden}
                          destructive
                          data-qa-hide-show-code
                        >
                          <SettingsBackupRestore />
                          <span className={classes.showHideText}>
                            Hide QR Code
                          </span>
                        </Button>
                      ) : (
                        <Button
                          type="secondary"
                          className={classes.visibility}
                          onClick={this.toggleHidden}
                          data-qa-hide-show-code
                        >
                          <SettingsBackupRestore />
                          <span className={classes.showHideText}>
                            {twoFactorConfirmed
                              ? 'Reset two-factor authentication'
                              : 'Show QR Code'}
                          </span>
                        </Button>
                      )}
                    </div>
                  )}
                  {twoFactorEnabled &&
                    showQRCode &&
                    username &&
                    twoFactorConfirmed !== undefined && (
                      <EnableTwoFactorForm
                        secret={secret}
                        username={username}
                        loading={loading}
                        onSuccess={this.confirmToken}
                        twoFactorConfirmed={twoFactorConfirmed}
                        toggleDialog={toggleScratchDialog}
                      />
                    )}
                </Paper>
                <ScratchDialog
                  open={scratchDialogOpen}
                  closeDialog={toggleScratchDialog}
                  scratchCode={this.state.scratchCode}
                />
                <DisableTwoFactorDialog
                  onSuccess={this.disableTFASuccess}
                  open={disable2FAOpen}
                  closeDialog={toggleDisable2FA}
                />
              </React.Fragment>
            )}
          </ToggleState>
        )}
      </ToggleState>
    );
  }
}

const styled = withStyles(styles);

interface StateProps {
  profile?: Linode.Profile;
  twoFactor?: boolean;
  username?: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  profile: path(['data'], state.__resources.profile),
  twoFactor: path(['data', 'two_factor_auth'], state.__resources.profile),
  username: path(['data', 'username'], state.__resources.profile)
});

interface DispatchProps {
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch,
  ownProps
) => ({
  actions: {
    updateProfile: (profile: Linode.Profile) => dispatch(handleUpdate(profile))
  }
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<CombinedProps, Props>(
  styled,
  connected
)(TwoFactor);

interface ToggleProps {
  toggleDisableDialog: () => void;
  onChange: (value: boolean) => void;
  twoFactorEnabled: boolean;
  twoFactorConfirmed: boolean;
}

class TwoFactorToggle extends React.PureComponent<ToggleProps, {}> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { twoFactorConfirmed, onChange } = this.props;
    const enabled = e.currentTarget.checked;
    onChange(enabled);
    /**
     * only open the disable dialog if 2FA has been turned on and we're flipping the toggle off
     */
    if (!enabled && twoFactorConfirmed) {
      this.props.toggleDisableDialog();
    }
  };

  render() {
    const { twoFactorEnabled } = this.props;

    return (
      <FormControl fullWidth>
        <FormControlLabel
          label={twoFactorEnabled ? 'Enabled' : 'Disabled'}
          control={
            <Toggle
              checked={twoFactorEnabled}
              onChange={this.handleChange}
              data-qa-toggle-tfa={twoFactorEnabled}
            />
          }
        />
      </FormControl>
    );
  }
}
