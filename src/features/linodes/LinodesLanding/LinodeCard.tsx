import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose, pathOr } from 'ramda';

import { withStyles, Theme, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { weblishLaunch } from 'src/features/Weblish';
import Grid from 'src/components/Grid';
import CircleProgress from 'src/components/CircleProgress';

import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import { typeLabelDetails, displayType } from '../presentation';
import transitionStatus from '../linodeTransitionStatus';
import LinodeStatusIndicator from './LinodeStatusIndicator';

type CSSClasses =
  'customeMQ'
  | 'cardSection'
  | 'flexContainer'
  | 'cardHeader'
  | 'cardContent'
  | 'distroIcon'
  | 'rightMargin'
  | 'actionMenu'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton'
  | 'loadingStatusText'
  | 'flag'
  | 'link';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
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
    marginBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    paddingLeft: 3,
    paddingRight: 3,
    color: theme.palette.text.primary,
    ...theme.typography.caption,
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    '& .title': {
      height: 48,
      padding: `0 ${theme.spacing.unit * 3}px`,
    },
  },
  cardHeader: {
    fontWeight: 700,
    color: 'black',
    flex: 1,
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
  },
  cardContent: {
    flex: 1,
    [theme.breakpoints.up('sm')]: {
      minHeight: 230,
    },
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
    fontWeight: 400,
    fontSize: '.9rem',
    transition: theme.transitions.create(['background-color', 'color']),
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  },
  consoleButton: {
    width: '50%',
    borderColor: theme.pale,
    borderRight: '1px solid ' + theme.palette.divider,
  },
  rebootButton: {
    width: '50%',
  },
  loadingStatusText: {
    fontSize: '1.1rem',
    color: '#444',
    textTransform: 'capitalize',
    position: 'relative',
    top: - theme.spacing.unit * 2,
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
});

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeType: null | string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeRecentEvent?: Linode.Event;
  linodeSpecDisk: number;
  linodeSpecMemory: number;
  linodeSpecVcpus: number;
  linodeSpecTransfer: number;
  image?: Linode.Image;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

interface ConnectedProps {
  typeLabel: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<CSSClasses>;

class LinodeCard extends React.Component<CombinedProps> {
  renderTitle() {
    const { classes, linodeStatus, linodeLabel, linodeNotification } = this.props;

    return (
      <Grid container alignItems="center">
        <Grid item className={'py0'}>
          <LinodeStatusIndicator status={linodeStatus} />
        </Grid>
        <Grid item className={classes.cardHeader + ' py0'}>
          <Typography variant="subheading" data-qa-label>
            {linodeLabel}
          </Typography>
        </Grid>
        {linodeNotification &&
          <Grid item className="py0">
            <Tooltip title={linodeNotification}><Flag className={classes.flag} /></Tooltip>
          </Grid>
        }
      </Grid>
    );
  }

  loadingState = () => {
    const { classes, linodeRecentEvent, linodeStatus } = this.props;
    const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;

    return (
      <CardContent className={classes.cardContent}>
        <Grid container>
          <Grid item xs={12}>
            <CircleProgress value={value} />
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" className={classes.loadingStatusText}>
              {linodeStatus.replace('_', ' ')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    );
  }

  loadedState = () => {
    const {
      classes,
      image,
      linodeIpv4,
      linodeIpv6,
      linodeRegion,
      linodeSpecMemory,
      linodeSpecDisk,
      linodeSpecVcpus,
      typeLabel,
    } = this.props;

    return (
      <CardContent className={`${classes.cardContent} ${classes.customeMQ}`}>
        <div>
          <div className={classes.cardSection} data-qa-linode-summary>
            {`${typeLabel}: `}
            {typeLabelDetails(linodeSpecMemory, linodeSpecDisk, linodeSpecVcpus)}
          </div>
          <div className={classes.cardSection} data-qa-region>
            <RegionIndicator region={linodeRegion} />
          </div>
          <div className={classes.cardSection} data-qa-ips>
            <IPAddress ips={linodeIpv4} copyRight />
            <IPAddress ips={[linodeIpv6]} copyRight />
          </div>
          {image &&
            <div className={classes.cardSection} data-qa-image>
              {image.label}
            </div>
          }
        </div>
      </CardContent>
    );
  }

  shouldComponentUpdate(nextProps: Props) {
    return haveAnyBeenModified<Props>(
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
      ],
    );
  }

  render() {
    const { classes, openConfigDrawer, linodeId, linodeLabel,
       linodeStatus, toggleConfirmation } = this.props;
    const loading = transitionStatus.includes(linodeStatus);

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3} data-qa-linode={linodeLabel}>
        <Card className={classes.flexContainer}>
          {/* Give Button a child of ' ', because the component requires children */}
          <Link to={`/linodes/${linodeId}`}>
            <Button className={classes.link}> </Button>
          </Link>
          <CardHeader
            subheader={this.renderTitle()}
            action={
              <div className={classes.actionMenu}>
                <LinodeActionMenu
                  linodeId={linodeId}
                  linodeLabel={linodeLabel}
                  linodeStatus={linodeStatus}
                  openConfigDrawer={openConfigDrawer}
                  toggleConfirmation={toggleConfirmation}
                />
              </div>
            }
            className={`${classes.customeMQ}} ${'title'}`}
          />
          <Divider />
          {loading ? this.loadingState() : this.loadedState()}
          <CardActions className={classes.cardActions}>
            <Button
              className={`${classes.button} ${classes.consoleButton}`}
              onClick={() => weblishLaunch(`${linodeId}`)}
              data-qa-console
            >
              Launch Console
            </Button>
            <Button
              className={`${classes.button}
              ${classes.rebootButton}`}
              onClick={() => toggleConfirmation('reboot', linodeId, linodeLabel)}
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

const connected = connect((state: Linode.AppState, ownProps: Props) => ({
  typeLabel: displayType(
    ownProps.linodeType,
    pathOr([], ['resources', 'types', 'data', 'data'],
    state),
  ),
}));

export default compose(
  withStyles(styles, { withTheme: true }),
  connected,
)(LinodeCard) as React.ComponentType<Props>;
