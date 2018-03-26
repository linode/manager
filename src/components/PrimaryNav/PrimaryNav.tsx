import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
  Link,
} from 'react-router-dom';
import { compose } from 'redux';

import {
  withStyles,
  WithStyles,
  StyleRules,
  Theme,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import { ListItem, ListItemText } from 'material-ui/List';
import LinodeTheme from 'src/theme';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import logoPng from 'src/assets/logo/logo.png';
import ExpandPanel from 'src/components/ExpandPanel';

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
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
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
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderLeft: '6px solid transparent',
    '&:hover': {
      borderLeftColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
  linkItem: {
    color: '#C9CACB',
    fontWeight: 700,
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderLeftColor: LinodeTheme.color.green,
    '&:hover': {
      borderLeftColor: LinodeTheme.color.green,
    },
  },
  activeLink: {
    color: 'white',
  },
  sublinkPanel: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    fontSize: '.9rem',
    transition: 'color 225ms ease-in-out, background-color 225ms ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    '& span': {
      color: '#C9CACB',
      transition: 'color 225ms ease-in-out',
    },
    '& svg': {
      color: '#C9CACB',
      fontSize: '20px',
      margin: '5px 2px 4px 0',
      transition: 'color 225ms ease-in-out',
    },
    '&:hover, &:focus, & .hOpen': {
      color: 'white',
      '& span, & svg': {
        color: 'white',
      },
    },
    '& .pOpen': {
      margin: '5px 0 0 14px',
    },
  },
  sublink: {
    padding: '4px 0 4px 8px',
    color: 'white',
    display: 'block',
    fontSize: '.8rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
});

type ClassNames =
  'headerGrid'
  | 'logoItem'
  | 'listItem'
  | 'linkItem'
  | 'active'
  | 'activeLink'
  | 'sublink'
  | 'sublinkPanel';

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
        {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}
        <ExpandPanel classes={{ root: classes.sublinkPanel }} name="Account">
          <Link className={classes.sublink} to="/billing">Account &amp; Billing</Link>
          <Link className={classes.sublink} to="/users">Users</Link>
        </ExpandPanel>
        <ExpandPanel classes={{ root: classes.sublinkPanel }} name="Support">
          <Link className={classes.sublink} to="/documentation">Documentation</Link>
          <a
            className={classes.sublink}
            href="//www.linode.com/community/questions"
          >
            Community Forum
          </a>
          <Link className={classes.sublink} to="/support">Support Tickets</Link>
        </ExpandPanel>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
