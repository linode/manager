import * as classNames from 'classnames';
import { compose, path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';

import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

type ClassNames =
  'activeLink'
  | 'arrow'
  | 'collapsible'
  | 'linkItem'
  | 'listItem'
  | 'listItemAccount'
  | 'sublink'
  | 'sublinkActive'
  | 'sublinkPanel';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  activeLink: {
    color: 'white',
    '& $arrow': {
      transform: 'rotate(90deg)',
    },
  },
  arrow: {
    position: 'relative',
    top: 4,
    fontSize: '1.2rem',
    margin: '0 4px 0 -7px',
    transition: theme.transitions.create(['transform']),
  },
  collapsible: {
    fontSize: '.9rem',
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontFamily: 'LatoWebBold',
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
  listItemAccount: {
    '&:hover': {
      borderLeftColor: 'transparent',
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
  sublinkActive: {
    textDecoration: 'underline',
  },
  sublinkPanel: {
    paddingLeft: theme.spacing.unit * 6,
    paddingRight: theme.spacing.unit * 2,
    fontSize: '.9rem',
    flexShrink: 0,
    listStyleType: 'none',
  },
});

interface Props {
  expandedMenus: Record<string, boolean>;
  closeMenu: () => void;
  linkIsActive: (s: string) => Boolean;
  expandMenutItem: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps =
  Props
  & StateProps
  & WithStyles<ClassNames>;

const AccountNavigation: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    hasAccountAccess,
    classes,
    closeMenu,
    expandedMenus,
    expandMenutItem,
    linkIsActive,
  } = props;

  if (!hasAccountAccess) {
    return null;
  }

  return (
    <React.Fragment>
      <ListItem
        data-menu-name="account"
        focusRipple={true}
        button
        component="li"
        role="menuitem"
        onClick={expandMenutItem}
        className={classNames({
          [classes.listItem]: true,
          [classes.listItemAccount]: true,
          [classes.collapsible]: true,
        })}
      >
        <ListItemText
          disableTypography={true}
          className={classNames({
            [classes.linkItem]: true,
            [classes.activeLink]: expandedMenus.account
              || linkIsActive('/billing') === true
              || linkIsActive('/users') === true,
          })}
        >
          <KeyboardArrowRight className={classes.arrow} />
          Account
        </ListItemText>
      </ListItem>
      <Collapse
        in={expandedMenus.account
          || (linkIsActive('/billing') === true)
          || (linkIsActive('/users') === true)}
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
              [classes.sublinkActive]: linkIsActive('/billing') === true,
            })}
            onClick={closeMenu}
          >
            Account &amp; Billing
          </Link>
        </li>}
        <li role="menuitem">
          <Link
            to="/users"
            className={classNames({
              [classes.sublink]: true,
              [classes.sublinkActive]: linkIsActive('/users') === true,
            })}
            onClick={closeMenu}
          >
            Users
          </Link>
        </li>
      </Collapse>
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  hasAccountAccess: boolean;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => {
  const profile = path<Linode.Profile>(['state', '__resources', 'profile', 'data'], state);

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
    hasAccountAccess: Boolean(profile.grants.global.account_access),
  }
};

const connected = connect(mapStateToProps);

const enhanced = compose(connected, styled);

export default enhanced(AccountNavigation);
