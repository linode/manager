import { compose, lensPath, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Toggle from 'src/components/Toggle';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';

type ClassNames = 'root' | 'shutDownWatchdog';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  shutDownWatchdog: {
    margin: `${theme.spacing.unit * 2}px 0`
  }
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

type CombinedProps = Props &
  ContextProps &
  LinodeActionsProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

class LinodeWatchdogPanel extends React.Component<CombinedProps, State> {
  state: State = {
    currentStatus: this.props.currentStatus,
    linodeId: this.props.linodeId,
    submitting: false
  };

  toggleWatchdog = (e: React.ChangeEvent<HTMLElement>, value: boolean) => {
    const {
      linodeActions: { updateLinode }
    } = this.props;
    this.setState(setSubmitting(true));

    updateLinode({ linodeId: this.props.linodeId, watchdog_enabled: value })
      .then(response => {
        this.setState(
          compose(
            setSubmitting(false),
            setSuccess(
              `Watchdog succesfully ${value ? 'enabled' : 'disabled.'}`
            ),
            setCurrentStatus(response.watchdog_enabled)
          )
        );
      })
      .catch(() => {
        this.setState(
          compose(
            setSubmitting(false),
            setErrors([
              {
                field: 'none',
                reason: `Unable to ${value ? 'disable' : 'enable'} Watchdog.`
              }
            ])
          )
        );
      });
  };

  render() {
    const { currentStatus, submitting, success, errors } = this.state;
    const { classes, permissions } = this.props;

    const disabled = permissions === 'read_only';

    return (
      <React.Fragment>
        <ExpansionPanel heading="Shutdown Watchdog" data-qa-watchdog-panel>
          <Grid
            container
            alignItems="center"
            className={classes.shutDownWatchdog}
          >
            {(success || errors) && (
              <Grid item xs={12}>
                <Notice
                  success={Boolean(success)}
                  error={Boolean(errors)}
                  text={success || errors}
                />
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <FormControlLabel
                className="toggleLassie"
                control={
                  <Toggle
                    onChange={this.toggleWatchdog}
                    checked={currentStatus}
                    data-qa-watchdog-toggle={currentStatus}
                  />
                }
                label={currentStatus ? 'Enabled' : 'Disabled'}
                disabled={submitting || disabled}
              />
            </Grid>
            <Grid item xs={12} md={10} lg={8} xl={6}>
              <Typography data-qa-watchdog-desc>
                Shutdown Watchdog, also known as Lassie, is a Linode Manager
                feature capable of automatically rebooting your Linode if it
                powers off unexpectedly. Lassie is not technically an
                availability monitoring tool, but it can help get your Linode
                back online fast if it’s accidentally powered off.
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
  success: lensPath(['success'])
};

const setCurrentStatus = (v: boolean) => set(L.currentStatus, v);

const setErrors = (v: Linode.ApiFieldError[]) => set(L.error, v);

const setSubmitting = (v: boolean) => set(L.submitting, v);

const setSuccess = (v: string) => set(L.success, v);

const styled = withStyles(styles);

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

interface ContextProps {
  permissions: Linode.GrantLevel;
}

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  permissions: linode._permissions
}));

export default compose(
  errorBoundary,
  withRouter,
  styled,
  withLinodeActions,
  linodeContext
)(LinodeWatchdogPanel) as React.ComponentType<Props>;
