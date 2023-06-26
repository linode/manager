import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

const isExternal = (href: string) => {
  return href.match(/http/) || href.match(/mailto/);
};

interface Props extends LinkProps {
  /**
   * The link's destination. If the value contains `http` or `mailto`, it will be considered an external link and open in a new window.
   */
  to: string;
  /**
   * The clickable text or content.
   */
  children?: React.ReactNode;
  /**
   * When `true`, clicking the link will replace the current entry in the history stack instead of adding a new one.
   * @default false
   * @see https://reactrouter.com/web/api/Link/replace-bool
   */
  replace?: boolean;
  /**
   * Optional CSS class names that are applied to the component.
   */
  className?: string;
  /**
   * A function that will be called onClick.
   */
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
}

export const Link = (props: Props) => {
  const isLinkExternal = isExternal(props.to as string);

  return isLinkExternal ? (
    <a
      href={props.to as string}
      target="_blank"
      aria-describedby="new-window"
      rel="noopener noreferrer"
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </a>
  ) : (
    <RouterLink {...props} />
  );
};
