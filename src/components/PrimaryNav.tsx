import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { compose } from 'redux';

import {
  withStyles,
  StyledComponentProps,
} from 'material-ui/styles';
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

import { TodoAny } from 'src/utils';

const styles = (theme: any): any => ({
  headerGrid: theme.mixins.toolbar,
  logoItem: {
    paddingLeft: 16,
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

type Props = StyledComponentProps & RouteComponentProps<{}> & {
  toggleMenu: () => void, 
};

class PrimaryNav extends React.Component<Props> {
  state = {
    drawerOpen: false,
  };

  constructor(props: Props) {
    super(props);
  }

  navigate(href: string) {
    const { history , toggleMenu } = this.props;
    history.push(href);
    toggleMenu();
  }

  renderPrimaryLink(PrimaryLink: any) {
    return (
      <ListItem
        key={PrimaryLink.display}
        button
        divider
        onClick={() => this.navigate(PrimaryLink.href)}
      >
        <ListItemIcon>
          <PrimaryLink.icon />
        </ListItemIcon>
        <ListItemText primary={PrimaryLink.display} />
      </ListItem>
    );
  }

  render() {
    const { classes } = this.props;

    if (!classes) {
      return null;
    }

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

export default compose<TodoAny, TodoAny, TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
