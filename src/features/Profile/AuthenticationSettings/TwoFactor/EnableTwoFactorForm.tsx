import { pathOr } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import {
    StyleRulesCallback,
    
    WithStyles,
    withStyles,
} from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import Notice from 'src/components/Notice';
import { confirmTwoFactor } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ConfirmToken from './ConfirmToken';
import QRCodeForm from './QRCodeForm';

type ClassNames = 'root' | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
    root: {
    },
    divider: {
      margin: `${theme.spacing.unit * 3}px 0`,
      width: `calc(100% - ${theme.spacing.unit * 2}px)`,
    },
  });

interface Props {
  loading: boolean;
  secret: string;
  username: string;
  twoFactorConfirmed: boolean;
  onSuccess: () => void;
}

interface State {
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  token: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class EnableTwoFactorForm extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    errors: undefined,
    submitting: false,
    token: '',
  }

  componentDidMount () {
    this.mounted = true;
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  getSecretLink = () => {
    const { secret, username } = this.props;
    return `otpauth://totp/LinodeManager%3A${username}?secret=${secret}`;
  }

  handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ token: e.target.value });
  }

  onSubmit = () => {
    const { token } = this.state;
    const safeToken = token.replace(/ /g,'');
    this.setState({ submitting: true });
    confirmTwoFactor(safeToken)
      .then((response) => {
        if (!this.mounted) { return; }
        this.setState({
          errors: undefined,
          submitting: false,
          token: '',
        });
        this.props.onSuccess();
      })
      .catch((error) => {
        if (!this.mounted) { return; }
        const fallbackError = [{ field: 'tfa_code', reason: 'Could not confirm code.' }];
        let APIErrors = pathOr(fallbackError, ['response', 'data', 'errors'], error);
        APIErrors = APIErrors.filter((err:Linode.ApiFieldError) => {
          // Filter potentially confusing API error
          return err.reason !== 'Invalid token. Two-factor auth not enabled. Please try again.';
        })

        this.setState({
            errors: APIErrors,
            submitting: false,
            token: '',
          }, () => {
          scrollErrorIntoView();
        });
      })
  }

  onCancel = () => {
    // @todo should this mirror the behavior of toggling off TFA
    // in TwoFactor.tsx?
    this.setState({ token: '', errors: undefined, });
  }

  render() {
    const { classes, loading, secret, twoFactorConfirmed } = this.props;
    const { errors, submitting, token } = this.state;
    const secretLink = this.getSecretLink();
    const hasErrorFor = getAPIErrorFor({
      tfa_code: 'tfa_code'
    }, errors);
    const tokenError = hasErrorFor('tfa_code');
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError && <Notice error text={generalError} />}
        { loading
          ? <CircleProgress noTopMargin />
          : <QRCodeForm
              secret={secret}
              secretLink={secretLink}
              updateFor={[secret, secretLink]}
            />
        }
        <Divider className={classes.divider} />
        <ConfirmToken
          error={tokenError}
          token={token}
          submitting={submitting}
          twoFactorConfirmed={twoFactorConfirmed}
          handleChange={this.handleTokenInputChange}
          onCancel={this.onCancel}
          onSubmit={this.onSubmit}
          updateFor={[token, tokenError, submitting]}
        />
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(EnableTwoFactorForm);
