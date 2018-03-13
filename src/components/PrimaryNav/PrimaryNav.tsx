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
import LinodeTheme from 'src/theme';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import logoPng from 'src/assets/logo/logo.png';

import './PrimaryNav.css';

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
    padding: '16px 40px 16px 34px',
    borderLeft: '6px solid transparent',
  },
  linkItem: {
    color: '#C9CACB',
    fontWeight: 700,
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderLeftColor: LinodeTheme.color.green,
  },
  activeLink: {
    color: 'white',
  },
});

type ClassNames =
  'headerGrid'
  | 'logoItem'
  | 'listItem'
  | 'linkItem'
  | 'active'
  | 'activeLink';

interface Props extends WithStyles<ClassNames>, RouteComponentProps<{}> {
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

  linkIsActive(href: string) {
    return isPathOneOf([href], this.props.location.pathname);
  }

  renderPrimaryLink(PrimaryLink: PrimaryLink) {
    const { classes } = this.props;

    return (
      <ListItem
        key={PrimaryLink.display}
        button
        divider
        onClick={() => this.navigate(PrimaryLink.href)}
        className={`
          ${classes.listItem}
          ${this.linkIsActive(PrimaryLink.href) && classes.active}
        `}
      >
        <ListItemText 
          primary={PrimaryLink.display}
          disableTypography={true}
          className={`
            ${classes.linkItem}
            ${this.linkIsActive(PrimaryLink.href) && classes.activeLink}
          `}
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
