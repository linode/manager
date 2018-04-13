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
import Grid from 'src/components/Grid';
import { ListItem, ListItemText } from 'material-ui/List';
import LinodeTheme from 'src/theme';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import Logo from 'src/assets/logo/logo-text.svg';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';

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
    width: '100%',
    margin: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
  },
  logoItem: {
    padding: '10px 0 8px 34px',
  },
  listItem: {
    padding: '16px 40px 16px 34px',
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderLeft: '6px solid transparent',
    transition: theme.transitions.create(['background-color', 'border-left-color']),
    '&:hover': {
      borderLeftColor: 'rgba(0, 0, 0, 0.1)',
      '& $linkItem': {
        color: 'white',
      },
    },
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontWeight: 700,
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    transition: theme.transitions.create(['color', 'background-color']),
    '&:hover, &:focus': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    '& span': {
      color: '#C9CACB',
      transition: theme.transitions.create(['color']),
    },
    '& svg': {
      color: '#C9CACB',
      fontSize: '20px',
      margin: '5px 2px 4px 0',
      transition: theme.transitions.create(['color']),
    },
    '&:hover, &:focus, & .hOpen': {
      color: 'white',
      '& span, & svg': {
        color: 'white !important',
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
      outline: 0,
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
          <Grid item>
            <div className={classes.logoItem}>
              <Logo width={115} height={43} />
            </div>
          </Grid>
        </Grid>
        {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}
        <ShowMoreExpansion classes={{ root: classes.sublinkPanel }} name="Account">
          <Link
            className={classes.sublink}
            to="/billing"
            role="menuitem"
          >
            Account &amp; Billing
          </Link>
          <Link
            className={classes.sublink}
            to="/users"
            role="menuitem"
          >
            Users
          </Link>
        </ShowMoreExpansion>
        <ShowMoreExpansion classes={{ root: classes.sublinkPanel }} name="Support">
          <a
            className={classes.sublink}
            href="https://www.linode.com/docs"
            role="menuitem"
          >
            Documentation
          </a>
          <a
            className={classes.sublink}
            href="//www.linode.com/community/questions"
            role="menuitem"
          >
            Community Forum
          </a>
          <Link
            className={classes.sublink}
            to="/support"
            role="menuitem"
          >
            Support Tickets
          </Link>
        </ShowMoreExpansion>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
