import { pathOr } from 'ramda';
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
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { disableTwoFactor, getTFAToken,  } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import EnableTwoFactorForm from './EnableTwoFactorForm';

type ClassNames = 'root' | 'container' | 'title' | 'visibility';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
      marginBottom: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 2,
    },
    title: {
      marginBottom: theme.spacing.unit * 2,
    },
    visibility: {
      color: '#3B85D9',
      marginRight: theme.spacing.unit * 2,
    }
  });

interface Props {
  twoFactor: boolean;
  username: string;
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
  twoFactorEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class TwoFactor extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    errors: undefined,
    loading: false,
    secret: '',
    showQRCode: false,
    success: undefined,
    twoFactorEnabled: this.props.twoFactor || false,
    disableDialog: {
      open: false,
      error: undefined,
      submitting: false,
    }
  }

  componentDidMount () {
    this.getToken();
  }

  openDisableDialog = () => {
    this.setState({ disableDialog: { open: true, error: undefined, submitting: false, }});
  }

  closeDisableDialog = () => {
    this.setState({
      // If cancelling a disable action, TFA must still be enabled
      twoFactorEnabled: true, 
      disableDialog: {
        error: undefined,
        open: false,
        submitting: false, }});
  }

  confirmToken = () => {
    this.setState({ success: "Two-factor authentication has been enabled.", twoFactorEnabled: true, })
  }

  disableTFA = () => {
    disableTwoFactor()
    .then((response) => {
      this.setState({
        success: "Two-factor authentication has been disabled.", 
        twoFactorEnabled: false, 
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
          variant="raised"
          type="secondary"
          destructive={true}
          loading={this.state.disableDialog.submitting}
          onClick={this.disableTFA}
          data-qa-submit
        >
          Confirm
        </Button>
        <Button
          onClick={this.closeDisableDialog}
          variant="raised"
          color="secondary"
          className="cancel"
          data-qa-cancel
        >
          Cancel
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
    this.setState({ showQRCode: !this.state.showQRCode });
  }

  toggleTwoFactorEnabled = () => {
    this.setState({ errors: undefined, success: undefined });
    const { twoFactorEnabled } = this.state;
    const toggle = !twoFactorEnabled;
    if (toggle) { 
      // Enable TFA. Ask the API for a TFA secret.
      this.setState({ twoFactorEnabled: true, loading: true, showQRCode: true, });
      this.getToken();
    } else {
      // If TFA isn't active on the account,
      // there's nothing to do here; just flip the toggle.
      if (!this.props.twoFactor) { 
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
    const { errors, loading, secret, showQRCode, success, twoFactorEnabled } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          { success && <Notice success text={success}/>}
          { generalError && <Notice error text={generalError} />}
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
            <div className={classes.container}>
              {showQRCode
                ? <Visibility className={classes.visibility} onClick={this.toggleHidden} />
                : <VisibilityOff className={classes.visibility} onClick={this.toggleHidden} />
              }
              <span>
              {showQRCode ? "Hide" : "Show" } QR Code
              </span>
            </div>
          }
          {twoFactorEnabled && showQRCode &&
            <EnableTwoFactorForm
              secret={secret}
              username={username}
              loading={loading}
              onSuccess={this.confirmToken}
            />
          }
        </Paper>
        <ConfirmationDialog
          open={this.state.disableDialog.open}
          title="Disable Two-Factor Authentication"
          onClose={this.closeDisableDialog}
          actions={this.getActions}
        >
        { this.state.disableDialog.error &&
          <Notice error text={this.state.disableDialog.error} />
        }
        <Typography>Are you sure you want to disable two-factor authentication?</Typography>
      </ConfirmationDialog>
    </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TwoFactor);