import * as classNames from 'classnames';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import Logo from 'src/assets/logo/logo-text.svg';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';

import { getAccountSettings } from 'src/services/account';

interface PrimaryLink {
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
  | 'switchWrapper'
  | 'toggle'
  | 'switchText'
  | 'spacer';

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
  collapsible: {
    fontSize: '.9rem',
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontWeight: 700,
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
  switchWrapper: {
    padding: '16px 40px 0 34px',
    alignItems: 'center',
    marginTop: 'auto',
    width: 'calc(100% - 20px)',
    justifyContent: 'center',
    display: 'flex',
  },
  toggle: {
    '& > span:last-child': {
      backgroundColor: '#f4f4f4 !important',
      opacity: 0.38,
    },
    '&.darkTheme .square': {
      fill: '#444 !important',
    },
  },
  switchText: {
    color: '#777',
    fontSize: '.8rem',
    transition: theme.transitions.create(['color']),
    '&.active': {
      transition: theme.transitions.create(['color']),
      color: '#C9CACB',
    },
  },
  spacer: {
    padding: 25,
  },
});

interface Props extends WithStyles<ClassNames>, RouteComponentProps<{}> {
  closeMenu: () => void;
  toggleTheme: () => void;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: {
    [key: string]: boolean;
  };
  userHasManaged?: boolean;
}

class PrimaryNav extends React.Component<Props, State> {
  state: State = {
    drawerOpen: false,
    expandedMenus: {
      account: false,
      support: false,
    },
    userHasManaged: undefined,
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;

    getAccountSettings()
      .then(data => this.mounted && this.setState({ userHasManaged: data.managed }))
      /*
      * Don't really need to do any error handling here since
      * the fallback is the Managed navigation tab not rendering
      */
      .catch(e => e);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  navigate(href: string) {
    const { history, closeMenu } = this.props;
    history.push(href);
    closeMenu();
  }

  linkIsActive(href: string) {
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

  renderPrimaryLink(primaryLink: PrimaryLink) {
    const { classes } = this.props;

    if (primaryLink.display === 'Managed' && !this.state.userHasManaged) { return; }

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
    const { classes, toggleTheme, closeMenu } = this.props;
    const { expandedMenus, userHasManaged } = this.state;
    const themeName = (this.props.theme as any).name;

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

          {userHasManaged !== undefined &&
            <div className={classNames(
              'fade-in-table',
              {
                [classes.fadeContainer]: true,
              }
            )}>

              {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}

              <ListItem
                data-menu-name="account"
                focusRipple={true}
                button
                component="li"
                role="menuitem"
                onClick={this.expandMenutItem}
                className={classNames({
                  [classes.listItem]: true,
                  [classes.collapsible]: true,
                })}
              >
                <ListItemText
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true,
                    [classes.activeLink]:
                      expandedMenus.account
                      || this.linkIsActive('/billing') === true
                      || this.linkIsActive('/users') === true,
                  })}
                >
                  <KeyboardArrowRight className={classes.arrow} />
                  Account
              </ListItemText>
              </ListItem>
              <Collapse
                in={expandedMenus.account
                  || (this.linkIsActive('/billing') === true)
                  || (this.linkIsActive('/users') === true)}
                timeout="auto"
                component="ul"
                unmountOnExit
                className={classes.sublinkPanel}
              >
                <li role="menuitem">
                  <Link
                    to="/billing"
                    className={classNames({
                      [classes.sublink]: true,
                      [classes.sublinkActive]: this.linkIsActive('/billing') === true,
                    })}
                    onClick={closeMenu}
                  >
                    Account &amp; Billing
                </Link>
                </li>
                <li role="menuitem">
                  <Link
                    to="/users"
                    className={classNames({
                      [classes.sublink]: true,
                      [classes.sublinkActive]: this.linkIsActive('/users') === true,
                    })}
                    onClick={closeMenu}
                  >
                    Users
                </Link>
                </li>
              </Collapse>

              <ListItem
                button
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

              <div className={classes.spacer} />

              <div className={classes.switchWrapper}>
                <span className={`
                ${classes.switchText}
                ${themeName === 'lightTheme' ? 'active' : ''}
              `}>
                  Light
              </span>
              <Toggle
                onChange={toggleTheme}
                checked={themeName !== 'lightTheme'}
                className={`
                  ${classes.toggle}
                  ${themeName}
                `}
                />
                <span
                  className={`
                  ${classes.switchText}
                  ${themeName === 'darkTheme' ? 'active' : ''}
                `}
                  style={{ marginLeft: 4 }}
                >
                  Dark
              </span>
              </div>
            </div>
          }
        </Grid>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
