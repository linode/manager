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
import Typography from 'material-ui/Typography';

import CloudCircle from 'material-ui-icons/CloudCircle';

import LinodeStatusIndicator from 'src/components/LinodeStatusIndicator';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import Tag from 'src/components/Tag';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { typeLabelLong } from './presentation';

import Arch from 'src/assets/distros/Arch.png';
import CentOS from 'src/assets/distros/CentOS.png';
import ContainerLinux from 'src/assets/distros/ContainerLinux.png';
import Debian from 'src/assets/distros/Debian.png';
import Fedora from 'src/assets/distros/Fedora.png';
import Gentoo from 'src/assets/distros/Gentoo.png';
import OpenSUSE from 'src/assets/distros/OpenSUSE.png';
import Slackware from 'src/assets/distros/Slackware.png';
import Ubuntu from 'src/assets/distros/Ubuntu.png';

const distroIcons = {
  Arch,
  CentOS,
  CoreOS: ContainerLinux,
  Debian,
  Fedora,
  Gentoo,
  openSUSE: OpenSUSE,
  Slackware,
  Ubuntu,
};

type CSSClasses = 
  'cardSection'
  | 'cardHeader'
  | 'distroIcon'
  | 'rightMargin'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  cardSection: {
    marginTop: theme.spacing.unit * 2,
  },
  cardHeader: {
    fontWeight: 700,
    color: 'black',
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
  },
  consoleButton: {
    width: '60%',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    border: '1px solid',
    borderWidth: '0 1px 0 0',
  },
  rebootButton: {
    width: '40%',
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
      <Grid item xs={12} sm={6} lg={4} xl={3}>
        <Card>
          <CardHeader
            subheader={this.renderTitle()}
            action={
              <ActionMenu actions={actions} />
            }
          />
          {<Divider />}
          <CardContent>
            <div>
              {tags.map((tag: string, idx) => <Tag key={idx} label={tag} />)}
            </div>
            {image && type &&
              <div className={classes.cardSection}>
                <Grid container>
                  <Grid item className="tac" xs={2}>
                    {image.vendor ?
                      <img src={distroIcons[image.vendor]} className={classes.distroIcon}/>
                      : <CloudCircle className={classes.distroIcon} />
                    }
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="subheading">
                      {image.label}
                    </Typography>
                    <Typography>
                      {typeLabelLong(type.memory, type.disk, type.vcpus)}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            }
            <div className={classes.cardSection}>
              <div>
                <IPAddress ips={linode.ipv4} copyRight />
              </div>
              <div>
                <IPAddress ips={[linode.ipv6]} copyRight />
              </div>
            </div>
            <div className={classes.cardSection}>
              <RegionIndicator region={linode.region} />
            </div>
          </CardContent>
          <Divider />
          <CardActions className={classes.cardActions}>
            <Button className={`${classes.button} ${classes.consoleButton}`}>
              Launch Console
            </Button>
            <Button className={`${classes.button} ${classes.rebootButton}`}>
              Reboot
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LinodeCard);
