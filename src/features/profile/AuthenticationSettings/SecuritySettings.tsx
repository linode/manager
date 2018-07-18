import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import {
    StyleRulesCallback,
    Theme,
    WithStyles,
    withStyles,
} from '@material-ui/core/styles';  


import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
    root: {
      padding: theme.spacing.unit * 3,
      paddingBottom: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
    },
    title: {
      marginBottom: theme.spacing.unit * 2,
    },
  });

interface Props {
  onSuccess: () => void;
  updateProfile: (v: Linode.Profile) => void;
}

interface State {
    errors?: Linode.ApiFieldError[];
    submitting: boolean;
    ipWhitelistingToggle: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class SecuritySettings extends React.Component<CombinedProps, State> {
    mounted: boolean = false;
    state: State = {
        errors: undefined,
        submitting: false,
        ipWhitelistingToggle: true,
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    toggleIpWhitelisting = () => {
        this.setState(set(lensPath(['ipWhitelistingToggle']), !this.state.ipWhitelistingToggle))
    }

    onSubmit = () => {
        const { ipWhitelistingToggle } = this.state;
        const { onSuccess } = this.props;
        if (ipWhitelistingToggle) { return; }
        this.setState({ errors: undefined, submitting: true });

        // This feature can only be disabled.
        updateProfile({ ip_whitelist_enabled: false, })
            .then((response) => {
                onSuccess();
                this.props.updateProfile(response);
                if (this.mounted) {
                    this.setState({
                        submitting: false,
                        errors: undefined,
                    })
                }
            })
            .catch((error) => {
                const fallbackError = [{ reason: 'An unexpected error occured.' }];
                this.setState({
                    submitting: false,
                    errors: pathOr(fallbackError, ['response', 'data', 'errors'], error),
                }, () => {
                    scrollErrorIntoView();
                })
            });
    };

    render() {
        const { classes, } = this.props;
        const { errors, ipWhitelistingToggle, submitting } = this.state;
        const hasErrorFor = getAPIErrorFor({}, errors);
        const generalError = hasErrorFor('none');

        return (
            <React.Fragment>
                <Paper className={classes.root}>
                    <Typography
                        variant="title"
                        className={classes.title}
                        data-qa-title
                    >
                        Account Security
                    </Typography>
                    <Typography
                        variant="body1"
                        data-qa-copy
                    >
                        Logins for your user will only be allowed from whitelisted IPs. This setting is currently deprecated, and cannot be enabled.
                        If you disable this setting, you will not be able to re-enable it.
                    </Typography>
                    {generalError && <Notice error text={generalError} />}
                    <FormControl fullWidth>
                        <FormControlLabel
                            label={ipWhitelistingToggle ? "Enabled" : "Disabled"}
                            control={
                            <Toggle
                                checked={ipWhitelistingToggle}
                                onChange={this.toggleIpWhitelisting}
                            />
                            }
                        />
                    </FormControl>
                    <ActionsPanel>
                        <Button
                            type="primary"
                            disabled={ipWhitelistingToggle}
                            onClick={this.onSubmit}
                            loading={submitting}
                            data-qa-confirm
                        >
                            Confirm
                        </Button>
                    </ActionsPanel>
                </Paper>
            </React.Fragment>
        )
    }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SecuritySettings);