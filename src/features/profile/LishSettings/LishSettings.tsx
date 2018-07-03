import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import setDocs from 'src/components/DocsSidebar/setDocs';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { updateProfile } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { FormHelperText } from '@material-ui/core';

type ClassNames = 'root'
  | 'title'
  | 'intro'
  | 'modeControl'
  | 'image';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  intro: {
    marginBottom: theme.spacing.unit * 2,
  },
  modeControl: {
    display: 'flex',
  },
  image: {
    display: 'flex',
    flexWrap: 'wrap',
  },
});

interface Props { }

interface ConnectedProps {
  lishAuthMethod: string;
  loading: boolean;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  success?: string;
  lishAuthMethod: string;
  authorizedKeys?: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class LishSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    lishAuthMethod: this.props.lishAuthMethod,
    authorizedKeys: '',
  };

  render() {
    const { classes, loading } = this.props;
    const { lishAuthMethod, authorizedKeys, success, errors } = this.state;
    const hasErrorFor = getAPIErrorFor({
      lish_auth_method: 'authentication method',
      authorized_keys: 'ssh public keys',
    }, errors);
    const generalError = hasErrorFor('none');
    const authMethodError = hasErrorFor('lish_auth_method');
    const authorizedKeysError = hasErrorFor('authorized_keys');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography
            variant="headline"
            className={classes.title}
            data-qa-title
          >
            LISH
          </Typography>
          {success && <Notice success text={success} />}
          {generalError && <Notice error text={generalError} />}
          <Typography className={classes.intro}>
            This controls what authentication methods are allowed to connect to the Lish console servers.
          </Typography>
          {
            loading
              ? (<div />)
              : (
                <React.Fragment>
                  <FormControl className={classes.modeControl}>
                    <InputLabel htmlFor="mode-select" disableAnimation shrink={true}>
                      Authentication Mode
                    </InputLabel>
                    <div>
                      <Select
                        inputProps={{ name: 'mode-select', id: 'mode-select' }}
                        value={lishAuthMethod}
                        onChange={this.onModeChange}
                      >
                        <MenuItem value={'password_keys'}>Allow both password and key authentication</MenuItem>
                        <MenuItem value={'keys_only'}>Allow key authentication only</MenuItem>
                        <MenuItem value={'disabled'}>Disabled Lish</MenuItem>
                      </Select>
                      {authMethodError && <FormHelperText error>{authMethodError}</FormHelperText>}
                    </div>
                  </FormControl>
                  {lishAuthMethod !== 'disabled' &&
                    <TextField
                      label="SSH Public Key"
                      onChange={this.onPublicKeyChange}
                      value={authorizedKeys || ''}
                      helperText="Place your SSH public keys here for use with Lish console access."
                      multiline
                      rows="4"
                      errorText={authorizedKeysError}
                    />
                  }
                </React.Fragment>
              )
          }
          <ActionsPanel>
            <Button
              type="primary"
              onClick={this.onSubmit}
              loading={this.state.submitting}
            >
              Save
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>

    );
  }
  static docs = [{
    title: 'Using the Linode Shell (Lish)',
    src: 'https://www.linode.com/docs/networking/using-the-linode-shell-lish/',
    body: 'Learn how to use Lish as a shell for managing or rescuing your Linode.',
  }];

  onSubmit = () => {
    const { authorizedKeys, lishAuthMethod } = this.state;
    /** clear errors, start submutting */
    this.setState({ errors: undefined, submitting: true });

    updateProfile({
      lish_auth_method: lishAuthMethod,
      ...(lishAuthMethod !== 'disabled' && { authorized_keys: [authorizedKeys] }),
    })
      .then((response) => {
        this.setState({
          submitting: false,
          success: 'LISH authentication settings have been updated.',
          authorizedKeys: undefined,
        })
      })
      .catch((error) => {
        const err = [{ reason: 'An unexpected error has occured.' }];
        this.setState({
          submitting: false,
          errors: pathOr(err, ['response', 'data', 'errors'], error),
          authorizedKeys: undefined,
          success: undefined,
        })
      });
  };

  onModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => this.setState({ lishAuthMethod: e.target.value });

  onPublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ authorizedKeys: e.target.value });
}

const styled = withStyles(styles, { withTheme: true });

const connected = connect((state: Linode.AppState) => {
  const { loading, data } = state.resources.profile!;

  if (loading) {
    return { loading: true }
  }

  return {
    loading: false,
    lishAuthMethod: data.lish_auth_method,
  };
});

const enhanced = compose(
  styled,
  connected,
  setDocs(LishSettings.docs),
);

export default enhanced(LishSettings);
