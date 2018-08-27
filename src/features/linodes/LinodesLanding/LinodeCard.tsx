import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import { withTypes } from 'src/context/types';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
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
    ...theme.typography.caption,
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
    fontWeight: 400,
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
    borderColor: theme.pale,
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
  linodeBackups: Linode.LinodeBackups;
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

interface TypesContextProps {
  typesLoading: boolean;
  typesData: Linode.LinodeType[];
}

type CombinedProps =
  Props &
  TypesContextProps &
  WithStyles<CSSClasses>;

class LinodeCard extends React.Component<CombinedProps> {
  renderTitle() {
    const { classes, linodeStatus, linodeLabel, linodeNotification } = this.props;

    return (
      <Grid container alignItems="center">
        <Grid item className={'py0'}>
          <LinodeStatusIndicator status={linodeStatus} />
        </Grid>
        <Grid item className={classes.cardHeader + ' py0'}>
          <Typography role="header" variant="subheading" data-qa-label>
            {linodeLabel}
          </Typography>
        </Grid>
        {linodeNotification &&
          <Grid item className={classes.flagContainer}>
            <Tooltip title={linodeNotification}><Flag className={classes.flag} /></Tooltip>
          </Grid>
        }
      </Grid>
    );
  }

  handleConsoleButtonClick = () => {
    const { linodeId } = this.props;
    lishLaunch(`${linodeId}`);
  }

  handleRebootButtonClick = () => {
    const { linodeId, linodeLabel, toggleConfirmation} = this.props;
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
      linodeType,
      typesData,
    } = this.props;

    return (
      <CardContent className={`${classes.cardContent} ${classes.customeMQ}`}>
        <div>
          <div className={classes.cardSection} data-qa-linode-summary>
            { typesData && `${displayType(linodeType, typesData || [])}: ` }
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
        </div>
      </CardContent>
    );
  }

  shouldComponentUpdate(nextProps: CombinedProps) {
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
        'typesLoading',
      ],
    );
  }

  render() {
    const { classes, openConfigDrawer, linodeId, linodeLabel, linodeRecentEvent,
      linodeStatus, linodeBackups, toggleConfirmation } = this.props;
    const loading = linodeInTransition(linodeStatus, linodeRecentEvent)

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

const typesContext = withTypes(({ data: typesData, loading: typesLoading }) => ({
  typesData,
  typesLoading,
}));

export default compose(
  withStyles(styles, { withTheme: true }),
  typesContext,
)(LinodeCard) as React.ComponentType<Props>;
