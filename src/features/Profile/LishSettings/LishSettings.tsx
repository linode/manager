import { compose, dec, lensPath, pathOr, remove, set } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { FormHelperText } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { updateProfile } from 'src/services/profile';
import { response } from 'src/store/reducers/resources';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'title'
  | 'intro'
  | 'modeControl'
  | 'sshWrap'
  | 'keyTextarea'
  | 'image'
  | 'addNew'
  | 'remove';

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
  addNew: {
    marginTop: theme.spacing.unit * 2,
  },
  sshWrap: {
    margin: `${theme.spacing.unit}px 0`,
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'flex-end',
    },
  },
  keyTextarea: {
    [theme.breakpoints.up('md')]: {
      minWidth: 415,
    },
  },
  remove: {
    margin: '8px 0 0 -26px',
    [theme.breakpoints.up('md')]: {
      margin: `0 0 ${theme.spacing.unit / 2}px 0`,
    },
  },
});

interface Props { }

interface ConnectedProps {
  lishAuthMethod: string;
  authorizedKeys: string[];
  loading: boolean;
  updateProfile: (v: Linode.Profile) => void;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  success?: string;
  lishAuthMethod: string;
  authorizedKeys: string[];
  authorizedKeysCount: number;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class LishSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    lishAuthMethod: this.props.lishAuthMethod,
    authorizedKeys: this.props.authorizedKeys || [],
    authorizedKeysCount: this.props.authorizedKeys ? this.props.authorizedKeys.length : 1,
  };

  render() {
    const { classes, loading } = this.props;
    const { lishAuthMethod, authorizedKeys, authorizedKeysCount, success, errors } = this.state;
    const hasErrorFor = getAPIErrorFor({
      lish_auth_method: 'authentication method',
      authorized_keys: 'ssh public keys',
    }, errors);
    const generalError = hasErrorFor('none');
    const authMethodError = hasErrorFor('lish_auth_method');
    const authorizedKeysError = hasErrorFor('authorized_keys');
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Lish" />
        <Paper className={classes.root}>
          <Typography
            role="header"
            variant="title"
            className={classes.title}
            data-qa-title
          >
            LISH
          </Typography>
          {success && <Notice success text={success} />}
          {authorizedKeysError && <Notice error text={authorizedKeysError} />}
          {generalError && <Notice error text={generalError} />}
          <Typography className={classes.intro}>
            This controls what authentication methods are allowed to connect to the Lish console servers.
          </Typography>
          {
            loading
              ? null
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
                        onChange={this.onListAuthMethodChange}
                      >
                        <MenuItem value={'password_keys'}>Allow both password and key authentication</MenuItem>
                        <MenuItem value={'keys_only'}>Allow key authentication only</MenuItem>
                        <MenuItem value={'disabled'}>Disable Lish</MenuItem>
                      </Select>
                      {authMethodError && <FormHelperText error>{authMethodError}</FormHelperText>}
                    </div>
                  </FormControl>
                  {
                    Array.from(Array(authorizedKeysCount)).map((value, idx) => (
                      <div className={classes.sshWrap} key={idx} >
                        <TextField
                          key={idx}
                          label="SSH Public Key"
                          onChange={this.onPublicKeyChange(idx)}
                          value={authorizedKeys[idx] || ''}
                          helperText="Place your SSH public keys here for use with Lish console access."
                          multiline
                          rows="4"
                          className={classes.keyTextarea}
                        />
                        <Button
                          type="remove"
                          onClick={this.onPublicKeyRemove(idx)}
                          className={classes.remove}
                        />
                      </div>
                    ))
                  }
                  <AddNewLink
                    onClick={this.addSSHPublicKeyField}
                    label="Add SSH Public Key"
                    left
                    className={classes.addNew}
                  />
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

  addSSHPublicKeyField = () =>
    this.setState({ authorizedKeysCount: this.state.authorizedKeysCount + 1 });

  onSubmit = () => {
    const { authorizedKeys, lishAuthMethod } = this.state;
    const keys = authorizedKeys.filter((v) => v !== '');

    this.setState({ errors: undefined, submitting: true });

    updateProfile({
      lish_auth_method: lishAuthMethod,
      ...(lishAuthMethod !== 'disabled' && { authorized_keys: keys }),
    })
      .then((response) => {
        this.props.updateProfile(response);
        this.setState({
          submitting: false,
          success: 'LISH authentication settings have been updated.',
          authorizedKeys: response.authorized_keys || [],
          authorizedKeysCount: response.authorized_keys ? response.authorized_keys.length : 1,
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

  onListAuthMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => this.setState({ lishAuthMethod: e.target.value });

  onPublicKeyChange = (idx: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState(
        set(lensPath(['authorizedKeys', idx]), e.target.value))
    }

  onPublicKeyRemove = (idx: number) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      this.setState({
        authorizedKeys: remove(idx, 1, this.state.authorizedKeys),
        authorizedKeysCount: dec(this.state.authorizedKeysCount),
      });
    }
}

const styled = withStyles(styles, { withTheme: true });

const mapStateToProps = (state: Linode.AppState) => {
  const { loading, data } = state.resources.profile!;

  if (loading) {
    return { loading: true }
  }

  return {
    loading: false,
    lishAuthMethod: data.lish_auth_method,
    authorizedKeys: data.authorized_keys,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    updateProfile: (v: Linode.Profile) => response(['profile'], v),
  },
  dispatch,
);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(
  styled,
  connected,
  setDocs(LishSettings.docs),
);

export default enhanced(LishSettings);
