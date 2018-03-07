import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { compose } from 'redux';

import {
  withStyles,
  WithStyles,
  StyleRules,
  Theme,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';
import { ListItem, ListItemText } from 'material-ui/List';

import logoPng from 'src/assets/logo/logo.png';

type PrimaryLink = {
  display: string,
  href: string,
};

const primaryLinks: PrimaryLink[] = [
  { display: 'Dashboard', href: '/dashboard' },
  { display: 'Linodes', href: '/linodes' },
  { display: 'Volumes', href: '/volumes' },
  { display: 'NodeBalancers', href: '/nodebalancers' },
  { display: 'Domains', href: '/domains' },
  { display: 'Managed', href: '/managed' },
  { display: 'Longview', href: '/longview' },
  { display: 'StackScripts', href: '/stackscripts' },
  { display: 'Images', href: '/images' },
];

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  headerGrid: {
    minHeight: 64,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
  },
  logoItem: {
    paddingLeft: 40,
  },
  listItem: {
    padding: '18px 40px',
  },
  linkItem: {
    color: 'white',
    fontWeight: 700,
  },
});

interface Props extends WithStyles<'headerGrid' | 'logoItem' | 
'listItem' | 'linkItem'>, RouteComponentProps<{}> {
  toggleMenu: () => void;
}

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

  renderPrimaryLink(PrimaryLink: PrimaryLink) {
    const { classes } = this.props;

    return (
      <ListItem
        key={PrimaryLink.display}
        button
        divider
        onClick={() => this.navigate(PrimaryLink.href)}
        className={classes.listItem}
      >
        <ListItemText 
          primary={PrimaryLink.display}
          disableTypography={true}
          className={classes.linkItem}
        />
      </ListItem>
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
            <img width="120" height="48" src={logoPng} />
          </Grid>
        </Grid>
        <Divider />
        {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
