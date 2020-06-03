import { Event, Notification } from '@linode/api-v4/lib/account';
import {
  Config,
  getLinodeConfigs,
  LinodeBackups,
  LinodeStatus
} from '@linode/api-v4/lib/linodes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Flag from 'src/assets/icons/flag.svg';
import Button from 'src/components/Button';
import Card from 'src/components/core/Card';
import CardActions from 'src/components/core/CardActions';
import CardContent from 'src/components/core/CardContent';
import CardHeader from 'src/components/core/CardHeader';
import Divider from 'src/components/core/Divider';
import IconButton from 'src/components/core/IconButton';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import LinearProgress from 'src/components/LinearProgress';
import Notice from 'src/components/Notice';
import Tags from 'src/components/Tags';
import {
  linodeInTransition,
  transitionText
} from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
import { typeLabelDetails } from '../presentation';
import hasMutationAvailable, {
  HasMutationAvailable
} from './hasMutationAvailable';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import styled, { StyleProps } from './LinodeCard.style';
import RegionIndicator from './RegionIndicator';
import withDisplayType, { WithDisplayType } from './withDisplayType';
import withNotifications, { WithNotifications } from './withNotifications';
import withRecentEvent, { WithRecentEvent } from './withRecentEvent';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { parseMaintenanceStartTime } from './utils';

interface Props {
  backups: LinodeBackups;
  id: number;
  image: string | null;
  ipv4: string[];
  ipv6: string;
  label: string;
  region: string;
  disk: number;
  maintenanceStartTime?: string | null;
  memory: number;
  vcpus: number;
  status: LinodeStatus;
  type: null | string;
  tags: string[];
  imageLabel: string;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
}

export type CombinedProps = Props &
  WithDisplayType &
  WithRecentEvent &
  WithNotifications &
  HasMutationAvailable &
  WithSnackbarProps &
  StyleProps;

interface State {
  loadingConfigs: boolean;
}

export class LinodeCard extends React.PureComponent<CombinedProps, State> {
  state: State = {
    loadingConfigs: false
  };

  handleConsoleButtonClick = () => {
    sendLinodeActionMenuItemEvent('Launch Console');
    const { id } = this.props;
    lishLaunch(id);
  };

  handleRebootButtonClick = () => {
    /**
     * We have to pass a configID to the
     * API, and since we don't have that data in state
     * we have to request it.
     *
     * The API can handle an empty linode/reboot
     * request in most cases, but in some situations,
     * such as a Linode in rescue mode, this will cause
     * an error. If the API adjusts this behavior,
     * this logic can be removed/simplified.
     */
    const { id } = this.props;
    this.setState({ loadingConfigs: true });
    getLinodeConfigs(id)
      .then(response => {
        this.setState({ loadingConfigs: false });
        this.handleReboot(response.data);
      })
      .catch(_ => {
        this.setState({ loadingConfigs: false });
        this.props.enqueueSnackbar(
          'Unable to load configs for this Linode. Please try again.',
          {
            variant: 'error'
          }
        );
      });
  };

  handleReboot = (configs: Config[]) => {
    sendLinodeActionMenuItemEvent('Reboot Linode');
    const { id, label, openPowerActionDialog } = this.props;
    openPowerActionDialog('Reboot', id, label, configs);
  };

  render() {
    const {
      id,
      label,
      status,
      backups,
      memory,
      disk,
      vcpus,
      region,
      type,
      ipv4,
      ipv6,
      tags,
      image,
      classes,
      openDeleteDialog,
      openPowerActionDialog,
      displayType,
      mutationAvailable,
      linodeNotifications,
      recentEvent,
      imageLabel,
      maintenanceStartTime
    } = this.props;

    const { loadingConfigs } = this.state;

    const loading = linodeInTransition(status, recentEvent);
    const dateTime = parseMaintenanceStartTime(maintenanceStartTime).split(' ');

    const MaintenanceText = () => {
      return (
        <>
          Please consult your{' '}
          <Link to="/support/tickets?type=open">support tickets</Link> for
          details.
        </>
      );
    };

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3} data-qa-linode={label}>
        <Card className={classes.flexContainer}>
          <CardHeader
            subheader={
              <RenderTitle
                classes={{
                  wrapHeader: classes.wrapHeader,
                  linkWrapper: classes.linkWrapper,
                  flagContainer: classes.flagContainer,
                  flag: classes.flag,
                  cardHeader: classes.cardHeader,
                  StatusIndicatorWrapper: classes.StatusIndicatorWrapper
                }}
                linodeId={id}
                linodeLabel={label}
                linodeNotifications={linodeNotifications}
                linodeStatus={status}
                recentEvent={recentEvent}
                mutationAvailable={mutationAvailable}
                maintenance={maintenanceStartTime}
              />
            }
            action={
              <div className={classes.actionMenu}>
                <LinodeActionMenu
                  linodeId={id}
                  linodeLabel={label}
                  linodeRegion={region}
                  linodeType={type}
                  linodeStatus={status}
                  linodeBackups={backups}
                  openDeleteDialog={openDeleteDialog}
                  openPowerActionDialog={openPowerActionDialog}
                  noImage={!image}
                />
              </div>
            }
            className={`${classes.customeMQ} ${'title'}`}
          />
          <Divider />
          <CardContent
            className={`${classes.cardContent} ${classes.customeMQ}`}
          >
            {recentEvent && linodeInTransition(status, recentEvent) && (
              <ProgressDisplay
                text={transitionText(status, id, recentEvent)}
                progress={recentEvent.percent_complete}
                classes={{
                  statusProgress: classes.statusProgress,
                  cardSection: classes.cardSection
                }}
              />
            )}

            <div className={classes.cardSection} data-qa-linode-summary>
              {`${displayType}: ${typeLabelDetails(memory, disk, vcpus)}`}
            </div>
            <div className={classes.cardSection} data-qa-region>
              <RegionIndicator region={region} />
            </div>
            <div className={classes.cardSection} data-qa-ips>
              {ipv4 && <IPAddress ips={ipv4} copyRight showAll />}
              {ipv6 && <IPAddress ips={[ipv6]} copyRight showAll />}
            </div>
            <div className={classes.cardSection} data-qa-image>
              {imageLabel}
            </div>
            <div className={classes.cardSection} data-qa-image>
              {!maintenanceStartTime ? (
                <Typography>
                  Status:{' '}
                  {loading ? (
                    'Busy'
                  ) : (
                    <span className={classes.status}> {status}</span>
                  )}
                </Typography>
              ) : (
                <>
                  <div className={classes.cardMaintenance}>
                    <Notice
                      warning
                      spacingBottom={0}
                      className={classes.maintenanceNotice}
                    >
                      Maintenance Scheduled <br />
                      {dateTime[0]} at {dateTime[1]}
                      <HelpIcon
                        text={<MaintenanceText />}
                        className={classes.statusHelpIcon}
                        tooltipPosition="top"
                        interactive
                      />
                    </Notice>
                  </div>
                </>
              )}
            </div>
            <div className={classes.cardSection}>
              <Tags tags={tags} />
            </div>
          </CardContent>
          <CardActions className={classes.cardActions}>
            <Button
              className={`${classes.button} ${classes.consoleButton}`}
              onClick={this.handleConsoleButtonClick}
              aria-describedby="new-window"
              data-qa-console
            >
              Launch Console
            </Button>
            <Button
              className={`${classes.button}
              ${classes.rebootButton}`}
              onClick={this.handleRebootButtonClick}
              loading={loadingConfigs}
              data-qa-reboot
            >
              Reboot
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

export default compose<CombinedProps, Props>(
  styled,
  withDisplayType,
  withRecentEvent,
  withNotifications,
  hasMutationAvailable,
  withSnackbar
)(LinodeCard) as React.ComponentType<Props>;

const ProgressDisplay: React.FC<{
  progress: null | number;
  text: string;
  classes: {
    cardSection: string;
    statusProgress: string;
  };
}> = props => {
  const { classes, text, progress } = props;
  const displayProgress = progress ? `${progress}%` : ``;
  return (
    <Grid container className={classes.cardSection}>
      <Grid item>
        <Typography variant="body2">
          {text}: {displayProgress}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} lg={6} xl={6}>
        <div className={classes.statusProgress}>
          {progress ? (
            <LinearProgress value={progress} />
          ) : (
            <LinearProgress variant="indeterminate" />
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export const RenderTitle: React.FC<{
  classes: {
    linkWrapper: string;
    StatusIndicatorWrapper: string;
    wrapHeader: string;
    flagContainer: string;
    cardHeader: string;
    flag: string;
  };
  linodeStatus: LinodeStatus;
  recentEvent?: Event;
  linodeLabel: string;
  linodeId: number;
  mutationAvailable: boolean;
  linodeNotifications: Notification[];
  maintenance?: string | null;
}> = props => {
  const {
    classes,
    linodeStatus,
    linodeLabel,
    linodeId,
    mutationAvailable,
    linodeNotifications,
    recentEvent
  } = props;

  return (
    <Grid container alignItems="center">
      <Link to={`/linodes/${linodeId}`} className={classes.linkWrapper}>
        <Grid item className={`${classes.StatusIndicatorWrapper} ${'py0'}`}>
          <EntityIcon
            variant="linode"
            status={linodeStatus}
            loading={
              recentEvent && linodeInTransition(linodeStatus, recentEvent)
            }
            size={38}
          />
        </Grid>
        <Grid item className={classes.cardHeader + ' py0'}>
          <Typography className={classes.wrapHeader} variant="h3" data-qa-label>
            {linodeLabel}
          </Typography>
        </Grid>
      </Link>
      <RenderFlag
        classes={{ flag: classes.flag, flagContainer: classes.flagContainer }}
        linodeNotifications={linodeNotifications}
        mutationAvailable={mutationAvailable}
      />
    </Grid>
  );
};

RenderTitle.displayName = `RenderTitle`;

export const RenderFlag: React.FC<{
  mutationAvailable: boolean;
  linodeNotifications: Notification[];
  classes: any;
}> = props => {
  /*
   * Render either a flag for if the Linode has a notification
   * or if it has a pending mutation available. Mutations take
   * precedent over notifications
   */
  const { mutationAvailable, classes, linodeNotifications } = props;

  if (mutationAvailable) {
    return (
      <Grid item className={classes.flagContainer} role="listitem">
        <Tooltip title="There is a free upgrade available for this Linode">
          <IconButton>
            <Flag className={classes.flag} />
          </IconButton>
        </Tooltip>
      </Grid>
    );
  }

  if (linodeNotifications.length > 0) {
    return (
      <>
        {linodeNotifications.map((notification, idx) => (
          <Grid
            key={idx}
            item
            className={classes.flagContainer}
            role="listitem"
          >
            <Tooltip title={notification.message}>
              <Flag className={classes.flag} />
            </Tooltip>
          </Grid>
        ))}
      </>
    );
  }

  return null;
};

RenderFlag.displayName = `RenderFlag`;
