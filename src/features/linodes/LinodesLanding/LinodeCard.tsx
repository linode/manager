import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
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
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import Tags from 'src/components/Tags';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
import { sendEvent } from 'src/utilities/analytics';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import { displayType, typeLabelDetails } from '../presentation';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import styled, { StyleProps } from './LinodeCard.style';
import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import withRecentEvent, { WithRecentEvent } from './withRecentEvent';

interface State {
  mutationAvailable: boolean;
}

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeType: null | string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeBackups: Linode.LinodeBackups;
  linodeTags: string[];
  linodeSpecDisk: number;
  linodeSpecMemory: number;
  linodeSpecVcpus: number;
  linodeSpecTransfer: number;
  imageLabel: string;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & Props
  & WithTypesProps
  & WithRecentEvent
  & StyleProps;

class LinodeCard extends React.Component<CombinedProps, State> {
  state: State = {
    mutationAvailable: false,
  }

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<CombinedProps>(
      nextProps,
      this.props,
      [
        'linodeIpv4',
        'linodeIpv6',
        'linodeLabel',
        'linodeNotification',
        'linodeRegion',
        'linodeStatus',
        'recentEvent',
        'typesData',
      ],
    )
      || this.props.theme.name !== nextProps.theme.name
  }

  handleConsoleButtonClick = () => {
    sendEvent({
      category: 'Linode Action Menu Item',
      action: 'Launch Console',
    })
    const { linodeId } = this.props;
    lishLaunch(linodeId);
  }

  handleRebootButtonClick = () => {
    sendEvent({
      category: 'Linode Action Menu Item',
      action: 'Reboot Linode',
    })
    const { linodeId, linodeLabel, toggleConfirmation } = this.props;
    toggleConfirmation('reboot', linodeId, linodeLabel);
  }

  renderFlag = () => {
    /*
    * Render either a flag for if the Linode has a notification
    * or if it has a pending mutation available. Mutations take
    * precedent over notifications
    */
    const { mutationAvailable } = this.state;
    const { linodeNotification, classes } = this.props;
    if (mutationAvailable) {
      return (
        <Grid item className={classes.flagContainer}>
          <Tooltip title="There is a free upgrade available for this Linode">
            <IconButton>
              <Flag className={classes.flag} />
            </IconButton>
          </Tooltip>
        </Grid>
      )
    }
    if (linodeNotification) {
      return (
        <Grid item className={classes.flagContainer}>
          <Tooltip title={linodeNotification}><Flag className={classes.flag} /></Tooltip>
        </Grid>
      )
    }
    return null;
  }

  renderTitle() {
    const { classes, linodeStatus, linodeLabel, linodeId } = this.props;

    return (
      <Grid container alignItems="center">
        <Link to={`/linodes/${linodeId}`} className={classes.linkWrapper}>
          <Grid item className={`${classes.StatusIndicatorWrapper} ${'py0'}`}>
            <LinodeStatusIndicator status={linodeStatus} />
          </Grid>
          <Grid item className={classes.cardHeader + ' py0'}>
            <Typography role="header" className={classes.wrapHeader} variant="h3" data-qa-label>
              {linodeLabel}
            </Typography>
          </Grid>
        </Link>
        {this.renderFlag()}
      </Grid>
    );
  }

  render() {
    const { classes, openConfigDrawer, linodeId, linodeLabel, recentEvent,
      linodeStatus, linodeBackups, toggleConfirmation, typesData, linodeType,
      linodeSpecMemory, linodeSpecDisk, linodeSpecVcpus, linodeRegion, linodeIpv4,
      linodeIpv6, imageLabel, linodeTags } = this.props;

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3} data-qa-linode={linodeLabel}>
        <Card className={classes.flexContainer}>
          <CardHeader
            subheader={this.renderTitle()}
            action={
              <div className={classes.actionMenu}>
                <LinodeActionMenu
                  linodeId={linodeId}
                  linodeLabel={linodeLabel}
                  linodeStatus={linodeStatus}
                  linodeBackups={linodeBackups}
                  openConfigDrawer={openConfigDrawer}
                  toggleConfirmation={toggleConfirmation}
                />
              </div>
            }
            className={`${classes.customeMQ} ${'title'}`}
          />
          <Divider />
          <CardContent className={`${classes.cardContent} ${classes.customeMQ}`}>
            {
              recentEvent && linodeInTransition(linodeStatus, recentEvent) &&
              <ProgressDisplay
                text={transitionText(linodeStatus, recentEvent)}
                progress={recentEvent.percent_complete}
                classes={{
                  statusProgress: classes.statusProgress,
                  statusText: classes.statusText,
                  cardSection: classes.cardSection,
                }}
              />
            }
            <div className={classes.cardSection} data-qa-linode-summary>
              {typesData && `${displayType(linodeType, typesData || [])}: `}
              {typeLabelDetails(linodeSpecMemory, linodeSpecDisk, linodeSpecVcpus)}
            </div>
            <div className={classes.cardSection} data-qa-region>
              <RegionIndicator region={linodeRegion} />
            </div>
            <div className={classes.cardSection} data-qa-ips>
              <IPAddress ips={linodeIpv4} copyRight />
              <IPAddress ips={[linodeIpv6]} copyRight />
            </div>
            <div className={classes.cardSection} data-qa-image>
              {imageLabel}
            </div>
            <div className={classes.cardSection}>
              <Tags tags={linodeTags} />
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

interface WithTypesProps {
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, { linodeId }: Props) => ({
  typesData: state.__resources.types.entities,
}));

export default compose(
  styled,
  withTypes,
  withRecentEvent,
)(LinodeCard) as React.ComponentType<Props>;

const ProgressDisplay: React.StatelessComponent<{
  progress: null | number;
  text: string;
  classes: {
    cardSection: string;
    statusProgress: string;
    statusText: string;
  };
}> = (props) => {
  const { classes, text, progress } = props;
  const displayProgress = progress ? `${progress}%` : ``;
  return (
    <Grid container className={classes.cardSection}>
      <Grid item>
        <Typography variant="body2" className={classes.statusText}>{text}: {displayProgress}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} lg={6} xl={6}>
        <div className={classes.statusProgress}>
          {progress ? <LinearProgress value={progress} /> : <LinearProgress variant="indeterminate" />}
        </div>
      </Grid>
    </Grid>
  );
};
