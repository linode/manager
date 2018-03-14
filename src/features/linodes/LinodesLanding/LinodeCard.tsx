import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import LinodeTheme from 'src/theme';
import Typography from 'material-ui/Typography';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import Tag from 'src/components/Tag';
import CircleProgress from 'src/components/CircleProgress';

import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { typeLabelLong } from './presentation';
import transitionStatus from './linodeTransitionStatus';
import LinodeStatusIndicator from './LinodeStatusIndicator';

type CSSClasses = 
  'cardSection'
  | 'flexContainer'
  | 'cardHeader'
  | 'cardContent'
  | 'distroIcon'
  | 'rightMargin'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton'
  | 'loadingStatusText';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  cardSection: {
    marginBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: '90%',
    color: LinodeTheme.palette.text.primary,
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    fontWeight: 700,
    color: 'black',
  },
  cardContent: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
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
});

interface Props {
  linode: (Linode.Linode & { recentEvent?: Linode.Event });
  image?: Linode.Image;
  type?: Linode.LinodeType;
  actions: Action[];
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
          {linode.label}
        </Grid>
      </Grid>
    );
  }


  loadingState = () => {
    const { linode, classes } = this.props;

    const value = (linode.recentEvent && linode.recentEvent.percent_complete !== null)
    ? Math.max(linode.recentEvent.percent_complete, 1)
    : true;

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

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     * */
    const tags = [linode.group].filter(Boolean);

    return (
      <CardContent className={classes.cardContent}>
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
      <div className={classes.cardSection}>
        {tags.map((tag: string, idx) => <Tag key={idx} label={tag} />)}
      </div>
    </CardContent>
    );
  }

  render() {
    const { classes, linode, actions } = this.props;
    const loading = transitionStatus.includes(linode.status);

    return (
      <Grid item xs={12} sm={6} lg={4}>
        <Card className={classes.flexContainer}>
          <CardHeader
            subheader={this.renderTitle()}
            action={
              <ActionMenu actions={actions} />
            }
          />
          {<Divider />}
          { loading ? this.loadingState() : this.loadedState() }
          <CardActions className={classes.cardActions}>
            <Button className={`${classes.button} ${classes.consoleButton}`}>
              <span className="btnLink">Launch Console</span>
            </Button>
            <Button className={`${classes.button} ${classes.rebootButton}`}>
              <span className="btnLink">Reboot</span>
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LinodeCard);
