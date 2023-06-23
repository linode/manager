import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Divider from 'src/components/core/Divider';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import Tooltip from 'src/components/core/Tooltip';

interface Props extends PrimaryLink {
  closeMenu: () => void;
  dividerClasses?: string;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  isCollapsed?: boolean;
}

export interface PrimaryLink {
  href?: string;
  onClick?: () => void;
  QAKey: string;
  display: string;
  logo?: React.ComponentType<any>;
  icon?: JSX.Element;
  isDisabled?: () => string;
}

export const NavItem = React.memo((props: Props) => {
  const {
    QAKey,
    closeMenu,
    display,
    href,
    icon,
    isCollapsed,
    isDisabled,
    linkClasses,
    listItemClasses,
    onClick,
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
          to={href}
          onClick={closeMenu}
          data-qa-nav-item={QAKey}
          className={classNames({
            [linkClasses(href)]: true,
            listItemCollapsed: isCollapsed,
          })}
        >
          {icon && isCollapsed && <div className="icon">{icon}</div>}
          <ListItemText
            primary={display}
            disableTypography={true}
            className={classNames({
              hiddenWhenCollapsed: isCollapsed,
              [listItemClasses]: true,
              primaryNavLink: true,
            })}
          />
        </Link>
      ) : (
        <Tooltip title={isDisabled ? isDisabled() : ''} placement="left-end">
          <ListItem
            onClick={(e) => {
              props.closeMenu();
              /* disregarding undefined is fine here because of the error handling thrown above */
              onClick!();
            }}
            aria-live="polite"
            disabled={!!isDisabled ? !!isDisabled() : false}
            data-qa-nav-item={QAKey}
            className={linkClasses()}
          >
            <ListItemText
              primary={display}
              disableTypography={true}
              className={listItemClasses}
            />
          </ListItem>
        </Tooltip>
      )}
      <Divider className={props.dividerClasses} />
    </React.Fragment>
  );
});
