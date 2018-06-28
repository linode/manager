import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import * as classNames from 'classnames';

import { StyleRules, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';

import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

import Logo from 'src/assets/logo/logo-text.svg';

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

type ClassNames =
  'menuGrid'
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

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  menuGrid: {
    minHeight: 64,
    width: '100%',
    height: '100%',
    margin: 0,
    paddingBottom: theme.spacing.unit * 3,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
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
    padding: '16px 40px 16px 34px',
    alignItems: 'center',
    marginTop: 'auto',
    // hidding for now - replace with flex
    display: 'none',
  },
  toggle: {
    '& > span:last-child': {
      backgroundColor: '#f4f4f4 !important',
      /** @todo Had to remove !important */
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
  toggleMenu: () => void;
  toggleTheme: () => void;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: {
    [key: string]: boolean;
  };
}

class PrimaryNav extends React.Component<Props, State> {
  state: State = {
    drawerOpen: false,
    expandedMenus: {
      account: false,
      support: false,
    },
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

  expandMenutItem = (e: React.MouseEvent<HTMLElement>) => {
    const menuName = e.currentTarget.getAttribute('data-menu-name');
    if (!menuName) return;
    this.setState({
      expandedMenus: {
        ...this.state.expandedMenus,
        [menuName]: !this.state.expandedMenus[menuName],
      }
    });
  };

  renderPrimaryLink(PrimaryLink: PrimaryLink) {
    const { classes } = this.props;

    return (
      <ListItem
        key={PrimaryLink.display}
        button
        divider
        focusRipple={true}
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
    const { classes, toggleTheme, toggleMenu } = this.props;
    const { expandedMenus } = this.state;
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
        >
          <Grid item>
            <div className={classes.logoItem}>
              <Logo width={115} height={43} />
            </div>
          </Grid>

          {primaryLinks.map(primaryLink => this.renderPrimaryLink(primaryLink))}

          <ListItem 
            data-menu-name="account"
            focusRipple={true}
            button
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
            unmountOnExit
            className={classes.sublinkPanel}
          >
            <Link
              to="/billing"
              role="menuitem"
              onClick={toggleMenu}
              className={classNames({
                [classes.sublink]: true,
                [classes.sublinkActive]: this.linkIsActive('/billing') === true,
              })}
            >
              Account &amp; Billing
            </Link>
            <Link
              to="/users"
              role="menuitem"
              onClick={toggleMenu}
              className={classNames({
                [classes.sublink]: true,
                [classes.sublinkActive]: this.linkIsActive('/users') === true,
              })}
            >
              Users
            </Link>
          </Collapse>

          <ListItem
            data-menu-name="support"
            button
            focusRipple={true}
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
                  expandedMenus.support
                  || this.linkIsActive('/support') === true,
              })}
            >
              <KeyboardArrowRight className={classes.arrow} />
              Support
            </ListItemText>
          </ListItem>
          <Collapse 
            in={expandedMenus.support 
                || this.linkIsActive('/support') === true}
            timeout="auto" 
            unmountOnExit
            className={classes.sublinkPanel}
          >
            <a
              className={classes.sublink}
              href="https://www.linode.com/docs"
              target="_blank"
              role="menuitem"
            >
              Documentation
            </a>
            <a
              className={classes.sublink}
              href="//www.linode.com/community/questions"
              target="_blank"
              role="menuitem"
            >
              Community Forum
            </a>
            <Link
              to="/support"
              role="menuitem"
              onClick={toggleMenu}
              className={classNames({
                [classes.sublink]: true,
                [classes.sublinkActive]: this.linkIsActive('/support') === true,
              })}
            >
              Support Tickets
            </Link>
          </Collapse>

          <div className={classes.switchWrapper}>
            <span className={`
              ${classes.switchText}
              ${themeName === 'lightTheme' ? 'active' : ''}
            `}>
              Light
            </span>
            <Toggle
              onChange={() => toggleTheme()}
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

          <div className={classes.spacer} />
        </Grid>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(PrimaryNav);
