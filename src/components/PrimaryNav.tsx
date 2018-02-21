import * as React from 'react';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import InboxIcon from 'material-ui-icons/Inbox';
import DashboardIcon from 'material-ui-icons/Dashboard';
import StorageIcon from 'material-ui-icons/Storage';
import DeviceHubIcon from 'material-ui-icons/DeviceHub';
import LanguageIcon from 'material-ui-icons/Language';
import BuildIcon from 'material-ui-icons/Build';
import InsertChartIcon from 'material-ui-icons/InsertChart';
import CodeIcon from 'material-ui-icons/Code';
import InsertPhotoIcon from 'material-ui-icons/InsertPhoto';

import logoPng from 'src/assets/logo/linode-logo-small.png';

const styles = (theme: any): any => ({
  headerGrid: theme.mixins.toolbar,
  logoItem: {
    paddingLeft: 16,
  },
  primaryLink: {
    textDecoration: 'none',
  },
});

const primaryLinks = [
  { display: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
  { display: 'Linodes', icon: StorageIcon, href: '/linodes' },
  { display: 'Volumes', icon: InboxIcon, href: '/volumes' },
  { display: 'NodeBalancers', icon: DeviceHubIcon, href: '/nodebalancers' },
  { display: 'Domains', icon: LanguageIcon, href: '/domains' },
  { display: 'Managed', icon: BuildIcon, href: '/managed' },
  { display: 'Longview', icon: InsertChartIcon, href: '/longview' },
  { display: 'StackScripts', icon: CodeIcon, href: '/stackscripts' },
  { display: 'Images', icon: InsertPhotoIcon, href: '/images' },
];

class PrimaryNav extends React.Component<any, any> {
  state = {
    drawerOpen: false,
  };

  renderPrimaryLink(PrimaryLink: any) {
    const { classes } = this.props;
    
    return (
      <Link to={PrimaryLink.href} className={classes.primaryLink}>
        <ListItem button divider>
          <ListItemIcon>
            <PrimaryLink.icon />
          </ListItemIcon>
          <ListItemText primary={PrimaryLink.display} />
        </ListItem>
      </Link>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid
          className={classes.headerGrid}
          container
          alignItems="center"
          spacing={0}
        >
          <Grid item className={classes.logoItem}>
            <img src={logoPng} />
          </Grid>
        </Grid>
        <Divider />
        {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PrimaryNav);
