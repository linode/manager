import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Flag from 'src/assets/icons/flag.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Card from 'src/components/core/Card';
import CardActions from 'src/components/core/CardActions';
import CardContent from 'src/components/core/CardContent';
import CardHeader from 'src/components/core/CardHeader';
import Divider from 'src/components/core/Divider';
import IconButton from 'src/components/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Tags from 'src/components/Tags';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
import { getType } from 'src/services/linodes';
import { sendEvent } from 'src/utilities/analytics';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import { displayType, typeLabelDetails } from '../presentation';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';

type CSSClasses =
  'customeMQ'
  | 'cardSection'
  | 'flexContainer'
  | 'cardHeader'
  | 'cardContent'
  | 'cardLoadingContainer'
  | 'distroIcon'
  | 'rightMargin'
  | 'actionMenu'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton'
  | 'loadingStatusText'
  | 'flag'
  | 'flagContainer'
  | 'linkWrapper'
  | 'StatusIndicatorWrapper'
  | 'link'
  | 'wrapHeader';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  customeMQ: {
    '@media (min-width: 600px) and (max-width: 680px)': {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
    '@media (min-width: 1280px) and (max-width: 1400px)': {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  cardSection: {
    ...theme.typography.body1,
    marginBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    paddingLeft: 3,
    paddingRight: 3,
    color: theme.palette.text.primary,
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    '& .title': {
      minHeight: 48,
      padding: `0 ${theme.spacing.unit * 3}px`,
    },
  },
  cardHeader: {
    fontFamily: 'LatoWebBold',
    color: 'black',
    marginLeft: theme.spacing.unit,
    // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
    minWidth: 0,
  },
  cardContent: {
    flex: 1,
    [theme.breakpoints.up('sm')]: {
      minHeight: 230,
    },
  },
  cardLoadingContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  distroIcon: {
    marginTop: theme.spacing.unit,
    width: theme.spacing.unit * 3,
  },
  rightMargin: {
    marginRight: theme.spacing.unit,
  },
  actionMenu: {
    position: 'relative',
    top: 9,
    '& button': {
      height: 48,
    },
  },
  cardActions: {
    backgroundColor: theme.bg.offWhite,
    padding: 0,
  },
  button: {
    padding: '12px 12px 14px',
    height: '100%',
    margin: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    fontFamily: 'LatoWeb',
    fontSize: '.9rem',
    transition: theme.transitions.create(['background-color', 'color']),
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    '&:focus': {
      outline: '1px dotted #999',
    },
  },
  consoleButton: {
    width: '50%',
    /** @todo This was theme.pale, which doesnt exist. */
    // borderColor: theme.pale,
    borderRight: '1px solid ' + theme.palette.divider,
  },
  rebootButton: {
    width: '50%',
  },
  loadingStatusText: {
    fontSize: '1.1rem',
    textTransform: 'capitalize',
    position: 'relative',
    top: - theme.spacing.unit * 2,
  },
  flagContainer: {
    padding: 0,
    position: 'relative',
    zIndex: 5,
  },
  flag: {
    transition: theme.transitions.create('opacity'),
    opaity: 1,
    '&:hover': {
      opacity: .75,
    },
  },
  link: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 48,
    width: '100%',
    '&:hover': {
      backgroundColor: 'transparent',
      '& + .title h3': {
        color: theme.palette.primary.main,
      },
    },
  },
  StatusIndicatorWrapper: {
    position: 'relative',
    top: 2,
  },
  linkWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
    minWidth: 0,
  },
  wrapHeader: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

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
  linodeRecentEvent?: Linode.Event;
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
  & WithTheme
  & WithStyles<CSSClasses>;

class LinodeCard extends React.Component<CombinedProps, State> {
  state: State = {
    mutationAvailable: false,
  }

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<CombinedProps>(
      nextProps,
      this.props,
      [
        'linodeStatus',
        'linodeRegion',
        'linodeNotification',
        'linodeRecentEvent',
        'linodeLabel',
        'linodeIpv6',
        'linodeIpv4',
        'typesData',
      ],
    )
      || this.props.theme.name !== nextProps.theme.name
  }

  componentDidMount() {
    const { linodeType } = this.props;
    if (!linodeType) { return }
    getType(linodeType)
      .then((data: Linode.LinodeType) => {
        if (data.successor && data.successor !== null) {
          this.setState({ mutationAvailable: true })
        }
      })
      .catch((e: Error) => e)
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

  loadingState = () => {
    const { classes, linodeRecentEvent, linodeStatus } = this.props;
    const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;

    return (
      <CardContent className={`${classes.cardContent} ${classes.cardLoadingContainer}`}>
        <Grid container>
          <Grid item xs={12}>
            <CircleProgress value={value} noTopMargin />
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" className={classes.loadingStatusText}>
              {transitionText(linodeStatus, linodeRecentEvent)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    );
  }

  loadedState = () => {
    const {
      classes,
      imageLabel,
      linodeIpv4,
      linodeIpv6,
      linodeRegion,
      linodeSpecMemory,
      linodeSpecDisk,
      linodeSpecVcpus,
      linodeTags,
      linodeType,
      typesData,
    } = this.props;

    return (
      <CardContent className={`${classes.cardContent} ${classes.customeMQ}`}>
        <div>
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
        </div>
      </CardContent>
    );
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
    const { classes, openConfigDrawer, linodeId, linodeLabel, linodeRecentEvent,
      linodeStatus, linodeBackups, toggleConfirmation } = this.props;
    const loading = linodeInTransition(linodeStatus, linodeRecentEvent)

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
          {loading ? this.loadingState() : this.loadedState()}
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

import { connect } from 'react-redux';
interface WithTypesProps {
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities,
}));


export default compose(
  withStyles(styles, { withTheme: true }),
  withTypes,
)(LinodeCard) as React.ComponentType<Props>;
