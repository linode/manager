import { Profile } from 'linode-js-sdk/lib/profile';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  onSuccess: () => void;
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
  updateProfileError?: Linode.ApiFieldError[];
  ipWhitelistingEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class SecuritySettings extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSubmit = () => {
    const { onSuccess } = this.props;
    if (this.props.ipWhitelistingEnabled) {
      return;
    }

    // This feature can only be disabled.
    this.props
      .updateProfile({
        ip_whitelist_enabled: !this.props.ipWhitelistingEnabled
      })
      .then(() => {
        onSuccess();
      })
      .catch(e => {
        /** rely on redux update error */
        scrollErrorIntoView();
      });
  };

  render() {
    const { classes, updateProfileError, ipWhitelistingEnabled } = this.props;
    const hasErrorFor = getAPIErrorFor({}, updateProfileError);
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
              label={ipWhitelistingEnabled ? 'Enabled' : 'Disabled'}
              control={
                <Toggle
                  checked={ipWhitelistingEnabled}
                  onChange={this.onSubmit}
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
