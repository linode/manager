import { lensPath, set } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface Props {
  onSuccess: () => void;
  updateProfile: (v: Partial<Linode.Profile>) => void;
}

interface State {
  errors?: Linode.ApiFieldError[];
  ipWhitelistingToggle: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const L = {
  ipWhitelistingToggle: lensPath(['ipWhitelistingToggle'])
};

export class SecuritySettings extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    errors: undefined,
    ipWhitelistingToggle: true
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggleIpWhitelisting = () => {
    this.setState(
      set(L.ipWhitelistingToggle, !this.state.ipWhitelistingToggle),
      this.onSubmit
    );
  };

  onSubmit = () => {
    const { ipWhitelistingToggle } = this.state;
    const { onSuccess } = this.props;
    if (ipWhitelistingToggle) {
      return;
    }
    this.setState({ errors: undefined });

    // This feature can only be disabled.
    updateProfile({ ip_whitelist_enabled: false })
      .then(response => {
        onSuccess();
        this.props.updateProfile(response);
        if (this.mounted) {
          this.setState({ errors: undefined });
        }
      })
      .catch(error => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            errors: getAPIErrorOrDefault(error),
            ipWhitelistingToggle: true
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const { classes } = this.props;
    const { errors, ipWhitelistingToggle } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography variant="h2" className={classes.title} data-qa-title>
            IP Whitelisting (Legacy)
          </Typography>
          {generalError && <Notice error text={generalError} />}
          <Typography variant="body1" data-qa-copy>
            Logins for your user will only be allowed from whitelisted IPs. This
            setting is currently deprecated, and cannot be enabled. If you
            disable this setting, you will not be able to re-enable it.
          </Typography>
          <FormControl fullWidth>
            <FormControlLabel
              label={ipWhitelistingToggle ? 'Enabled' : 'Disabled'}
              control={
                <Toggle
                  checked={ipWhitelistingToggle}
                  onChange={this.toggleIpWhitelisting}
                />
              }
            />
          </FormControl>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(SecuritySettings);
