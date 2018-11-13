import * as classNames from 'classnames';
import { compose, path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Logo from 'src/assets/logo/logo-text.svg';
import Grid from 'src/components/Grid';
import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import ThemeToggle from './ThemeToggle';

interface PrimaryLink {
  display: string,
  href: string,
};

type ClassNames =
  'menuGrid'
  | 'fadeContainer'
  | 'logoItem'
  | 'listItem'
  | 'collapsible'
  | 'linkItem'
  | 'active'
  | 'activeLink'
  | 'sublink'
  | 'sublinkActive'
  | 'arrow'
  | 'sublinkPanel'
  | 'spacer'
  | 'listItemAccount'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  menuGrid: {
    minHeight: 64,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
  },
  fadeContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logoItem: {
    padding: '10px 0 8px 26px',
  },
  listItem: {
    padding: '16px 40px 16px 34px',
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderLeft: '6px solid transparent',
    transition: theme.transitions.create(['background-color', 'border-left-color']),
    flexShrink: 0,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    '&:hover': {
      borderLeftColor: 'rgba(0, 0, 0, 0.1)',
      '& $linkItem': {
        color: 'white',
      },
    },
    '&:focus, &:active': {
      '& $linkItem': {
        color: 'white',
        zIndex: 2,
      },
    },
  },
  listItemAccount: {
    '&:hover': {
      borderLeftColor: 'transparent',
    },
  },
  collapsible: {
    fontSize: '.9rem',
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontFamily: 'LatoWebBold',
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftColor: theme.color.green,
    '&:hover': {
      borderLeftColor: theme.color.green,
    },
  },
  sublinkPanel: {
    paddingLeft: theme.spacing.unit * 6,
    paddingRight: theme.spacing.unit * 2,
    fontSize: '.9rem',
    flexShrink: 0,
    listStyleType: 'none',
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
  activeLink: {
    color: 'white',
    '& $arrow': {
      transform: 'rotate(90deg)',
    },
  },
  sublinkActive: {
    textDecoration: 'underline',
  },
  arrow: {
    position: 'relative',
    top: 4,
    fontSize: '1.2rem',
    margin: '0 4px 0 -7px',
    transition: theme.transitions.create(['transform']),
  },
  spacer: {
    padding: 25,
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
});

interface Props extends WithStyles<ClassNames>, RouteComponentProps<{}> {
  closeMenu: () => void;
  toggleTheme: () => void;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: Record<string, boolean>;
  primaryLinks: PrimaryLink[];
}

type CombinedProps = Props & StateProps;

class PrimaryNav extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false,
    expandedMenus: {
      account: false,
      support: false,
    },
    primaryLinks: [],
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.createMenuItems();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.hasAccountAccess !== this.props.hasAccountAccess) {
      this.createMenuItems();
    }
  }

  createMenuItems = () => {
    const { hasAccountAccess } = this.props;

    const primaryLinks = [
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

    if (hasAccountAccess) {
      primaryLinks.push({ display: 'Account', href: '/account' });
    }

    this.setState({
      primaryLinks,
    })
  };

  navigate = (href: string) => {
    const { history, closeMenu } = this.props;
    history.push(href);
    closeMenu();
  }

  linkIsActive = (href: string) => {
    return isPathOneOf([href], this.props.location.pathname);
  }

  expandMenutItem = (e: React.MouseEvent<HTMLElement>) => {
    const menuName = e.currentTarget.getAttribute('data-menu-name');
    if (!menuName) { return };
    this.setState({
      expandedMenus: {
        ...this.state.expandedMenus,
        [menuName]: !this.state.expandedMenus[menuName],
      }
    });
  };

  goToHelp = () => {
    this.navigate('/support');
  }

  goToProfile = () => {
    this.navigate('/profile');
  }

  logOut = () => {
    this.navigate('/logout');
  }

  renderPrimaryLink = (primaryLink: PrimaryLink) => {
    const { classes } = this.props;

    return (
      <ListItem
        key={primaryLink.display}
        button
        divider
        component="li"
        role="menuitem"
        focusRipple={true}
        onClick={() => this.navigate(primaryLink.href)}
        className={`
          ${classes.listItem}
          ${this.linkIsActive(primaryLink.href) && classes.active}
        `}
      >
        <ListItemText
          primary={primaryLink.display}
          disableTypography={true}
          className={`
            ${classes.linkItem}
            ${this.linkIsActive(primaryLink.href) && classes.activeLink}
          `}
        />
      </ListItem>
    );
  }

  render() {
    const { classes, toggleTheme } = this.props;
    const { expandedMenus } = this.state;

    return (
      <React.Fragment>
        <Grid
          className={classes.menuGrid}
          container
          alignItems="flex-start"
          justify="flex-start"
          direction="column"
          wrap="nowrap"
          spacing={0}
          component="ul"
          role="menu"
        >
          <Grid item>
            <div className={classes.logoItem}>
              <Link to={`/dashboard`}>
                <Logo width={115} height={43} />
              </Link>
            </div>
          </Grid>
          <div className={classNames({
            ['fade-in-table']: true,
            [classes.fadeContainer]: true,
          })}>

            {this.state.primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}

            <ListItem
              button
              component="li"
              focusRipple={true}
              onClick={this.goToHelp}
              className={classNames({
                [classes.listItem]: true,
                [classes.collapsible]: true,
                [classes.active]: this.linkIsActive('/support') === true,
              })}
            >
              <ListItemText
                disableTypography={true}
                className={classNames({
                  [classes.linkItem]: true,
                  [classes.activeLink]:
                    expandedMenus.support
                    || this.linkIsActive('/support') === true,
                })}
              >
                Get Help
              </ListItemText>
            </ListItem>

            <Hidden mdUp>
              <Divider className={classes.divider} />
              <ListItem
                button
                component="li"
                focusRipple={true}
                onClick={this.goToProfile}
                className={classNames({
                  [classes.listItem]: true,
                  [classes.collapsible]: true,
                  [classes.active]: this.linkIsActive('/profile') === true,
                })}
              >
                <ListItemText
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true,
                    [classes.activeLink]:
                      expandedMenus.support
                      || this.linkIsActive('/profile') === true,
                  })}
                >
                  My Profile
                </ListItemText>
              </ListItem>
              <ListItem
                button
                component="li"
                focusRipple={true}
                onClick={this.logOut}
                className={classNames({
                  [classes.listItem]: true,
                  [classes.collapsible]: true,
                  [classes.active]: this.linkIsActive('/logout') === true,
                })}
              >
                <ListItemText
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true,
                    [classes.activeLink]:
                      expandedMenus.support
                      || this.linkIsActive('/logout') === true,
                  })}
                >
                  Log Out
                </ListItemText>
              </ListItem>
            </Hidden>
            <div className={classes.spacer} />
            <ThemeToggle toggleTheme={toggleTheme} />
          </div>
        </Grid>
      </React.Fragment>
    );
  }
}

interface StateProps {
  hasAccountAccess: boolean;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state, ownProps) => {
  const profile = path<Linode.Profile>(['__resources', 'profile', 'data'], state);
  const accountAccess = path<Linode.Grants>(['grants', 'global', 'account_access'], profile);

  /** Data hasnt loaded yes, lock it down. */
  if (!profile) {
    return {
      hasAccountAccess: false,
    }
  }

  /** If they're unrestricted, they can do w/e they want. */
  if (profile.restricted === false) {
    return {
      hasAccountAccess: true,
    }
  }

  /** Check the grants! */
  return {
    hasAccountAccess: Boolean(accountAccess),
  }
};


const connected = connect(mapStateToProps);

const enhanced: any = compose(
  withStyles(styles),
  withRouter,
  connected,
);

export default enhanced(PrimaryNav);
