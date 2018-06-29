import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import setDocs from 'src/components/DocsSidebar/setDocs';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';

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
  mode: string;
  loading: boolean;
}

interface State {
  mode: string;
  publicKey?: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class LishSettings extends React.Component<CombinedProps, State> {
  state: State = {
    mode: this.props.mode,
    publicKey: '',
  };

  render() {
    const { classes, loading } = this.props;
    const { mode, publicKey } = this.state;
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
                        value={mode}
                        onChange={this.onModeChange}
                      >
                        <MenuItem value={'password_keys'}>Allow both password and key authentication</MenuItem>
                        <MenuItem value={'keys_only'}>Allow key authentication only</MenuItem>
                        <MenuItem value={'disabled'}>Disabled Lish</MenuItem>
                      </Select>
                    </div>
                  </FormControl>
                  <TextField
                    label="SSH Public Key"
                    onChange={this.onPublicKeyChange}
                    value={publicKey || ''}
                    helperText="Place your SSH public keys here for use with Lish console access."
                  />
                </React.Fragment>
              )
          }
          <ActionsPanel>
            <Button type="primary" onClick={this.onSubmit}> Save</Button>
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
    /** Waiting on https://github.com/linode/manager/pull/3500/files */
  };

  onModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => this.setState({ mode: e.target.value });

  onPublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ publicKey: e.target.value });
}

const styled = withStyles(styles, { withTheme: true });

const connected = connect((state: Linode.AppState) => {
  const { loading, data } = state.resources.profile!;

  if (loading) {
    return { loading: true }
  }

  return {
    loading: false,
    mode: data.lish_auth_method,
  };
});

const enhanced = compose(
  styled,
  connected,
  setDocs(LishSettings.docs),
);

export default enhanced(LishSettings);
