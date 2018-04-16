import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Grid from 'src/components/Grid';
import LinodeTheme from 'src/theme';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';

import CircleProgress from 'src/components/CircleProgress';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import Flag from 'src/assets/icons/flag.svg';
import { weblishLaunch } from 'src/features/Weblish';

import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import { rebootLinode } from './powerActions';
import { typeLabelLong } from '../presentation';
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
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton'
  | 'loadingStatusText'
  | 'flag';

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
    color: LinodeTheme.palette.text.primary,
    ...theme.typography.caption,
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    fontWeight: 700,
    color: 'black',
    flex: 1,
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
  cardActions: {
    backgroundColor: '#f9f9f9',
    padding: 0,
  },
  button: {
    padding: '12px 12px 14px',
    height: '100%',
    margin: 0,
    borderTop: '1px solid ' + LinodeTheme.palette.divider,
  },
  consoleButton: {
    width: '50%',
    borderColor: theme.pale,
    borderRight: '1px solid ' + LinodeTheme.palette.divider,
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
});

interface Props {
  linode: Linode.EnhancedLinode;
  image?: Linode.Image;
  type?: Linode.LinodeType;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

class LinodeCard extends React.Component<Props & WithStyles<CSSClasses> > {
  renderTitle() {
    const { linode, classes } = this.props;

    return (
      <Grid container alignItems="center">
        <Grid item className={'py0'}>
          <LinodeStatusIndicator status={linode.status} />
        </Grid>
        <Grid item className={classes.cardHeader + ' py0'}>
          <Link to={`/linodes/${linode.id}`}>
            <Typography variant="subheading">
              {linode.label}
            </Typography>
          </Link>
        </Grid>
        {linode.notification &&
          <Grid item className="py0">
            <Tooltip title={linode.notification}><Flag className={classes.flag} /></Tooltip>
          </Grid>
        }
      </Grid>
    );
  }


  loadingState = () => {
    const { linode, classes } = this.props;
    const value = (linode.recentEvent && linode.recentEvent.percent_complete) || 1;

    return (
      <CardContent className={classes.cardContent}>
        <Grid container>
          <Grid item xs={12}>
            <CircleProgress value={value} />
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" className={classes.loadingStatusText}>
              {linode.status.replace('_', ' ')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    );
  }

  loadedState = () => {
    const { classes, image, type, linode } = this.props;

    return (
      <CardContent className={`${classes.cardContent} ${classes.customeMQ}`}>
      <div>
        {image && type &&
        <div className={classes.cardSection}>
          {typeLabelLong(type.memory, type.disk, type.vcpus)}
        </div>
        }
        <div className={classes.cardSection}>
          <RegionIndicator region={linode.region} />
        </div>
        <div className={classes.cardSection}>
          <IPAddress ips={linode.ipv4} copyRight />
          <IPAddress ips={[linode.ipv6]} copyRight />
        </div>
        {image && type &&
        <div className={classes.cardSection}>
          {image.label}
        </div>
        }
      </div>
    </CardContent>
    );
  }

  render() {
    const { classes, linode, openConfigDrawer } = this.props;
    const loading = transitionStatus.includes(linode.status);

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3}>
        <Card className={classes.flexContainer}>
          <CardHeader
            subheader={this.renderTitle()}
            action={
              <div style={{ position: 'relative', top: 6 }}>
                <LinodeActionMenu
                 linode={linode}
                 openConfigDrawer={openConfigDrawer}
                />
              </div>
            }
            className={classes.customeMQ}
          />
          {<Divider />}
          { loading ? this.loadingState() : this.loadedState() }
          <CardActions className={classes.cardActions}>
            <Button
              className={`${classes.button} ${classes.consoleButton}`}
              onClick={() => weblishLaunch(`${linode.id}`)}
            >
              <span className="btnLink">Launch Console</span>
            </Button>
            <Button
              className={`${classes.button}
              ${classes.rebootButton}`}
              onClick={() => rebootLinode(openConfigDrawer, linode.id, linode.label)}
            >
              <span className="btnLink">Reboot</span>
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LinodeCard);
