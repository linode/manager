import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose, lensPath, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { updateLinode } from 'src/services/linodes';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Toggle from 'src/components/Toggle';
import Grid from 'src/components/Grid';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  currentStatus: boolean;
}

interface State {
  linodeId: number;
  currentStatus: boolean;
  submitting: boolean;
  success?: string;
  errors?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

class LinodeWatchdogPanel extends React.Component<CombinedProps, State> {
  state: State = {
    currentStatus: this.props.currentStatus,
    linodeId: this.props.linodeId,
    submitting: false,
  };

  toggleWatchdog = (e: React.ChangeEvent<HTMLElement>, value: boolean) => {
    this.setState(setSubmitting(true));

    updateLinode(this.props.linodeId, { watchdog_enabled: value })
      .then((response) => {
        this.setState(compose(
          setSubmitting(false),
          setSuccess(`Watchdog succesfully ${value ? 'enabled' : 'disabled.'}`),
          setCurrentStatus(response.data.watchdog_enabled),
        ));
      })
      .catch(() => {
        this.setState(compose(
          setSubmitting(false),
          setErrors([{ field: 'none', reason: `Unable to ${value ? 'disable' : 'enable'} Watchdog.` }]),
        ));
      });
  }

  render() {
    const { currentStatus, submitting, success, errors } = this.state;

    return (
      <React.Fragment>
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog">
          <Grid container>
            {
              (success || errors) &&
              <Grid item xs={12}>
                <Notice success={Boolean(success)} error={Boolean(errors)} text={success || errors} />
              </Grid>
            }
            <Grid item xs={12} md={2}>
              <FormControlLabel
                className="toggleLassie"
                control={
                  <Toggle
                    onChange={this.toggleWatchdog}
                    checked={currentStatus}
                  />
                }
                label={currentStatus ? 'Enabled' : 'Disabled'}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} md={10}>
              <Typography>
                Shutdown Watchdog, also known as Lassie, is a Linode Manager feature capable of
              automatically rebooting your Linode if it powers off unexpectedly. Lassie is not
              technically an availability monitoring tool, but it can help get your Linode back
              online fast if it’s accidentally powered off.
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

const L = {
  currentStatus: lensPath(['currentStatus']),
  error: lensPath(['errors']),
  submitting: lensPath(['submitting']),
  success: lensPath(['success']),
};

const setCurrentStatus = (v: boolean) => set(L.currentStatus, v);

const setErrors = (v: Linode.ApiFieldError[]) => set(L.error, v);

const setSubmitting = (v: boolean) => set(L.submitting, v);

const setSuccess = (v: string) => set(L.success, v);

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

export default compose(
  errorBoundary,
  withRouter,
  styled,
)(LinodeWatchdogPanel) as React.ComponentType<Props>;
