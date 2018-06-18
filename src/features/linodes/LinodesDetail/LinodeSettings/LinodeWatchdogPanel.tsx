import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose, lensPath, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

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
  submitting: boolean;
  success?: string;
  error?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

class LinodeWatchdogPanel extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
  };

  setSubmitting = (v: boolean) => this.setState(
    set(lensPath(['submitting']), v),
  )

  setSuccess = (message: string) => this.setState(
    set(
      lensPath(['success']),
      message,
    ),
  )

  setError = (errors: Linode.ApiFieldError[]) => this.setState(
    set(
      lensPath(['error']),
      errors,
    ),
  )

  toggleWatchdog = (e: React.ChangeEvent<HTMLElement>, value: boolean) => {
    this.setSubmitting(true);

    updateLinode(this.props.linodeId, { watchdog_enabled: value })
      .then((response) => {
        this.setSubmitting(false);
        this.setSuccess(`Watchdog succesfully ${value ? 'enabeld' : 'disabled.'}`);
      })
      .catch(() => {
        this.setSuccess(`Unable to ${value ? 'disable' : 'enable'} Watchdog.`);
      });
  }

  render() {
    const { currentStatus } = this.props;
    const { success, error } = this.state;

    return (
      <React.Fragment>
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog">
          <Grid container>
            {
              (success || error) &&
              <Grid xs={12}>
                <Notice success={Boolean(success)} error={Boolean(error)} text={success || error} />
              </Grid>
            }
            <Grid item xs={2}>
              <FormControlLabel
                className="toggleLassie"
                control={
                  <Toggle
                    onChange={this.toggleWatchdog}
                    checked={currentStatus}
                  />
                }
                label={currentStatus ? 'Enabled' : 'Disabled'}
                disabled={this.state.submitting}
              />
            </Grid>
            <Grid item xs={10}>
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

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

export default compose(
  errorBoundary,
  withRouter,
  styled,
)(LinodeWatchdogPanel) as React.ComponentType<Props>;
