import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import Divider from 'src/components/core/Divider';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import Tooltip from 'src/components/core/Tooltip';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props extends PrimaryLink {
  closeMenu: () => void;
  dividerClasses?: string;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
}

export interface PrimaryLink {
  href?: string;
  onClick?: () => void;
  key: string;
  display: string;
  logo?: React.ComponentType<any>;
  isDisabled?: () => string | undefined;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NavItem: React.SFC<CombinedProps> = props => {
  const {
    href,
    onClick,
    key,
    display,
    isDisabled,
    linkClasses,
    listItemClasses,
    closeMenu
  } = props;

  if (!onClick && !href) {
    throw new Error('A Primary Link needs either an href or an onClick prop');
  }

  return (
    /* 
     href takes priority here. So if an href and onClick 
     are provided, the onClick will not be applied
    */
    <React.Fragment>
      {href ? (
        <Link
          role="menuitem"
          to={href}
          onClick={closeMenu}
          data-qa-nav-item={key}
          className={linkClasses(href)}
        >
          <ListItemText
            primary={display}
            disableTypography={true}
            className={listItemClasses}
          />
        </Link>
      ) : (
        <React.Fragment>
          <Tooltip title={isDisabled ? isDisabled() : ''} placement="left-end">
            <ListItem
              role="menuitem"
              onClick={e => {
                props.closeMenu();
                /* disregarding undefined is fine here because of the error handling thrown above */
                onClick!();
              }}
              disabled={!!isDisabled ? !!isDisabled() : false}
              data-qa-nav-item={key}
              className={linkClasses()}
            >
              <ListItemText
                primary={display}
                disableTypography={true}
                className={listItemClasses}
              />
            </ListItem>
          </Tooltip>
        </React.Fragment>
      )}
      <Divider className={props.dividerClasses} />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(NavItem);
