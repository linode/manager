import { Profile, TPAProvider } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { dec, equals, lensPath, path, remove, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { LISH } from 'src/documentation';
import { updateProfile as handleUpdateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { ProviderOptions, providers } from '../AuthenticationSettings/shared';

type ClassNames =
  | 'root'
  | 'title'
  | 'intro'
  | 'modeControl'
  | 'sshWrap'
  | 'keyTextarea'
  | 'image'
  | 'addNew'
  | 'remove'
  | 'button';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    },
    title: {
      marginBottom: theme.spacing(2),
    },
    intro: {
      marginBottom: theme.spacing(2),
    },
    modeControl: {
      display: 'flex',
    },
    image: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    addNew: {
      ...theme.applyLinkStyles,
      marginTop: theme.spacing(2),
    },
    sshWrap: {
      margin: `${theme.spacing(1)}px 0`,
    },
    keyTextarea: {
      [theme.breakpoints.up('md')]: {
        minWidth: 415,
      },
    },
    remove: {
      ...theme.applyLinkStyles,
    },
    button: {
      margin: 0,
      padding: 0,
    },
  });

interface State {
  submitting: boolean;
  errors?: APIError[];
  success?: string;
  lishAuthMethod: Pick<Profile, 'lish_auth_method'>;
  authorizedKeys: string[];
  authorizedKeysCount: number;
  authType: TPAProvider;
  provider: ProviderOptions;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class LishSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    lishAuthMethod: this.props.lishAuthMethod || ('password_keys' as any),
    authorizedKeys: this.props.authorizedKeys || [],
    authorizedKeysCount: this.props.authorizedKeys
      ? this.props.authorizedKeys.length
      : 1,
    authType: this.props.authType,
    provider: providers[0].name,
  };

  render() {
    const { classes, loading } = this.props;
    const {
      lishAuthMethod,
      authorizedKeys,
      authorizedKeysCount,
      success,
      errors,
      authType,
    } = this.state;

    const thirdPartyEnabled = this.props.authType !== 'password';
    const tooltipText = thirdPartyEnabled
      ? 'Password is disabled because Third-Party Authentication has been enabled.'
      : '';

    const hasErrorFor = getAPIErrorFor(
      {
        lish_auth_method: 'authentication method',
        authorized_keys: 'ssh public keys',
      },
      errors
    );
    const generalError = hasErrorFor('none');
    const authMethodError = hasErrorFor('lish_auth_method');
    const authorizedKeysError = hasErrorFor('authorized_keys');

    const modeOptions = [
      {
        label: 'Allow both password and key authentication',
        value: 'password_keys',
        isDisabled: authType !== 'password',
      },
      {
        label: 'Allow key authentication only',
        value: 'keys_only',
      },
      {
        label: 'Disable Lish',
        value: 'disabled',
      },
    ];

    const defaultMode = modeOptions.find((eachMode) => {
      if (authType !== 'password') {
        return (eachMode.value as any) === 'keys_only';
      } else {
        return (eachMode.value as any) === lishAuthMethod;
      }
    });

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="LISH Console Settings" />
        <Paper className={classes.root}>
          <Typography variant="h2" className={classes.title} data-qa-title>
            LISH Console Settings
          </Typography>
          {success && <Notice success text={success} />}
          {authorizedKeysError && <Notice error text={authorizedKeysError} />}
          {generalError && <Notice error text={generalError} />}
          <Typography className={classes.intro}>
            This controls what authentication methods are allowed to connect to
            the Lish console servers.
          </Typography>
          {loading ? null : (
            <React.Fragment>
              <FormControl className={classes.modeControl}>
                <Select
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-mode-select': true,
                    },
                    tooltipText,
                  }}
                  options={modeOptions}
                  name="mode-select"
                  id="mode-select"
                  label="Authentication Mode"
                  defaultValue={defaultMode}
                  onChange={this.onListAuthMethodChange as any}
                  isClearable={false}
                  errorText={authMethodError}
                />
              </FormControl>
              {Array.from(Array(authorizedKeysCount)).map((value, idx) => (
                <div className={classes.sshWrap} key={idx}>
                  <TextField
                    key={idx}
                    label="SSH Public Key"
                    onChange={this.onPublicKeyChange(idx)}
                    value={authorizedKeys[idx] || ''}
                    multiline
                    rows="4"
                    className={classes.keyTextarea}
                    data-qa-public-key
                  />
                  {((idx === 0 && typeof authorizedKeys[0] !== 'undefined') ||
                    idx > 0) && (
                    <button
                      onClick={this.onPublicKeyRemove(idx)}
                      className={classes.remove}
                      data-qa-remove
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Typography style={{ paddingTop: 2 }}>
                Place your SSH public keys here for use with Lish console
                access.
              </Typography>
              <button
                onClick={this.addSSHPublicKeyField}
                className={classes.addNew}
              >
                Add SSH Public Key
              </button>
            </React.Fragment>
          )}
          <ActionsPanel>
            <Button
              className={classes.button}
              buttonType="primary"
              onClick={this.onSubmit}
              loading={this.state.submitting}
              disabled={
                this.state.lishAuthMethod === this.props.lishAuthMethod &&
                equals(this.state.authorizedKeys, this.props.authorizedKeys)
              }
              data-qa-save
            >
              Save
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }

  static docs = [LISH];

  addSSHPublicKeyField = () =>
    this.setState({ authorizedKeysCount: this.state.authorizedKeysCount + 1 });

  onSubmit = () => {
    const { authorizedKeys, lishAuthMethod } = this.state;
    const { updateProfile } = this.props;
    const keys = authorizedKeys.filter((v) => v !== '');

    this.setState({ errors: undefined, submitting: true });

    updateProfile({
      lish_auth_method: lishAuthMethod as any,
      authorized_keys: keys,
    })
      .then((profileData) => {
        this.setState({
          submitting: false,
          success: 'LISH authentication settings have been updated.',
          authorizedKeys: profileData.authorized_keys || [],
          authorizedKeysCount: profileData.authorized_keys
            ? profileData.authorized_keys.length
            : 1,
        });
      })
      .catch((error) => {
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(error),
            success: undefined,
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  onListAuthMethodChange = (e: Item<Pick<Profile, 'lish_auth_method'>>) =>
    this.setState({ lishAuthMethod: e.value });

  onPublicKeyChange = (idx: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState(set(lensPath(['authorizedKeys', idx]), e.target.value));
  };

  onPublicKeyRemove = (idx: number) => () => {
    this.setState({
      authorizedKeys: remove(idx, 1, this.state.authorizedKeys),
      authorizedKeysCount: dec(this.state.authorizedKeysCount),
    });
  };
}

const styled = withStyles(styles);

interface StateProps {
  lishAuthMethod?: Pick<Profile, 'lish_auth_method'>;
  authorizedKeys?: string[];
  loading: boolean;
  authType: TPAProvider;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const { profile } = state.__resources;
  return {
    loading: profile.loading,
    lishAuthMethod: path(['data', 'lish_auth_method'], profile),
    authorizedKeys: path(['data', 'authorized_keys'], profile),
    authType: profile?.data?.authentication_type ?? 'password',
  };
};

interface DispatchProps {
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => ({
  updateProfile: (v: Profile) => dispatch(handleUpdateProfile(v) as any),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  setDocs(LishSettings.docs)
);

export default enhanced(LishSettings);
