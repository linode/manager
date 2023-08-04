import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Divider } from 'src/components/Divider';
import { ListItem } from 'src/components/ListItem';
import { ListItemText } from 'src/components/ListItemText';
import { Tooltip } from 'src/components/Tooltip';

interface Props extends PrimaryLink {
  closeMenu: () => void;
  dividerClasses?: string;
  isCollapsed?: boolean;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
}

export interface PrimaryLink {
  QAKey: string;
  display: string;
  href?: string;
  icon?: JSX.Element;
  isDisabled?: () => string;
  logo?: React.ComponentType<any>;
  onClick?: () => void;
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
          className={classNames({
            [linkClasses(href)]: true,
            listItemCollapsed: isCollapsed,
          })}
          data-qa-nav-item={QAKey}
          onClick={closeMenu}
          to={href}
        >
          {icon && isCollapsed && <div className="icon">{icon}</div>}
          <ListItemText
            className={classNames({
              hiddenWhenCollapsed: isCollapsed,
              [listItemClasses]: true,
              primaryNavLink: true,
            })}
            disableTypography={true}
            primary={display}
          />
        </Link>
      ) : (
        <Tooltip placement="left-end" title={isDisabled ? isDisabled() : ''}>
          <ListItem
            onClick={(e) => {
              props.closeMenu();
              /* disregarding undefined is fine here because of the error handling thrown above */
              onClick!();
            }}
            aria-live="polite"
            className={linkClasses()}
            data-qa-nav-item={QAKey}
            disabled={!!isDisabled ? !!isDisabled() : false}
          >
            <ListItemText
              className={listItemClasses}
              disableTypography={true}
              primary={display}
            />
          </ListItem>
        </Tooltip>
      )}
      <Divider className={props.dividerClasses} />
    </React.Fragment>
  );
});
