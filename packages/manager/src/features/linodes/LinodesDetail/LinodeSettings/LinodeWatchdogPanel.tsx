import { GrantLevel } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Accordion from 'src/components/Accordion';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Toggle from 'src/components/Toggle';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import {
  LinodeActionsProps,
  withLinodeActions,
} from 'src/store/linodes/linode.containers';

interface Props {
  linodeId: number;
  currentStatus: boolean;
}

type CombinedProps = Props &
  ContextProps &
  LinodeActionsProps &
  RouteComponentProps<{}>;

export const LinodeWatchdogPanel: React.FC<CombinedProps> = (props) => {
  const {
    linodeId,
    linodeActions: { updateLinode },
    permissions,
  } = props;

  const disabled = permissions === 'read_only';

  const [currentStatus, setCurrentStatus] = React.useState<boolean>(
    props.currentStatus
  );
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<string | undefined>(undefined);

  const toggleWatchdog = (
    e: React.ChangeEvent<HTMLElement>,
    value: boolean
  ) => {
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    updateLinode({ linodeId, watchdog_enabled: value })
      .then((response) => {
        setSubmitting(false);
        setSuccess(`Watchdog successfully ${value ? 'enabled' : 'disabled.'}`);
        setCurrentStatus(response.watchdog_enabled);
      })
      .catch(() => {
        setSubmitting(false);
        setErrors(`Unable to ${!value ? 'disable' : 'enable'} Watchdog.`);
      });
  };

  return (
    <Accordion
      heading="Shutdown Watchdog"
      defaultExpanded
      data-qa-watchdog-panel
    >
      <Grid container alignItems="center">
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
            control={
              <Toggle
                onChange={toggleWatchdog}
                checked={currentStatus}
                data-qa-watchdog-toggle={currentStatus}
              />
            }
            label={currentStatus ? 'Enabled' : 'Disabled'}
            aria-label={
              currentStatus
                ? 'Shutdown Watchdog is enabled'
                : 'Shutdown Watchdog is disabled'
            }
            disabled={submitting || disabled}
          />
        </Grid>
        <Grid item xs={12} md={10} lg={8} xl={6}>
          <Typography data-qa-watchdog-desc>
            Shutdown Watchdog, also known as Lassie, is a Linode Manager feature
            capable of automatically rebooting your Linode if it powers off
            unexpectedly. Lassie is not technically an availability monitoring
            tool, but it can help get your Linode back online fast if it’s
            accidentally powered off.
          </Typography>
        </Grid>
      </Grid>
    </Accordion>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

interface ContextProps {
  permissions: GrantLevel;
}

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  permissions: linode._permissions,
}));

export default recompose<CombinedProps, Props>(
  errorBoundary,
  withRouter,
  withLinodeActions,
  linodeContext
)(LinodeWatchdogPanel) as React.ComponentType<Props>;
