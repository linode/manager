import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
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
import LinearProgress from 'src/components/LinearProgress';
import Tags from 'src/components/Tags';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import {
  linodeInTransition,
  transitionText
} from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
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

import { parseMaintenanceStartTime } from './utils';

interface Props {
  backups: Linode.LinodeBackups;
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
  status: Linode.LinodeStatus;
  type: null | string;
  tags: string[];
  mostRecentBackup: string | null;
  someLinodesHaveMaintenance: boolean;

  imageLabel: string;
  openConfigDrawer: (
    configs: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.BootAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
}

export type CombinedProps = Props &
  WithDisplayType &
  WithRecentEvent &
  WithNotifications &
  HasMutationAvailable &
  StyleProps;

export class LinodeCard extends React.PureComponent<CombinedProps> {
  handleConsoleButtonClick = () => {
    sendLinodeActionMenuItemEvent('Launch Console');
    const { id } = this.props;
    lishLaunch(id);
  };

  handleRebootButtonClick = () => {
    sendLinodeActionMenuItemEvent('Reboot Linode');
    const { id, label, toggleConfirmation } = this.props;
    toggleConfirmation('reboot', id, label);
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
      openConfigDrawer,
      toggleConfirmation,
      displayType,
      mutationAvailable,
      linodeNotifications,
      recentEvent,
      imageLabel
    } = this.props;

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
                  openConfigDrawer={openConfigDrawer}
                  toggleConfirmation={toggleConfirmation}
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
                text={transitionText(status, recentEvent)}
                progress={recentEvent.percent_complete}
                classes={{
                  statusProgress: classes.statusProgress,
                  statusText: classes.statusText,
                  cardSection: classes.cardSection
                }}
              />
            )}
            {!!this.props.someLinodesHaveMaintenance &&
              !!this.props.maintenanceStartTime && (
                <div className={classes.cardSection}>
                  Maintenance Window Start:{' '}
                  {parseMaintenanceStartTime(this.props.maintenanceStartTime)}
                </div>
              )}
            <div className={classes.cardSection} data-qa-linode-summary>
              {`${displayType}: ${typeLabelDetails(memory, disk, vcpus)}`}
            </div>
            <div className={classes.cardSection} data-qa-region>
              <RegionIndicator region={region} />
            </div>
            <div className={classes.cardSection} data-qa-ips>
              <IPAddress ips={ipv4} copyRight showAll />
              <IPAddress ips={[ipv6]} copyRight showAll />
            </div>
            <div className={classes.cardSection} data-qa-image>
              {imageLabel}
            </div>
            <div className={classes.cardSection}>
              <Tags tags={tags} />
            </div>
          </CardContent>
          <CardActions className={classes.cardActions}>
            <Button
              className={`${classes.button} ${classes.consoleButton}`}
              onClick={this.handleConsoleButtonClick}
              data-qa-console
            >
              Launch Console
            </Button>
            <Button
              className={`${classes.button}
              ${classes.rebootButton}`}
              onClick={this.handleRebootButtonClick}
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

export default compose(
  styled,
  withDisplayType,
  withRecentEvent,
  withNotifications,
  hasMutationAvailable
)(LinodeCard) as React.ComponentType<Props>;

const ProgressDisplay: React.StatelessComponent<{
  progress: null | number;
  text: string;
  classes: {
    cardSection: string;
    statusProgress: string;
    statusText: string;
  };
}> = props => {
  const { classes, text, progress } = props;
  const displayProgress = progress ? `${progress}%` : ``;
  return (
    <Grid container className={classes.cardSection}>
      <Grid item>
        <Typography variant="body2" className={classes.statusText}>
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

export const RenderTitle: React.StatelessComponent<{
  classes: {
    linkWrapper: string;
    StatusIndicatorWrapper: string;
    wrapHeader: string;
    flagContainer: string;
    cardHeader: string;
    flag: string;
  };
  linodeStatus: Linode.LinodeStatus;
  recentEvent?: Linode.Event;
  linodeLabel: string;
  linodeId: number;
  mutationAvailable: boolean;
  linodeNotifications: Linode.Notification[];
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

export const RenderFlag: React.StatelessComponent<{
  mutationAvailable: boolean;
  linodeNotifications: Linode.Notification[];
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
      <Grid item className={classes.flagContainer}>
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
          <Grid key={idx} item className={classes.flagContainer}>
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
