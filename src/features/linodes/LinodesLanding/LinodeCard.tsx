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

import LinodeStatusIndicator from 'src/components/LinodeStatusIndicator';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import Tag from 'src/components/Tag';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { typeLabelLong } from './presentation';

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
  | 'rebootButton';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  cardSection: {
    marginBottom: theme.spacing.unit,
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

  render() {
    const { classes, linode, image, type, actions } = this.props;

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     * */
    const tags = [linode.group].filter(Boolean);

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
          <CardContent className={classes.cardContent}>
            <div>
              {tags.map((tag: string, idx) => <Tag key={idx} label={tag} />)}
            </div>
            {image && type &&
            <div>
              <div className={classes.cardSection}>
                {image.label}
              </div>
              <div className={classes.cardSection}>
                {typeLabelLong(type.memory, type.disk, type.vcpus)}
              </div>
            </div>
            }
            <div className={classes.cardSection}>
              <IPAddress ips={linode.ipv4} copyRight />
            </div>
            <div className={classes.cardSection}>
              <IPAddress ips={[linode.ipv6]} copyRight />
            </div>
            <div className={classes.cardSection}>
              <RegionIndicator region={linode.region} />
            </div>
          </CardContent>
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
